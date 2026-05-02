import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MEAL_LABELS = { reggeli:'Reggeli', tizorai:'Tízórai', ebed:'Ebéd', uzsonna:'Uzsonna', vacsora:'Vacsora' }
const MEAL_ORDER = ['reggeli','tizorai','ebed','uzsonna','vacsora']
const DAY_SHORT = ['H','K','Sze','Cs','P','Szo','V']

function PatchNotes({ notes }) {
  const [open, setOpen] = useState(true)
  if (!notes) return null
  return (
    <div style={s.patchCard}>
      <div style={s.patchHeader} onClick={() => setOpen(!open)}>
        <div>
          <div style={s.patchBadge}>HETI ÖSSZEFOGLALÓ</div>
          <div style={s.patchTitle}>{notes.cim}</div>
        </div>
        <span style={{ fontSize:11, color:'#606060' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={s.patchBody}>
          <div style={s.patchRow}>
            <span style={s.patchLabel}>Fehérje alap B</span>
            <span style={s.patchValue}>{notes.feherje_alap_b}</span>
          </div>
          <div style={s.patchRow}>
            <span style={s.patchLabel}>Élvezeti ételek</span>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {notes.elvezetiek.map((e,i) => (
                <span key={i} style={s.chip}>{e}</span>
              ))}
            </div>
          </div>
          {notes.highlights && (
            <div style={s.patchHighlights}>
              {notes.highlights.map((h,i) => (
                <div key={i} style={s.highlight}>
                  <span style={s.dot}>◆</span>
                  <span style={{ fontSize:12, color:'#a0a0a0', lineHeight:1.5 }}>{h}</span>
                </div>
              ))}
            </div>
          )}
          {notes.macro_cel && (
            <div style={s.macroCel}>
              <span style={s.patchLabel}>Makró cél</span>
              <div style={{ fontSize:12, color:'#606060', marginTop:4 }}>
                Levi: {notes.macro_cel.levi}<br/>Edit: {notes.macro_cel.edit}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MealCard({ meal, myKey, partnerKey, partnerName }) {
  const [open, setOpen] = useState(false)
  const mine = meal[myKey]
  const theirs = meal[partnerKey]
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div>
          <div style={s.mealType}>{MEAL_LABELS[meal.type]}</div>
          <div style={s.mealName}>{meal.name}</div>
        </div>
        <div style={s.myKcal}>{mine.total_kcal} kcal</div>
      </div>
      <div style={s.ingList}>
        {mine.items.map((item, idx) => (
          <div key={idx} style={s.ingRow}>
            <span style={s.ingName}>{item.name}</span>
            <span style={s.ingAmt}>{item.amount}</span>
            <span style={s.ingKcal}>{item.kcal} kcal</span>
          </div>
        ))}
      </div>
      <div style={{ ...s.partnerBar, ...(open ? s.partnerBarOpen : {}) }} onClick={() => setOpen(!open)}>
        <span style={s.partnerLbl}>{partnerName}</span>
        <span style={s.partnerKcal}>{theirs.total_kcal} kcal</span>
        <span style={{ fontSize:10, color:'#606060' }}>{open ? '▲ bezár' : '▼ részletek'}</span>
      </div>
      {open && (
        <div style={s.partnerExpanded}>
          {theirs.items.map((item, idx) => (
            <div key={idx} style={s.partnerIngRow}>
              <span style={s.ingName}>{item.name}</span>
              <span style={s.ingAmt}>{item.amount}</span>
              <span style={s.ingKcal}>{item.kcal} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MealPlanTab({ profile }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importing, setImporting] = useState(false)
  const [importErr, setImportErr] = useState('')
  const todayRaw = new Date().getDay()
  const todayIdx = todayRaw === 0 ? 6 : todayRaw - 1
  const [selDay, setSelDay] = useState(todayIdx)
  const isLevi = profile.display_name === 'Levi'
  const myKey = isLevi ? 'levi' : 'edit'
  const partnerKey = isLevi ? 'edit' : 'levi'
  const partnerName = isLevi ? 'Edit' : 'Levi'

  useEffect(() => { loadPlan() }, [])

  async function loadPlan() {
    const { data } = await supabase.from('meal_plans').select('*')
      .order('week_start', { ascending:false }).limit(1).maybeSingle()
    setPlan(data?.plan_data || null)
    setLoading(false)
  }

  async function handleImport(e) {
    e.preventDefault()
    setImporting(true)
    setImportErr('')
    try {
      const parsed = JSON.parse(importJson)
      if (!parsed.days || !parsed.week_start) throw new Error('Hiányzó week_start vagy days mező')
      const { error } = await supabase.from('meal_plans').insert({ week_start:parsed.week_start, plan_data:parsed })
      if (error) throw error
      await loadPlan()
      setShowImport(false)
      setImportJson('')
    } catch(err) { setImportErr('Hiba: ' + err.message) }
    setImporting(false)
  }

  if (loading) return <div style={{ color:'#606060', textAlign:'center', paddingTop:40 }}>betöltés...</div>

  if (showImport) return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => { setShowImport(false); setImportErr('') }} style={s.backBtn}>← Vissza</button>
        <span style={{ fontSize:15, fontWeight:500, color:'#e8e8e8' }}>Heti terv importálása</span>
      </div>
      <p style={{ fontSize:13, color:'#a0a0a0', marginBottom:12, lineHeight:1.6 }}>
        Illeszd be az új heti tervet JSON formátumban.
      </p>
      <form onSubmit={handleImport}>
        <textarea value={importJson} onChange={e => setImportJson(e.target.value)}
          placeholder={'{\n  "week_start": "2026-05-11",\n  "days": [...]\n}'}
          style={s.textarea} rows={16} />
        {importErr && <div style={s.errBox}>{importErr}</div>}
        <button type="submit" disabled={importing || !importJson.trim()} style={s.greenBtn}>
          {importing ? 'Betöltés...' : 'Importálás'}
        </button>
      </form>
    </div>
  )

  if (!plan) return (
    <div style={s.emptyWrap}>
      <div style={{ fontSize:15, fontWeight:500, color:'#e8e8e8', marginBottom:8 }}>Nincs betöltve heti terv</div>
      <div style={{ fontSize:13, color:'#606060', marginBottom:20 }}>Importálj egy új tervet az alábbi gombbal.</div>
      <button onClick={() => setShowImport(true)} style={s.greenBtn}>+ Terv importálása</button>
    </div>
  )

  const dayData = plan.days[selDay]

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:12, color:'#606060' }}>Hét: {plan.week_start}</span>
        <button onClick={() => setShowImport(true)} style={s.swapBtn}>↺ Új terv</button>
      </div>

      <PatchNotes notes={plan.patch_notes} />

      <div style={{ display:'flex', gap:6, marginBottom:20, overflowX:'auto' }}>
        {DAY_SHORT.map((d,i) => (
          <button key={i} onClick={() => setSelDay(i)}
            style={{ ...s.dayBtn, ...(selDay===i ? s.dayActive : {}), ...(i===todayIdx && selDay!==i ? s.dayToday : {}) }}>
            {d}
          </button>
        ))}
      </div>

      <div style={s.dayTitle}>{dayData.day}</div>

      {MEAL_ORDER.map(mealType => {
        const meal = dayData.meals.find(m => m.type === mealType)
        if (!meal) return null
        return (
          <MealCard key={mealType} meal={meal} myKey={myKey} partnerKey={partnerKey} partnerName={partnerName} />
        )
      })}
    </div>
  )
}

const s = {
  patchCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, overflow:'hidden', marginBottom:16 },
  patchHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'14px 18px', cursor:'pointer' },
  patchBadge: { fontSize:10, fontWeight:500, color:'#22c55e', letterSpacing:'1px', marginBottom:4 },
  patchTitle: { fontSize:14, fontWeight:500, color:'#e8e8e8' },
  patchBody: { padding:'0 18px 16px', borderTop:'1px solid #2a2a2a', paddingTop:14, display:'flex', flexDirection:'column', gap:12 },
  patchRow: { display:'flex', flexDirection:'column', gap:6 },
  patchLabel: { fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px' },
  patchValue: { fontSize:13, color:'#a0a0a0' },
  chip: { fontSize:11, color:'#22c55e', background:'#052e16', border:'1px solid #14532d', borderRadius:20, padding:'3px 10px' },
  patchHighlights: { display:'flex', flexDirection:'column', gap:6, borderTop:'1px solid #2a2a2a', paddingTop:10 },
  highlight: { display:'flex', gap:8, alignItems:'flex-start' },
  dot: { fontSize:8, color:'#22c55e', marginTop:3, flexShrink:0 },
  macroCel: { borderTop:'1px solid #2a2a2a', paddingTop:10 },
  dayBtn: { flexShrink:0, width:38, height:38, borderRadius:8, background:'#1e1e1e', border:'1px solid #2a2a2a', color:'#a0a0a0', fontSize:12, fontWeight:500 },
  dayActive: { background:'#052e16', borderColor:'#22c55e', color:'#22c55e' },
  dayToday: { borderColor:'#3a3a3a' },
  dayTitle: { fontSize:22, fontWeight:600, color:'#e8e8e8', marginBottom:16 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, overflow:'hidden', marginBottom:12 },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'16px 18px 12px' },
  mealType: { fontSize:11, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 },
  mealName: { fontSize:15, fontWeight:500, color:'#e8e8e8' },
  myKcal: { fontSize:16, fontWeight:600, color:'#22c55e', flexShrink:0 },
  ingList: { borderTop:'1px solid #2a2a2a', padding:'10px 18px 12px' },
  ingRow: { display:'flex', gap:8, padding:'5px 0', borderBottom:'1px solid #1a1a1a', alignItems:'center' },
  ingName: { flex:1, fontSize:13, color:'#e8e8e8' },
  ingAmt: { fontSize:13, color:'#a0a0a0', minWidth:70, textAlign:'right' },
  ingKcal: { fontSize:12, color:'#606060', minWidth:60, textAlign:'right' },
  partnerBar: { display:'flex', alignItems:'center', gap:8, padding:'11px 18px', borderTop:'1px solid #2a2a2a', cursor:'pointer', background:'#1a1a1a' },
  partnerBarOpen: { background:'#1e1e1e', borderBottom:'1px solid #2a2a2a' },
  partnerLbl: { fontSize:12, color:'#606060', fontWeight:500 },
  partnerKcal: { fontSize:13, fontWeight:500, color:'#a0a0a0', flex:1 },
  partnerExpanded: { background:'#1a1a1a', padding:'8px 18px 14px' },
  partnerIngRow: { display:'flex', gap:8, padding:'5px 0', borderBottom:'1px solid #222', alignItems:'center' },
  backBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#a0a0a0', padding:'8px 14px', fontSize:13 },
  swapBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#606060', padding:'6px 12px', fontSize:13 },
  textarea: { width:'100%', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'12px 14px', color:'#e8e8e8', fontSize:12, fontFamily:'monospace', outline:'none', resize:'vertical', lineHeight:1.6, marginBottom:12 },
  greenBtn: { width:'100%', background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600 },
  errBox: { background:'#1a0000', border:'1px solid #3a0000', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:12 },
  emptyWrap: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'32px 24px', textAlign:'center' },
}
