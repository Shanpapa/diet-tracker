import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Hibás email vagy jelszó.')
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoMark}>◆</span>
          <span style={s.logoText}>Diet Tracker</span>
        </div>
        <p style={s.sub}>Shandu &amp; Edit</p>
        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={s.input} placeholder="email@example.com" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Jelszó</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={s.input} placeholder="••••••••" required />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Belépés...' : 'Belépés'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#0d0d0d', display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:16, padding:'40px 32px', width:'100%', maxWidth:380 },
  logo: { display:'flex', alignItems:'center', gap:10, marginBottom:8 },
  logoMark: { color:'#22c55e', fontSize:20 },
  logoText: { fontSize:22, fontWeight:600, color:'#e8e8e8' },
  sub: { fontSize:14, color:'#606060', marginBottom:32 },
  form: { display:'flex', flexDirection:'column', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, color:'#a0a0a0', fontWeight:500 },
  input: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'12px 14px', color:'#e8e8e8', fontSize:15, outline:'none' },
  error: { color:'#ef4444', fontSize:13, background:'#1a0000', border:'1px solid #3a0000', borderRadius:8, padding:'10px 12px' },
  btn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600, marginTop:8 },
}
