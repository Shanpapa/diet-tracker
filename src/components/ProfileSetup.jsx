import { useState } from 'react'
import { supabase } from '../supabaseClient'

const PROFILES = {
  levi: { display_name:'Levi', calorie_target:2200, goal_weight_kg:100, info:'186 cm · 147 kg → 100 kg' },
  edit: { display_name:'Edit', calorie_target:1650, goal_weight_kg:80,  info:'168 cm · 100 kg → 80 kg'  },
}

export default function ProfileSetup({ user, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!selected) return
    setLoading(true)
    const p = PROFILES[selected]
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: p.display_name,
        calorie_target: p.calorie_target,
        goal_weight_kg: p.goal_weight_kg,
      })
      .select()
      .single()
    if (error) { setError(error.message); setLoading(false); return }
    onComplete(data)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Ki vagy?</h1>
        <p style={s.sub}>Válaszd ki a profilod.</p>
        <div style={s.opts}>
          {Object.entries(PROFILES).map(([key, p]) => (
            <div key={key} style={{ ...s.opt, ...(selected === key ? s.optSel : {}) }} onClick={() => setSelected(key)}>
              <div style={s.optName}>{p.display_name}</div>
              <div style={s.optInfo}>{p.info}</div>
              <span style={s.chip}>{p.calorie_target} kcal / nap · cél: {p.goal_weight_kg} kg</span>
            </div>
          ))}
        </div>
        {error && <p style={{ color:'#ef4444', fontSize:13, marginBottom:12 }}>{error}</p>}
        <button style={{ ...s.btn, opacity: selected ? 1 : 0.4 }} onClick={handleSave} disabled={!selected || loading}>
          {loading ? 'Mentés...' : 'Kezdjük!'}
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#0d0d0d', display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:16, padding:'40px 32px', width:'100%', maxWidth:420 },
  title: { fontSize:24, fontWeight:600, color:'#e8e8e8', marginBottom:8 },
  sub: { fontSize:14, color:'#606060', marginBottom:28 },
  opts: { display:'flex', flexDirection:'column', gap:12, marginBottom:24 },
  opt: { background:'#1e1e1e', border:'2px solid #2a2a2a', borderRadius:12, padding:'18px 20px', cursor:'pointer' },
  optSel: { border:'2px solid #22c55e', background:'#052e16' },
  optName: { fontSize:18, fontWeight:600, color:'#e8e8e8', marginBottom:4 },
  optInfo: { fontSize:13, color:'#a0a0a0', marginBottom:10 },
  chip: { fontSize:12, color:'#22c55e', background:'#052e16', border:'1px solid #14532d', borderRadius:20, padding:'3px 10px', fontWeight:500 },
  btn: { width:'100%', background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600 },
}
