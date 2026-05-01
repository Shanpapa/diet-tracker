import { useState } from 'react'

const DAYS = [
  { day:'Hétfő',    dinner:{ name:'Kimchi ramen', shandu:{ detail:'Húsleves alap + 80ml kimchi + 6 gyoza + 2 tojás + 80g noodle', kcal:870 }, edit:{ detail:'Húsleves alap + 80ml kimchi + 4 gyoza + 2 tojás + 50g noodle', kcal:650 } } },
  { day:'Kedd',     dinner:{ name:'Kolbász + tojás + sült zöldség', shandu:{ detail:'120g kolbász + 3 tojás + sült paprika, gomba, paradicsom', kcal:830 }, edit:{ detail:'80g kolbász + 2 tojás + sült paprika, gomba, paradicsom', kcal:620 } } },
  { day:'Szerda',   dinner:{ name:'Csirkemell + rizs / zöldség', shandu:{ detail:'200g csirkemell + 100g rizs + sült cukkini', kcal:880 }, edit:{ detail:'150g csirkemell + 60g rizs + sült cukkini', kcal:660 } } },
  { day:'Csütörtök',dinner:{ name:'Tonhal + sütőkrumpli + saláta', shandu:{ detail:'2 konzerv tonhal + 250g krumpli + uborka-paradicsom saláta', kcal:840 }, edit:{ detail:'1.5 konzerv tonhal + 180g krumpli + saláta', kcal:640 } } },
  { day:'Péntek',   dinner:{ name:'Könnyített csirkepörkölt', shandu:{ detail:'Pörkölt (200g csirke) + 80g tészta', kcal:900 }, edit:{ detail:'Pörkölt (150g csirke) + főtt savoy káposzta', kcal:670 } } },
  { day:'Szombat',  dinner:{ name:'Húsleves', shandu:{ detail:'Húsleves + kis adag csigatészta', kcal:700 }, edit:{ detail:'Húsleves + savoy káposzta, tészta nélkül', kcal:520 } } },
  { day:'Vasárnap', dinner:{ name:'Kolbász + sütőkrumpli + savanyúság', shandu:{ detail:'120g kolbász + 200g krumpli + savanyúság', kcal:750 }, edit:{ detail:'80g kolbász + 150g krumpli + savanyúság', kcal:570 } } },
]

const SHORT = ['H','K','Sze','Cs','P','Szo','V']

const BREAKFAST_SHANDU = [
  { label:'A', detail:'2 bacon grillezve + 2 scrambled egg + gomba + paradicsom + ½ avokádó' },
  { label:'B', detail:'Salmon + 2 főtt tojás + paradicsom, vaj nélkül' },
  { label:'C', detail:'Nagy adag porridge + banán + 1 bacon + 1 főtt tojás' },
]
const BREAKFAST_EDIT = [
  { label:'A (előre kész)', detail:'Chia pudding hűtőből + áfonya + ½ banán + dió' },
  { label:'B', detail:'2 scrambled egg + ½ avokádó + maréknyi mandula' },
  { label:'C', detail:'Görög joghurt (200g) + áfonya + banán + dió' },
]

export default function MealPlanTab({ profile }) {
  const todayRaw = new Date().getDay()
  const todayIdx = todayRaw === 0 ? 6 : todayRaw - 1
  const [sel, setSel] = useState(todayIdx)

  const isLevi = profile.display_name === 'Levi'
  const day = DAYS[sel]
  const mine = isLevi ? day.dinner.shandu : day.dinner.edit
  const theirs = isLevi ? day.dinner.edit : day.dinner.shandu
  const partnerName = isLevi ? 'Edit' : 'Levi'
  const breakfastOpts = isLevi ? BREAKFAST_SHANDU : BREAKFAST_EDIT

  return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:20, overflowX:'auto' }}>
        {SHORT.map((d, i) => (
          <button key={i} onClick={() => setSel(i)}
            style={{ ...s.dayBtn, ...(sel === i ? s.dayBtnActive : {}), ...(i === todayIdx && sel !== i ? s.dayBtnToday : {}) }}>
            {d}
          </button>
        ))}
      </div>

      <div style={s.dayTitle}>{day.day}</div>

      <div style={s.card}>
        <div style={s.sectionLbl}>Vacsora</div>
        <div style={s.mealName}>{day.dinner.name}</div>
        <div style={s.portions}>
          <div style={s.myPortion}>
            <div style={s.portionWho}>Te</div>
            <div style={s.portionDetail}>{mine.detail}</div>
            <div style={s.portionKcal}>{mine.kcal} kcal</div>
          </div>
          <div style={s.theirPortion}>
            <div style={s.portionWho}>{partnerName}</div>
            <div style={s.portionDetail}>{theirs.detail}</div>
            <div style={{ ...s.portionKcal, color:'#a0a0a0' }}>{theirs.kcal} kcal</div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.sectionLbl}>{isLevi ? 'Reggeli (munkán) · ~640 kcal' : 'Reggeli (otthon) · ~480 kcal'}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:10 }}>
          {breakfastOpts.map(o => (
            <div key={o.label} style={s.opt}>
              <strong style={{ color:'#e8e8e8' }}>{o.label}:</strong>{'  '}{o.detail}
            </div>
          ))}
        </div>
      </div>

      {isLevi && (
        <div style={s.card}>
          <div style={s.sectionLbl}>Ebéd (otthon) · ~350 kcal</div>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={s.opt}>2 főtt tojás (batch-ből) + 1 tonhal konzerv + uborka / paradicsom</div>
            <div style={s.opt}>Maradék előző esti vacsora — nem kell gondolkodni</div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  dayBtn: { flexShrink:0, width:38, height:38, borderRadius:8, background:'#1e1e1e', border:'1px solid #2a2a2a', color:'#a0a0a0', fontSize:12, fontWeight:500 },
  dayBtnActive: { background:'#052e16', borderColor:'#22c55e', color:'#22c55e' },
  dayBtnToday: { borderColor:'#3a3a3a' },
  dayTitle: { fontSize:22, fontWeight:600, color:'#e8e8e8', marginBottom:16 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'18px 20px', marginBottom:12 },
  sectionLbl: { fontSize:11, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 },
  mealName: { fontSize:17, fontWeight:600, color:'#e8e8e8', marginBottom:14 },
  portions: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  myPortion: { background:'#052e16', border:'1px solid #14532d', borderRadius:8, padding:12 },
  theirPortion: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:12 },
  portionWho: { fontSize:11, fontWeight:500, color:'#606060', marginBottom:6 },
  portionDetail: { fontSize:12, color:'#a0a0a0', lineHeight:1.5, marginBottom:8 },
  portionKcal: { fontSize:14, fontWeight:600, color:'#22c55e' },
  opt: { fontSize:13, color:'#a0a0a0', background:'#1e1e1e', borderRadius:8, padding:'8px 12px', lineHeight:1.5 },
}
