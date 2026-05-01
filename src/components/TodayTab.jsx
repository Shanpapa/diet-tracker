import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MEALS = [
  { key:'breakfast',    label:'Reggeli',   kcal_shandu:640, kcal_edit:480, time:'reggel' },
  { key:'snack',        label:'Ebéd / nasi',kcal_shandu:350, kcal_edit:170, time:'délben' },
  { key:'dinner',       label:'Vacsora',   kcal_shandu:900, kcal_edit:700, time:'17:00' },
  { key:'evening_snack',label:'Esti nasi', kcal_shandu:60,  kcal_edit:80,  time:'este' },
]

const today = () => new Date().toISOString().split('T')[0]

export default function TodayTab({ profile, user }) {
  const [checks, setChecks] = useState({ breakfast:false, snack:false, dinner:false, evening_snack:false })
  const [saving, setSaving] = useState(false)
  const isShandu = profile.display_name === 'Shandu'

  useEffect(() => { loadChecks() }, [])

  async function loadChecks() {
    const { data } = await supabase.from('meal_checks').select('*')
      .eq('user_id', user.id).eq('check_date', today()).single()
    if (data) setChecks({ breakfast:data.breakfast, snack:data.snack, dinner:data.dinner, evening_snack:data.evening_snack })
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

  const eaten = MEALS.reduce((sum, m) => checks[m.key] ? sum + (isShandu ? m.kcal_shandu : m.kcal_edit) : sum, 0)
  const target = profile.calorie_target
  const pct = Math.min(Math.round((eaten / target) * 100), 100)
  const remaining = target - eaten
  const dateStr = new Date().toLocaleDateString('hu-HU', { weekday:'long', month:'long', day:'numeric' })

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <span style={{ fontSize:15, color:'#a0a0a0', fontWeight:500 }}>{dateStr}</span>
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
        {MEALS.map(m => {
          const kcal = isShandu ? m.kcal_shandu : m.kcal_edit
          const done = checks[m.key]
          return (
            <div key={m.key} style={{ ...s.mealItem, ...(done ? s.mealDone : {}) }} onClick={() => toggle(m.key)}>
              <div style={{ ...s.cb, ...(done ? s.cbDone : {}) }}>
                {done && <span style={{ color:'#0d1a0d', fontSize:12, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:500, color:'#e8e8e8' }}>{m.label}</div>
                <div style={{ fontSize:12, color:'#606060', marginTop:2 }}>{m.time}</div>
              </div>
              <div style={{ fontSize:13, color:'#a0a0a0', fontWeight:500 }}>~{kcal} kcal</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  kcalCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'18px 20px', marginBottom:20 },
  bigNum: { fontSize:24, fontWeight:600, color:'#e8e8e8', lineHeight:1 },
  smallLabel: { fontSize:12, color:'#606060', marginTop:4 },
  progressBg: { background:'#2a2a2a', borderRadius:4, height:6, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:4, transition:'width 0.3s' },
  mealItem: { display:'flex', alignItems:'center', gap:14, background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'16px 18px', cursor:'pointer' },
  mealDone: { background:'#052e16', borderColor:'#14532d' },
  cb: { width:24, height:24, borderRadius:6, border:'2px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  cbDone: { background:'#22c55e', borderColor:'#22c55e' },
}
