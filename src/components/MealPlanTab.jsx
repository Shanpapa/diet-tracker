import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import FoodSearch from './FoodSearch'
import RecipePicker from './RecipePicker'

const MEAL_LABELS = { reggeli:'Reggeli', tizorai:'Tízórai', ebed:'Ebéd', uzsonna:'Uzsonna', vacsora:'Vacsora' }
const MEAL_ORDER = ['reggeli','tizorai','ebed','uzsonna','vacsora']
const DAY_SHORT = ['H','K','Sze','Cs','P','Szo','V']

function PatchNotes({ notes }) {
  const [open, setOpen] = useState(false)
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
              {(notes.elvezetiek||[]).map((e,i) => <span key={i} style={s.chip}>{e}</span>)}
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

function InlineEditor({ mealType, mealName, currentItems, onSave, onCancel }) {
  const [items, setItems] = useState(currentItems || [])
  const [showRecipes, setShowRecipes] = useState(false)

  function addItem(item) { setItems(prev => [...prev, item]) }
  function removeItem(idx) { setItems(prev => prev.filter((_,i) => i !== idx)) }
  const total = items.reduce((a,i) => a + (i.kcal||0), 0)
  const totalP = Math.round(items.reduce((a,i) => a + (i.protein||0), 0) * 10) / 10
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{MEAL_LABELS[mealType]} szerkesztése</div>
          <div style={{ fontSize:16, fontWeight:500, color:'#e8e8e8' }}>{mealName}</div>
        </div>
        <button onClick={onCancel} style={s.backBtn}>✕ Mégse</button>
      </div>
      {items.length > 0 && (
        <div style={s.itemsBox}>
          <div style={s.itemsTitle}>Összetevők</div>
          {items.map((item, idx) => (
            <div key={idx} style={s.itemRow}>
              <span style={s.itemName}>{item.name}</span>
              <span style={s.itemAmt}>{item.amount}</span>
              <span style={s.itemKcal}>{item.kcal} kcal</span>
              <button onClick={() => removeItem(idx)} style={s.removeBtn}>✕</button>
            </div>
          ))}
          <div style={s.itemTotals}>
            <span style={s.totalKcal}>{total} kcal</span>
            <span style={{ fontSize:12, color:'#606060' }}>{totalP}g fehérje</span>
          </div>
        </div>
      )}
      {showRecipes ? (
        <RecipePicker onAdd={addItem} onClose={() => setShowRecipes(false)} />
      ) : (
        <div style={s.searchBox}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:12, color:'#a0a0a0', fontWeight:500 }}>Alapanyag hozzáadása</span>
            <button onClick={() => setShowRecipes(true)} style={{ background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, color:'#22c55e', padding:'6px 12px', fontSize:12, cursor:'pointer' }}>♨ Receptből</button>
          </div>
          <FoodSearch onAdd={addItem} />
        </div>
      )}
      <button onClick={() => onSave(items)} style={s.saveBtn}>✓ Mentés</button>
    </div>
  )
}

function MealCard({ meal, myKey, partnerKey, partnerName, override, onEdit }) {
  const [open, setOpen] = useState(false)
  const mine = override
    ? { items: override.items || [], total_kcal: override.total_kcal }
    : meal[myKey]
  const theirs = meal[partnerKey]
  const isOverride = !!override
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={s.mealType}>{MEAL_LABELS[meal.type]}</span>
            {isOverride && <span style={s.overrideBadge}>módosított</span>}
          </div>
          <div style={s.mealName}>{isOverride ? (override.meal_name || meal.name) : meal.name}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <div style={s.myKcal}>{mine.total_kcal} kcal</div>
          <button onClick={onEdit} style={s.editBtn} title="Szerkesztés">✎</button>
        </div>
      </div>
      <div style={s.ingList}>
        {(mine.items || []).map((item, idx) => (
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
          {(theirs.items || []).map((item, idx) => (
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

export default function MealPlanTab({ profile, user }) {
  const [allPlans, setAllPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importing, setImporting] = useState(false)
  const [importErr, setImportErr] = useState('')
  const [overrides, setOverrides] = useState({})
  const [editingDay, setEditingDay] = useState(null)
  const [editingMeal, setEditingMeal] = useState(null)
  const todayRaw = new Date().getDay()
  const todayIdx = todayRaw === 0 ? 6 : todayRaw - 1
  const [selDay, setSelDay] = useState(todayIdx)
  const isLevi = profile.display_name === 'Levi'
  const myKey = isLevi ? 'levi' : 'edit'
  const partnerKey = isLevi ? 'edit' : 'levi'
  const partnerName = isLevi ? 'Edit' : 'Levi'

  useEffect(() => {
    loadAllPlans()
    if (user) loadOverrides()
  }, [])

  async function loadAllPlans() {
    const { data } = await supabase.from('meal_plans').select('id,week_start,created_at')
      .order('week_start', { ascending:false })
    setAllPlans(data || [])
    if (data && data.length > 0) {
      const savedId = localStorage.getItem('dt_selected_plan')
      const preferred = data.find(p => p.id === savedId) || data[0]
      await loadPlanById(preferred.id)
    } else {
      setLoading(false)
    }
  }

  async function loadPlan() {
    await loadAllPlans()
  }

  async function loadPlanById(id) {
    setLoading(true)
    const { data } = await supabase.from('meal_plans').select('*').eq('id', id).single()
    setPlan(data?.plan_data || null)
    setSelectedPlanId(id)
    localStorage.setItem('dt_selected_plan', id)
    setLoading(false)
  }

  async function loadOverrides() {
    const { data } = await supabase.from('daily_overrides').select('*').eq('user_id', user.id)
    const map = {}
    ;(data || []).forEach(o => { map[o.override_date + '_' + o.meal_type] = o })
    setOverrides(map)
  }

  function getDateForDayIdx(dayIdx) {
    if (!plan?.week_start) return ''
    const d = new Date(plan.week_start)
    d.setDate(d.getDate() + dayIdx)
    return d.toISOString().split('T')[0]
  }

  function getOverride(dayIdx, mealType) {
    const date = getDateForDayIdx(dayIdx)
    return overrides[date + '_' + mealType] || null
  }

  async function saveOverride(dayIdx, mealType, mealName, items) {
    if (!user) return
    const date = getDateForDayIdx(dayIdx)
    const totals = {
      total_kcal: items.reduce((a,i) => a + (i.kcal||0), 0),
      total_protein: Math.round(items.reduce((a,i) => a + (i.protein||0), 0) * 10) / 10,
      total_carbs: Math.round(items.reduce((a,i) => a + (i.carbs||0), 0) * 10) / 10,
      total_fat: Math.round(items.reduce((a,i) => a + (i.fat||0), 0) * 10) / 10,
      total_fiber: Math.round(items.reduce((a,i) => a + (i.fiber||0), 0) * 10) / 10,
    }
    const record = { user_id:user.id, override_date:date, meal_type:mealType, meal_name:mealName, items, ...totals }
    await supabase.from('daily_overrides').upsert(record, { onConflict:'user_id,override_date,meal_type' })
    const key = date + '_' + mealType
    setOverrides(prev => ({ ...prev, [key]: record }))
    setEditingDay(null)
    setEditingMeal(null)
  }

  async function handleImport(e) {
    e.preventDefault()
    setImporting(true)
    setImportErr('')
    try {
      const parsed = JSON.parse(importJson)
      if (!parsed.days || !parsed.week_start) throw new Error('Hiányzó week_start vagy days mező')
      await supabase.from('meal_plans').delete().eq('week_start', parsed.week_start)
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

  // Inline editor nézet
  if (editingDay !== null && editingMeal) {
    const meal = plan.days[editingDay]?.meals?.find(m => m.type === editingMeal)
    const override = getOverride(editingDay, editingMeal)
    const currentItems = override ? override.items : (meal?.[myKey]?.items || [])
    const mealName = meal?.name || MEAL_LABELS[editingMeal]
    return (
      <InlineEditor
        mealType={editingMeal}
        mealName={mealName}
        currentItems={currentItems}
        onSave={(items) => saveOverride(editingDay, editingMeal, mealName, items)}
        onCancel={() => { setEditingDay(null); setEditingMeal(null) }}
      />
    )
  }

  const dayData = plan.days[selDay]

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:allPlans.length > 1 ? 8 : 12 }}>
        <span style={{ fontSize:12, color:'#606060' }}>Hét: {plan.week_start}</span>
        <button onClick={() => setShowImport(true)} style={s.swapBtn}>↺ Új terv</button>
      </div>

      {allPlans.length > 1 && (
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:12, paddingBottom:2 }}>
          {allPlans.map(p => (
            <button key={p.id} onClick={() => loadPlanById(p.id)}
              style={{
                flexShrink:0, padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer',
                background: p.id === selectedPlanId ? '#052e16' : '#1e1e1e',
                border: `1px solid ${p.id === selectedPlanId ? '#22c55e' : '#2a2a2a'}`,
                color: p.id === selectedPlanId ? '#22c55e' : '#606060',
              }}>
              {p.week_start}
            </button>
          ))}
        </div>
      )}

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
        const override = getOverride(selDay, mealType)
        return (
          <MealCard
            key={mealType}
            meal={meal}
            myKey={myKey}
            partnerKey={partnerKey}
            partnerName={partnerName}
            override={override}
            onEdit={() => { setEditingDay(selDay); setEditingMeal(mealType) }}
          />
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
  dayBtn: { flexShrink:0, width:38, height:38, borderRadius:8, background:'#1e1e1e', border:'1px solid #2a2a2a', color:'#a0a0a0', fontSize:12, fontWeight:500, cursor:'pointer' },
  dayActive: { background:'#052e16', borderColor:'#22c55e', color:'#22c55e' },
  dayToday: { borderColor:'#3a3a3a' },
  dayTitle: { fontSize:22, fontWeight:600, color:'#e8e8e8', marginBottom:16 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, overflow:'hidden', marginBottom:12 },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'16px 18px 12px' },
  mealType: { fontSize:11, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px' },
  overrideBadge: { background:'#1a1a3a', color:'#3b82f6', fontSize:10, padding:'1px 6px', borderRadius:10, border:'1px solid #3b82f633' },
  mealName: { fontSize:15, fontWeight:500, color:'#e8e8e8', marginTop:4 },
  myKcal: { fontSize:16, fontWeight:600, color:'#22c55e' },
  editBtn: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:6, color:'#606060', padding:'5px 9px', fontSize:13, cursor:'pointer' },
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
  backBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#a0a0a0', padding:'8px 14px', fontSize:13, cursor:'pointer' },
  swapBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#606060', padding:'6px 12px', fontSize:13, cursor:'pointer' },
  textarea: { width:'100%', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'12px 14px', color:'#e8e8e8', fontSize:12, fontFamily:'monospace', outline:'none', resize:'vertical', lineHeight:1.6, marginBottom:12 },
  greenBtn: { width:'100%', background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600, cursor:'pointer' },
  errBox: { background:'#1a0000', border:'1px solid #3a0000', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:12 },
  emptyWrap: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'32px 24px', textAlign:'center' },
  itemsBox: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, overflow:'hidden' },
  itemsTitle: { fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', padding:'8px 14px', background:'#111', borderBottom:'1px solid #222' },
  itemRow: { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid #222' },
  itemName: { flex:1, fontSize:13, color:'#e8e8e8' },
  itemAmt: { fontSize:12, color:'#a0a0a0', minWidth:55 },
  itemKcal: { fontSize:12, color:'#606060', minWidth:55, textAlign:'right' },
  removeBtn: { background:'none', border:'none', color:'#606060', fontSize:12, cursor:'pointer' },
  itemTotals: { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#111' },
  totalKcal: { fontSize:15, fontWeight:600, color:'#22c55e' },
  searchBox: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'14px' },
  saveBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600, cursor:'pointer' },
}
