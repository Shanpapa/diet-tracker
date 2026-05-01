import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 12px' }}>
        <div style={{ fontSize:12, color:'#606060' }}>{label}</div>
        <div style={{ fontSize:16, fontWeight:600, color:'#22c55e' }}>{payload[0].value} kg</div>
      </div>
    )
  }
  return null
}

export default function WeightTab({ profile, user }) {
  const [logs, setLogs] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadLogs() }, [])

  async function loadLogs() {
    setLoading(true)
    const { data } = await supabase.from('weight_logs').select('*')
      .eq('user_id', user.id).order('logged_at', { ascending:true })
    setLogs(data || [])
    setLoading(false)
  }

  async function logWeight(e) {
    e.preventDefault()
    if (!newWeight) return
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('weight_logs').upsert(
      { user_id:user.id, weight_kg:parseFloat(newWeight), logged_at:today },
      { onConflict:'user_id,logged_at' }
    )
    setNewWeight('')
    await loadLogs()
    setSaving(false)
  }

  const latest = logs[logs.length - 1]
  const first = logs[0]
  const lost = first && latest ? (first.weight_kg - latest.weight_kg).toFixed(1) : '0'
  const toGoal = latest ? (latest.weight_kg - profile.goal_weight_kg).toFixed(1) : '—'
  const chartData = logs.map(l => ({ date: l.logged_at.slice(5), súly: parseFloat(l.weight_kg) }))

  if (loading) return <div style={{ color:'#606060', textAlign:'center', paddingTop:40 }}>betöltés...</div>

  return (
    <div>
      <div style={s.statsRow}>
        <div style={s.stat}><div style={s.statVal}>{latest ? latest.weight_kg : '—'} kg</div><div style={s.statLbl}>jelenlegi</div></div>
        <div style={s.stat}><div style={{ ...s.statVal, color:'#22c55e' }}>−{lost} kg</div><div style={s.statLbl}>leadva</div></div>
        <div style={s.stat}><div style={s.statVal}>{toGoal} kg</div><div style={s.statLbl}>célsúlyig</div></div>
      </div>

      <form onSubmit={logWeight} style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
          placeholder="pl. 144.5 kg" style={s.input} />
        <button type="submit" style={s.btn} disabled={saving}>{saving ? '...' : 'Rögzít'}</button>
      </form>

      {logs.length > 1 ? (
        <div style={s.chartCard}>
          <div style={{ fontSize:13, color:'#606060', marginBottom:12, fontWeight:500 }}>Súlygörbe</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top:10, right:10, left:-20, bottom:0 }}>
              <XAxis dataKey="date" tick={{ fill:'#606060', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto','auto']} tick={{ fill:'#606060', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={profile.goal_weight_kg} stroke="#14532d" strokeDasharray="4 4"
                label={{ value:'cél', fill:'#22c55e', fontSize:11 }} />
              <Line type="monotone" dataKey="súly" stroke="#22c55e" strokeWidth={2}
                dot={{ fill:'#22c55e', r:4 }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={s.empty}>Rögzítsd az első néhány mérést — a grafikon ekkor jelenik meg.</div>
      )}

      {logs.length > 0 && (
        <div style={s.logList}>
          <div style={s.logHeader}>Előzmények</div>
          {[...logs].reverse().slice(0, 12).map(l => (
            <div key={l.id} style={s.logRow}>
              <span style={{ color:'#a0a0a0' }}>{l.logged_at}</span>
              <span style={{ color:'#e8e8e8', fontWeight:500 }}>{l.weight_kg} kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  statsRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 },
  stat: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'14px 12px', textAlign:'center' },
  statVal: { fontSize:20, fontWeight:600, color:'#e8e8e8', lineHeight:1, marginBottom:6 },
  statLbl: { fontSize:11, color:'#606060' },
  input: { flex:1, background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'12px 14px', color:'#e8e8e8', fontSize:15, outline:'none' },
  btn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:'12px 20px', fontSize:15, fontWeight:600 },
  chartCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'18px 16px', marginBottom:20 },
  empty: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:24, textAlign:'center', color:'#606060', fontSize:14, marginBottom:20 },
  logList: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'0 20px' },
  logHeader: { fontSize:12, color:'#606060', fontWeight:500, padding:'14px 0 10px', borderBottom:'1px solid #2a2a2a' },
  logRow: { display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #1e1e1e', fontSize:14 },
}
