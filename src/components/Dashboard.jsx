import { useState } from 'react'
import { supabase } from '../supabaseClient'
import TodayTab from './TodayTab'
import WeightTab from './WeightTab'
import MealPlanTab from './MealPlanTab'
import ShoppingTab from './ShoppingTab'
import RecipesTab from './RecipesTab'

const TABS = [
  { id:'today',    label:'Ma',        icon:'◉' },
  { id:'weight',   label:'Súly',      icon:'↗' },
  { id:'meals',    label:'Heti terv', icon:'≡' },
  { id:'shopping', label:'Bevásárlás',icon:'✓' },
  { id:'recipes',  label:'Receptek',  icon:'♨' },
]

export default function Dashboard({ profile, user }) {
  const [tab, setTab] = useState('today')

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div>
          <div style={s.name}>{profile.display_name}</div>
          <div style={s.target}>{profile.calorie_target} kcal / nap · cél: {profile.goal_weight_kg} kg</div>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={s.logout}>Kilépés</button>
      </header>

      <main style={s.main}>
        {tab === 'today'    && <TodayTab    profile={profile} user={user} />}
        {tab === 'weight'   && <WeightTab   profile={profile} user={user} />}
        {tab === 'meals'    && <MealPlanTab profile={profile} />}
        {tab === 'shopping' && <ShoppingTab />}
        {tab === 'recipes'  && <RecipesTab />}
      </main>

      <nav style={s.nav}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...s.navBtn, ...(tab === t.id ? s.navActive : {}) }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:10 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

const s = {
  app: { minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0d0d0d', maxWidth:600, margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'#161616', borderBottom:'1px solid #2a2a2a', position:'sticky', top:0, zIndex:10 },
  name: { fontSize:17, fontWeight:600, color:'#e8e8e8' },
  target: { fontSize:12, color:'#606060', marginTop:2 },
  logout: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#606060', padding:'6px 12px', fontSize:13, cursor:'pointer' },
  main: { flex:1, padding:'20px', paddingBottom:90, overflowY:'auto' },
  nav: { display:'flex', position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:600, background:'#161616', borderTop:'1px solid #2a2a2a', padding:'8px 0 12px' },
  navBtn: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', color:'#606060', padding:'4px 0', fontWeight:500, cursor:'pointer' },
  navActive: { color:'#22c55e' },
}
