import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const DAY_LABELS = ['H','K','Sze','Cs','P','Szo','V']
const MEAL_KEYS = ['reggeli','tizorai','ebed','uzsonna','vacsora']
const CANDLE_AREA_H = 110
const TARGET_POS = 75  // px from bottom inside candleArea

export default function WeeklySummary({ plan, user, profile }) {
  const [checks, setChecks] = useState({})
  const [overrides, setOverrides] = useState({})
  const [loading, setLoading] = useState(true)

  const isLevi = profile.display_name === 'Levi'
  const myKey = isLevi ? 'levi' : 'edit'
  const kcalTarget = profile.calorie_target
  const proteinTarget = isLevi ? 140 : 90

  useEffect(() => { if (plan && user) loadWeekData() }, [plan, user])

  function getWeekDates() {
    if (!plan?.week_start) return []
    return Array.from({ length:7 }, (_,i) => {
      const d = new Date(plan.week_start)
      d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }

  async function loadWeekData() {
    setLoading(true)
    const dates = getWeekDates()
    if (!dates.length) { setLoading(false); return }
    const [cr, or] = await Promise.all([
      supabase.from('meal_checks').select('*').eq('user_id', user.id).in('check_date', dates),
      supabase.from('daily_overrides').select('*').eq('user_id', user.id).in('override_date', dates),
    ])
    const cm = {}
    ;(cr.data||[]).forEach(c => { cm[c.check_date] = c })
    setChecks(cm)
    const om = {}
    ;(or.data||[]).forEach(o => { om[o.override_date+'_'+o.meal_type] = o })
    setOverrides(om)
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
    const isToday = date === today
    const isPast = date < today

    let actualKcal = 0, actualProtein = 0, checkedCount = 0
    MEAL_KEYS.forEach(key => {
      if (!dayChecks?.[key]) return
      checkedCount++
      const ov = overrides[date+'_'+key]
      if (ov) {
        actualKcal += ov.total_kcal || 0
        actualProtein += ov.total_protein || 0
      } else {
        const meal = dayPlan?.meals?.find(m => m.type === key)
        actualKcal += meal?.[myKey]?.total_kcal || 0
        actualProtein += meal?.[myKey]?.total_protein || 0
      }
    })

    const plannedKcal = dayPlan?.meals?.reduce((s,m) => s + (m[myKey]?.total_kcal||0), 0) || 0
    actualKcal = Math.round(actualKcal)
    actualProtein = Math.round(actualProtein * 10) / 10

    return {
      date, isToday, isFuture, isPast,
      kcal: actualKcal, protein: actualProtein,
      checkedCount, plannedKcal,
      hasData: checkedCount > 0,
      onTarget: actualKcal > 0 && actualKcal <= kcalTarget,
      over: actualKcal > kcalTarget,
      proteinHit: actualProtein >= proteinTarget,
    }
  }

  if (!plan) return null
  if (loading) return <div style={{ color:'#606060', fontSize:12, textAlign:'center', padding:'20px 0' }}>heti adatok betöltése...</div>

  const days = Array.from({length:7}, (_,i) => getDayData(i))
  const activeDays = days.filter(d => d?.kcal > 0)
  const avgKcal = activeDays.length ? Math.round(activeDays.reduce((a,d) => a+d.kcal, 0) / activeDays.length) : 0
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
      <div style={s.header}>
        <span style={s.title}>Heti áttekintés</span>
        <span style={s.targetHint}>{kcalTarget} kcal cél</span>
      </div>

      {/* Chart */}
      <div style={s.chartRow}>
        {days.map((day, i) => {
          if (!day) return null
          const ratio = day.kcal > 0 ? day.kcal / kcalTarget : 0
          // candle height = ratio * TARGET_POS, capped at CANDLE_AREA_H
          const bodyH = Math.min(Math.round(ratio * TARGET_POS), CANDLE_AREA_H)
          // if over target, extra wick above target line
          const wickH = day.over ? Math.min(Math.round((day.kcal - kcalTarget) / kcalTarget * TARGET_POS), CANDLE_AREA_H - TARGET_POS) : 0
          const color = !day.hasData ? '#2a2a2a' : day.over ? '#ef4444' : '#22c55e'
          const opacity = day.isFuture ? 0.3 : 1

          return (
            <div key={i} style={{ ...s.dayCol, opacity }}>
              {/* Candle area — target line is INSIDE here */}
              <div style={s.candleArea}>
                {/* TARGET LINE — same coordinate system as candle */}
                <div style={{ ...s.targetLine, bottom: TARGET_POS }} />

                {/* Over-target wick */}
                {day.over && wickH > 0 && (
                  <div style={{
                    position:'absolute',
                    bottom: TARGET_POS,
                    left:'50%', transform:'translateX(-50%)',
                    width: 3, height: wickH,
                    background:'#ef4444',
                    borderRadius:'2px 2px 0 0',
                  }} />
                )}

                {/* Candle body */}
                {day.hasData && bodyH > 0 && (
                  <div style={{
                    position:'absolute',
                    bottom: 0,
                    left:'50%', transform:'translateX(-50%)',
                    width: 18,
                    height: bodyH,
                    background: color,
                    borderRadius:'3px 3px 0 0',
                    transition:'height 0.4s ease',
                  }} />
                )}

                {/* Empty placeholder */}
                {!day.hasData && !day.isFuture && (
                  <div style={{
                    position:'absolute', bottom:0,
                    left:'50%', transform:'translateX(-50%)',
                    width:18, height:20,
                    border:'1px solid #2a2a2a',
                    borderRadius:'3px 3px 0 0',
                  }} />
                )}

                {/* Protein dot — above candle */}
                {day.hasData && (
                  <div style={{
                    position:'absolute',
                    bottom: bodyH + 5,
                    left:'50%', transform:'translateX(-50%)',
                    width:6, height:6, borderRadius:'50%',
                    background: day.proteinHit ? '#3b82f6' : '#333',
                  }} />
                )}
              </div>

              {/* Kcal label */}
              <div style={{ fontSize:10, color: day.over ? '#ef4444' : '#606060', textAlign:'center', marginTop:3, minHeight:13 }}>
                {day.kcal > 0 ? day.kcal : ''}
              </div>

              {/* Meal dots */}
              <div style={s.dots}>
                {MEAL_KEYS.map((_,mi) => (
                  <div key={mi} style={{
                    width:4, height:4, borderRadius:'50%',
                    background: mi < day.checkedCount ? color : '#2a2a2a',
                  }} />
                ))}
              </div>

              {/* Day label */}
              <div style={{ fontSize:11, textAlign:'center', color: day.isToday ? '#22c55e' : '#606060', fontWeight: day.isToday ? 600 : 400 }}>
                {DAY_LABELS[i]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {[['#22c55e','Cél alatt'],['#ef4444','Túllépve'],['#3b82f6','Fehérje ✓']].map(([c,l]) => (
          <div key={l} style={s.legendItem}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:c }} />
            <span>{l}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
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
            {streak}{streak >= 3 ? ' 🔥' : ''}
          </div>
          <div style={s.statLbl}>streak</div>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'16px 18px', marginTop:20 },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  title: { fontSize:11, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px' },
  targetHint: { fontSize:10, color:'#f59e0b99' },
  chartRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:6 },
  dayCol: { display:'flex', flexDirection:'column', alignItems:'center', width:36 },
  candleArea: { position:'relative', width:36, height: CANDLE_AREA_H },
  targetLine: { position:'absolute', left:0, right:0, height:1, borderTop:'1px dashed #f59e0b88', zIndex:2 },
  dots: { display:'flex', gap:2, justifyContent:'center', marginTop:3, marginBottom:3 },
  legend: { display:'flex', gap:14, justifyContent:'center', marginBottom:12, marginTop:4 },
  legendItem: { display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#606060' },
  statsRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, borderTop:'1px solid #2a2a2a', paddingTop:12 },
  stat: { textAlign:'center' },
  statVal: { fontSize:20, fontWeight:600, color:'#e8e8e8', lineHeight:1, marginBottom:4 },
  statLbl: { fontSize:11, color:'#606060' },
}
