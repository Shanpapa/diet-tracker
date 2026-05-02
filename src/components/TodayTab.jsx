import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MEAL_ORDER = ['reggeli','tizorai','ebed','uzsonna','vacsora']
const MEAL_LABELS = { reggeli:'Reggeli', tizorai:'Tízórai', ebed:'Ebéd', uzsonna:'Uzsonna', vacsora:'Vacsora' }
const MEAL_TIMES = { reggeli:'reggel', tizorai:'délelőtt', ebed:'délben', uzsonna:'délután', vacsora:'17:00' }

const today = () => new Date().toISOString().split('T')[0]

export default function TodayTab({ profile, user }) {
  const [checks, setChecks] = useState({ reggeli:false, tizorai:false, ebed:false, uzsonna:false, vacsora:false })
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isLevi = profile.display_name === 'Levi'
  const myKey = isLevi ? 'levi' : 'edit'

  const todayRaw = new Date().getDay()
  const todayIdx = todayRaw === 0 ? 6 : todayRaw - 1

  useEffect(() => {
    Promise.all([loadChecks(), loadPlan()]).then(() => setLoading(false))
  }, [])

  async function loadChecks() {
    const { data } = await supabase.from('meal_checks').select('*')
      .eq('user_id', user.id).eq('check_date', today()).single()
    if (data) setChecks({ reggeli:data.reggeli, tizorai:data.tizorai, ebed:data.ebed, uzsonna:data.uzsonna, vacsora:data.vacsora })
  }

  async function loadPlan() {
    const { data } = await supabase.from('meal_plans').select('*')
      .order('week_start', { ascending:false }).limit(1).maybeSingle()
    setPlan(data?.plan_data || null)
  }

  async function toggle(key) {
    const next = { ...checks, [key]: !checks[key] }
    setChecks(next)
    setSaving(true)
    await supabase.from('meal_checks').upsert(
      { user_id:user.id, check_date:today(), ...next },
      { onConflict:'user_id,check_date' }
    )
    setSaving(false)
  }

  if (loading) return <div style={{ color:'#606060', textAlign:'center', paddingTop:40 }}>betöltés...</div>

  if (!plan) return (
    <div>
      <div style={s.dateRow}>
        <span style={s.date}>{new Date().toLocaleDateString('hu-HU', { weekday:'long', month:'long', day:'numeric' })}</span>
      </div>
      <div style={s.noPlan}>
        <div style={{ fontSize:15, fontWeight:500, color:'#e8e8e8', marginBottom:8 }}>Nincs betöltve heti terv</div>
        <div style={{ fontSize:13, color:'#606060' }}>Importálj egy tervet a Heti terv fülön, majd gyere vissza.</div>
      </div>
    </div>
  )

  const dayData = plan.days[todayIdx]
  const dayMeals = dayData?.meals || []

  const eaten = MEAL_ORDER.reduce((sum, key) => {
    if (!checks[key]) return sum
    const meal = dayMeals.find(m => m.type === key)
    return sum + (meal?.[myKey]?.total_kcal || 0)
  }, 0)

  const target = profile.calorie_target
  const pct = Math.min(Math.round((eaten / target) * 100), 100)
  const remaining = target - eaten
  const dateStr = new Date().toLocaleDateString('hu-HU', { weekday:'long', month:'long', day:'numeric' })

  return (
    <div>
      <div style={s.dateRow}>
        <span style={s.date}>{dateStr}</span>
        {saving && <span style={{ fontSize:12, color:'#606060' }}>mentés...</span>}
      </div>

      <div style={s.kcalCard}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={s.bigNum}>{eaten} kcal</div>
            <div style={s.smallLabel}>elfogyasztva</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ ...s.bigNum, color: remaining >= 0 ? '#22c55e' : '#ef4444' }}>{Math.abs(remaining)} kcal</div>
            <div style={s.smallLabel}>{remaining >= 0 ? 'még marad' : 'túllépve'}</div>
          </div>
        </div>
        <div style={s.progressBg}>
          <div style={{ ...s.progressFill, width:`${pct}%`, background: pct >= 100 ? '#ef4444' : '#22c55e' }} />
        </div>
        <div style={{ fontSize:12, color:'#606060', marginTop:6 }}>{pct}% — cél: {target} kcal</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {MEAL_ORDER.map(key => {
          const meal = dayMeals.find(m => m.type === key)
          const kcal = meal?.[myKey]?.total_kcal || 0
          const name = meal?.name || MEAL_LABELS[key]
          const done = checks[key]
          return (
            <div key={key} style={{ ...s.mealItem, ...(done ? s.mealDone : {}) }} onClick={() => toggle(key)}>
              <div style={{ ...s.cb, ...(done ? s.cbDone : {}) }}>
                {done && <span style={{ color:'#0d1a0d', fontSize:12, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:2 }}>{MEAL_LABELS[key]} · {MEAL_TIMES[key]}</div>
                <div style={{ fontSize:14, fontWeight:500, color:'#e8e8e8' }}>{name}</div>
              </div>
              <div style={{ fontSize:13, color: done ? '#22c55e' : '#a0a0a0', fontWeight:500 }}>{kcal} kcal</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  dateRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  date: { fontSize:15, color:'#a0a0a0', fontWeight:500 },
  kcalCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'18px 20px', marginBottom:20 },
  bigNum: { fontSize:24, fontWeight:600, color:'#e8e8e8', lineHeight:1 },
  smallLabel: { fontSize:12, color:'#606060', marginTop:4 },
  progressBg: { background:'#2a2a2a', borderRadius:4, height:6, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:4, transition:'width 0.3s' },
  mealItem: { display:'flex', alignItems:'center', gap:14, background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'14px 18px', cursor:'pointer' },
  mealDone: { background:'#052e16', borderColor:'#14532d' },
  cb: { width:24, height:24, borderRadius:6, border:'2px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  cbDone: { background:'#22c55e', borderColor:'#22c55e' },
  noPlan: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'32px 24px', textAlign:'center' },
}
