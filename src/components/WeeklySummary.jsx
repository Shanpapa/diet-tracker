import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const DAY_LABELS = ['H','K','Sze','Cs','P','Szo','V']
const MEAL_KEYS = ['reggeli','tizorai','ebed','uzsonna','vacsora']
const CHART_H = 120   // px - total chart area height
const TARGET_H = 80   // px - where the target line sits

export default function WeeklySummary({ plan, user, profile }) {
  const [checks, setChecks] = useState({})      // date -> {reggeli,tizorai,...}
  const [overrides, setOverrides] = useState({}) // date_mealtype -> override
  const [loading, setLoading] = useState(true)

  const isLevi = profile.display_name === 'Levi'
  const myKey = isLevi ? 'levi' : 'edit'
  const kcalTarget = profile.calorie_target
  const proteinTarget = isLevi ? 140 : 90

  useEffect(() => {
    if (plan && user) loadWeekData()
  }, [plan, user])

  function getWeekDates() {
    if (!plan?.week_start) return []
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(plan.week_start)
      d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }

  async function loadWeekData() {
    setLoading(true)
    const dates = getWeekDates()
    if (dates.length === 0) { setLoading(false); return }

    const [checksRes, overridesRes] = await Promise.all([
      supabase.from('meal_checks').select('*').eq('user_id', user.id).in('check_date', dates),
      supabase.from('daily_overrides').select('*').eq('user_id', user.id).in('override_date', dates),
    ])

    const checksMap = {}
    ;(checksRes.data || []).forEach(c => { checksMap[c.check_date] = c })
    setChecks(checksMap)

    const overridesMap = {}
    ;(overridesRes.data || []).forEach(o => { overridesMap[o.override_date + '_' + o.meal_type] = o })
    setOverrides(overridesMap)
    setLoading(false)
  }

  function getDayData(dayIdx) {
    const dates = getWeekDates()
    const date = dates[dayIdx]
    if (!date) return null
    const dayPlan = plan?.days[dayIdx]
    const dayChecks = checks[date]
    const today = new Date().toISOString().split('T')[0]
    const isFuture = date > today
    const isPast = date < today
    const isToday = date === today

    if (!dayChecks && isFuture) return { date, status:'future', kcal:0, protein:0, checkedCount:0, plannedKcal:0 }

    let actualKcal = 0
    let actualProtein = 0
    let checkedCount = 0

    MEAL_KEYS.forEach(key => {
      const isChecked = dayChecks?.[key]
      if (!isChecked) return
      checkedCount++
      const override = overrides[date + '_' + key]
      if (override) {
        actualKcal += override.total_kcal || 0
        actualProtein += override.total_protein || 0
      } else {
        const meal = dayPlan?.meals?.find(m => m.type === key)
        actualKcal += meal?.[myKey]?.total_kcal || 0
        actualProtein += meal?.[myKey]?.total_protein || 0
      }
    })

    const plannedKcal = dayPlan?.meals?.reduce((sum, m) => sum + (m[myKey]?.total_kcal || 0), 0) || 0

    return {
      date, status: checkedCount === 0 && isPast ? 'missed' : checkedCount === 0 ? 'empty' : 'data',
      kcal: Math.round(actualKcal),
      protein: Math.round(actualProtein * 10) / 10,
      checkedCount,
      plannedKcal,
      isToday,
      proteinHit: actualProtein >= proteinTarget,
      onTarget: actualKcal > 0 && actualKcal <= kcalTarget,
      over: actualKcal > kcalTarget,
    }
  }

  if (!plan) return null
  if (loading) return <div style={{ color:'#606060', fontSize:12, textAlign:'center', padding:'16px 0' }}>heti adatok betöltése...</div>

  const days = Array.from({ length: 7 }, (_, i) => getDayData(i))
  const activeDays = days.filter(d => d?.kcal > 0)
  const avgKcal = activeDays.length ? Math.round(activeDays.reduce((a,d) => a + d.kcal, 0) / activeDays.length) : 0
  const onTargetDays = activeDays.filter(d => d.onTarget).length
  const streak = (() => {
    let s = 0
    const today = new Date().toISOString().split('T')[0]
    for (let i = 6; i >= 0; i--) {
      const d = days[i]
      if (!d || d.date > today) continue
      if (d.kcal > 0 && d.onTarget) s++
      else break
    }
    return s
  })()

  return (
    <div style={s.wrap}>
      <div style={s.title}>Heti áttekintés</div>

      {/* Candlestick chart */}
      <div style={s.chartWrap}>
        {/* Target line label */}
        <div style={s.targetLabel}>{kcalTarget} kcal cél</div>

        <div style={s.chart}>
          {/* Target line */}
          <div style={{ ...s.targetLine, bottom: TARGET_H }} />

          {/* Day columns */}
          {days.map((day, i) => {
            if (!day) return null
            const ratio = day.kcal > 0 ? day.kcal / kcalTarget : 0
            const candleH = Math.min(ratio * TARGET_H, CHART_H)
            const isOver = day.kcal > kcalTarget
            const overH = isOver ? Math.min((day.kcal - kcalTarget) / kcalTarget * TARGET_H, CHART_H - TARGET_H) : 0
            const hasData = day.kcal > 0
            const candleColor = !hasData ? '#2a2a2a' : isOver ? '#ef4444' : '#22c55e'
            const candleOpacity = day.status === 'future' ? 0.3 : 1

            return (
              <div key={i} style={{ ...s.dayCol, opacity: candleOpacity }}>
                {/* Candle area */}
                <div style={s.candleArea}>
                  {/* Over-target wick (red cap) */}
                  {isOver && (
                    <div style={{
                      position:'absolute',
                      bottom: TARGET_H,
                      left:'50%', transform:'translateX(-50%)',
                      width: 3,
                      height: overH,
                      background:'#ef4444',
                      borderRadius: '2px 2px 0 0',
                    }} />
                  )}
                  {/* Candle body */}
                  {hasData && (
                    <div style={{
                      position:'absolute',
                      bottom: 0,
                      left:'50%', transform:'translateX(-50%)',
                      width: 18,
                      height: Math.min(candleH, TARGET_H),
                      background: candleColor,
                      borderRadius: '3px 3px 0 0',
                      transition:'height 0.4s ease',
                    }} />
                  )}
                  {/* Empty day ghost */}
                  {!hasData && day.status !== 'future' && (
                    <div style={{
                      position:'absolute',
                      bottom: 0,
                      left:'50%', transform:'translateX(-50%)',
                      width: 18, height: 24,
                      border: '1px solid #2a2a2a',
                      borderRadius: '3px 3px 0 0',
                    }} />
                  )}
                  {/* Protein indicator - small dot above candle */}
                  {hasData && (
                    <div style={{
                      position:'absolute',
                      bottom: Math.min(candleH, TARGET_H) + 4,
                      left:'50%', transform:'translateX(-50%)',
                      width: 6, height: 6,
                      borderRadius:'50%',
                      background: day.proteinHit ? '#3b82f6' : '#3a3a3a',
                    }} />
                  )}
                </div>

                {/* Kcal number */}
                <div style={{ fontSize:10, color: hasData ? (isOver ? '#ef4444' : '#606060') : '#3a3a3a', textAlign:'center', marginTop:4, minHeight:14 }}>
                  {hasData ? day.kcal : ''}
                </div>

                {/* Meal dots */}
                <div style={s.mealDots}>
                  {MEAL_KEYS.map((_, mi) => (
                    <div key={mi} style={{
                      width: 5, height: 5, borderRadius:'50%',
                      background: mi < day.checkedCount ? candleColor : '#2a2a2a',
                    }} />
                  ))}
                </div>

                {/* Day label */}
                <div style={{ ...s.dayLabel, color: day.isToday ? '#22c55e' : '#606060', fontWeight: day.isToday ? 600 : 400 }}>
                  {DAY_LABELS[i]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        <div style={s.legendItem}><div style={{ ...s.legendDot, background:'#22c55e' }}/><span>Cél alatt</span></div>
        <div style={s.legendItem}><div style={{ ...s.legendDot, background:'#ef4444' }}/><span>Túllépve</span></div>
        <div style={s.legendItem}><div style={{ ...s.legendDot, background:'#3b82f6' }}/><span>Fehérje ✓</span></div>
      </div>

      {/* Stats row */}
      <div style={s.statsRow}>
        <div style={s.stat}>
          <div style={s.statVal}>{avgKcal || '—'}</div>
          <div style={s.statLbl}>átlag kcal</div>
        </div>
        <div style={s.stat}>
          <div style={{ ...s.statVal, color:'#22c55e' }}>{onTargetDays}/7</div>
          <div style={s.statLbl}>cél alatt</div>
        </div>
        <div style={s.stat}>
          <div style={{ ...s.statVal, color: streak >= 3 ? '#f59e0b' : '#e8e8e8' }}>
            {streak} {streak >= 3 ? '🔥' : ''}
          </div>
          <div style={s.statLbl}>streak</div>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'16px 18px', marginTop:20 },
  title: { fontSize:12, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:14 },
  chartWrap: { position:'relative', marginBottom:8 },
  targetLabel: { fontSize:10, color:'#606060', marginBottom:4, textAlign:'right' },
  chart: { position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-end', height: CHART_H + 50 },
  targetLine: { position:'absolute', left:0, right:0, height:1, background:'#f59e0b44', borderTop:'1px dashed #f59e0b66', zIndex:1 },
  dayCol: { display:'flex', flexDirection:'column', alignItems:'center', width: 38 },
  candleArea: { position:'relative', width:38, height: CHART_H },
  mealDots: { display:'flex', gap:2, justifyContent:'center', marginBottom:4, marginTop:2 },
  dayLabel: { fontSize:11, textAlign:'center' },
  legend: { display:'flex', gap:12, justifyContent:'center', marginBottom:12, marginTop:4 },
  legendItem: { display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#606060' },
  legendDot: { width:8, height:8, borderRadius:'50%' },
  statsRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, borderTop:'1px solid #2a2a2a', paddingTop:12 },
  stat: { textAlign:'center' },
  statVal: { fontSize:20, fontWeight:600, color:'#e8e8e8', lineHeight:1, marginBottom:4 },
  statLbl: { fontSize:11, color:'#606060' },
}
