import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import FoodSearch from './FoodSearch'
import WeeklySummary from './WeeklySummary'
import RecipePicker from './RecipePicker'

const MEAL_ORDER = ['reggeli','tizorai','ebed','uzsonna','vacsora']
const MEAL_LABELS = { reggeli:'Reggeli', tizorai:'Tízórai', ebed:'Ebéd', uzsonna:'Uzsonna', vacsora:'Vacsora' }
const MEAL_TIMES = { reggeli:'reggel', tizorai:'délelőtt', ebed:'délben', uzsonna:'délután', vacsora:'17:00' }
const PROTEIN_TARGET = { Levi:140, Edit:90 }

const todayStr = () => new Date().toISOString().split('T')[0]

function MealEditor({ mealType, currentItems, mealName, onSave, onCancel, dayBudget }) {
  const [items, setItems] = useState(currentItems || [])
  const [recipes, setRecipes] = useState([])
  const [showRecipes, setShowRecipes] = useState(false)

  useEffect(() => { loadRecipes() }, [])

  async function loadRecipes() {
    const { data } = await supabase.from('recipes').select('*').order('name')
    setRecipes(data || [])
  }

  function addItem(item) { setItems(prev => [...prev, item]) }
  function removeItem(idx) { setItems(prev => prev.filter((_,i) => i !== idx)) }

  function addRecipe(recipe) {
    // Recept hozzáadása egy adagként
    const recipeItem = {
      name: recipe.name,
      amount: '1 adag',
      kcal: recipe.total_kcal,
      protein: recipe.total_protein,
      carbs: recipe.total_carbs || 0,
      fat: recipe.total_fat || 0,
      fiber: recipe.total_fiber || 0,
    }
    setItems(prev => [...prev, recipeItem])
    setShowRecipes(false)
  }

  const totals = {
    kcal: items.reduce((a,i) => a + (i.kcal||0), 0),
    protein: Math.round(items.reduce((a,i) => a + (i.protein||0), 0) * 10) / 10,
    fiber: Math.round(items.reduce((a,i) => a + (i.fiber||0), 0) * 10) / 10,
  }

  const newDayKcal = dayBudget ? (dayBudget.eaten - dayBudget.currentMealKcal + totals.kcal) : 0
  const remaining = dayBudget ? (dayBudget.target - newDayKcal) : 0
  const over = remaining < 0

  return (
    <div style={s.editorWrap}>
      <div style={s.editorHeader}>
        <div>
          <div style={s.editorLabel}>{MEAL_LABELS[mealType]} szerkesztése</div>
          <div style={s.editorName}>{mealName}</div>
        </div>
        <button onClick={onCancel} style={s.cancelBtn}>✕ Mégse</button>
      </div>

      {dayBudget && (
        <div style={{ ...s.budgetBar, borderColor: over ? '#3a0000' : '#14532d', background: over ? '#1a0000' : '#052e16' }}>
          <span style={{ fontSize:12, color:'#606060' }}>Ha ezt eszed, a nap:</span>
          <span style={{ fontSize:15, fontWeight:600, color: over ? '#ef4444' : '#22c55e' }}>{newDayKcal} kcal</span>
          <span style={{ fontSize:12, color: over ? '#ef4444' : '#a0a0a0' }}>
            {over ? `${Math.abs(remaining)} kcal túllépve ⚠` : `${remaining} kcal marad`}
          </span>
        </div>
      )}

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
            <span style={s.totalKcal}>{totals.kcal} kcal</span>
            <span style={s.totalMacro}>{totals.protein}g fehérje · {totals.fiber}g rost</span>
          </div>
        </div>
      )}

      {showRecipes ? (
        <RecipePicker onAdd={addItem} onClose={() => setShowRecipes(false)} />
      ) : (
        <div style={s.addSection}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={s.panelTitle}>Alapanyag hozzáadása</span>
            <button onClick={() => setShowRecipes(true)} style={s.recipeBtn}>♨ Receptből</button>
          </div>
          <FoodSearch onAdd={addItem} />
        </div>
      )}

      <button onClick={() => onSave(items, totals)} style={s.saveBtn}>
        ✓ Mentés
      </button>
    </div>
  )
}

export default function TodayTab({ profile, user }) {
  const [checks, setChecks] = useState({ reggeli:false, tizorai:false, ebed:false, uzsonna:false, vacsora:false })
  const [plan, setPlan] = useState(null)
  const [overrides, setOverrides] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)

  const isLevi = profile.display_name === 'Levi'
  const myKey = isLevi ? 'levi' : 'edit'
  const todayRaw = new Date().getDay()
  const todayIdx = todayRaw === 0 ? 6 : todayRaw - 1

  useEffect(() => {
    Promise.all([loadChecks(), loadPlan(), loadOverrides()]).then(() => setLoading(false))
  }, [])

  async function loadChecks() {
    const { data } = await supabase.from('meal_checks').select('*')
      .eq('user_id', user.id).eq('check_date', todayStr()).single()
    if (data) setChecks({ reggeli:data.reggeli, tizorai:data.tizorai, ebed:data.ebed, uzsonna:data.uzsonna, vacsora:data.vacsora })
  }

  async function loadPlan() {
    const { data } = await supabase.from('meal_plans').select('*')
      .order('week_start', { ascending:false }).order('created_at', { ascending:false }).limit(1).maybeSingle()
    setPlan(data?.plan_data || null)
  }

  async function loadOverrides() {
    const { data } = await supabase.from('daily_overrides').select('*')
      .eq('user_id', user.id).eq('override_date', todayStr())
    const map = {}
    ;(data || []).forEach(o => { map[o.meal_type] = o })
    setOverrides(map)
  }

  async function toggle(key) {
    const next = { ...checks, [key]: !checks[key] }
    setChecks(next)
    setSaving(true)
    await supabase.from('meal_checks').upsert(
      { user_id:user.id, check_date:todayStr(), ...next },
      { onConflict:'user_id,check_date' }
    )
    setSaving(false)
  }

  async function saveOverride(mealType, mealName, items, totals) {
    const record = {
      user_id: user.id,
      override_date: todayStr(),
      meal_type: mealType,
      meal_name: mealName,
      items,
      total_kcal: totals.kcal,
      total_protein: totals.protein,
      total_carbs: totals.carbs || 0,
      total_fat: totals.fat || 0,
      total_fiber: totals.fiber || 0,
    }
    await supabase.from('daily_overrides').upsert(record, { onConflict:'user_id,override_date,meal_type' })
    setOverrides(prev => ({ ...prev, [mealType]: record }))
    setEditingMeal(null)
  }

  function getMealData(key) {
    const override = overrides[key]
    if (override) return {
      name: override.meal_name,
      items: override.items,
      total_kcal: override.total_kcal,
      total_protein: override.total_protein,
      isOverride: true,
    }
    const meal = plan?.days[todayIdx]?.meals?.find(m => m.type === key)
    if (!meal) return null
    return {
      name: meal.name,
      items: meal[myKey]?.items || [],
      total_kcal: meal[myKey]?.total_kcal || 0,
      total_protein: meal[myKey]?.total_protein || 0,
      isOverride: false,
    }
  }

  const eaten = MEAL_ORDER.reduce((sum, key) => checks[key] ? sum + (getMealData(key)?.total_kcal || 0) : sum, 0)
  const planned = MEAL_ORDER.reduce((sum, key) => !checks[key] ? sum + (getMealData(key)?.total_kcal || 0) : sum, 0)
  const proteinEaten = MEAL_ORDER.reduce((sum, key) => checks[key] ? sum + (getMealData(key)?.total_protein || 0) : sum, 0)

  const kcalTarget = profile.calorie_target
  const proteinTarget = PROTEIN_TARGET[profile.display_name] || 120
  const kcalPct = Math.min(Math.round((eaten / kcalTarget) * 100), 100)
  const proteinPct = Math.min(Math.round((proteinEaten / proteinTarget) * 100), 100)
  const remaining = kcalTarget - eaten
  const proteinRemaining = proteinTarget - Math.round(proteinEaten)

  if (loading) return <div style={{ color:'#606060', textAlign:'center', paddingTop:40 }}>betöltés...</div>

  if (editingMeal) {
    const mealData = getMealData(editingMeal)
    const currentMealKcal = checks[editingMeal] ? (mealData?.total_kcal || 0) : 0
    return (
      <MealEditor
        mealType={editingMeal}
        mealName={mealData?.name || MEAL_LABELS[editingMeal]}
        currentItems={mealData?.items || []}
        onSave={(items, totals) => saveOverride(editingMeal, mealData?.name || MEAL_LABELS[editingMeal], items, totals)}
        onCancel={() => setEditingMeal(null)}
        dayBudget={{ eaten, target: kcalTarget, currentMealKcal }}
      />
    )
  }

  const dateStr = new Date().toLocaleDateString('hu-HU', { weekday:'long', month:'long', day:'numeric' })

  return (
    <div>
      <div style={s.dateRow}>
        <span style={s.date}>{dateStr}</span>
        {saving && <span style={{ fontSize:12, color:'#606060' }}>mentés...</span>}
      </div>

      <div style={s.card}>
        <div style={s.statsRow}>
          <div>
            <div style={s.bigNum}>{eaten} kcal</div>
            <div style={s.smallLabel}>elfogyasztva</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:500, color:'#606060' }}>{planned} kcal</div>
            <div style={s.smallLabel}>tervezett még</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ ...s.bigNum, color: remaining >= 0 ? '#22c55e' : '#ef4444' }}>
              {Math.abs(remaining)} kcal
            </div>
            <div style={s.smallLabel}>{remaining >= 0 ? 'marad' : 'túllépve'}</div>
          </div>
        </div>
        <div style={s.progressBg}>
          <div style={{ ...s.progressFill, width:`${kcalPct}%`, background: kcalPct >= 100 ? '#ef4444' : '#22c55e' }} />
        </div>
        <div style={s.progressLabel}>{kcalPct}% — cél: {kcalTarget} kcal</div>
        <div style={s.divider} />
        <div style={s.statsRow}>
          <div>
            <div style={{ ...s.bigNum, fontSize:20 }}>{Math.round(proteinEaten)}g fehérje</div>
            <div style={s.smallLabel}>elfogyasztva</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ ...s.bigNum, fontSize:20, color: proteinRemaining <= 0 ? '#22c55e' : '#a0a0a0' }}>
              {proteinRemaining > 0 ? `${proteinRemaining}g` : 'elérve ✓'}
            </div>
            <div style={s.smallLabel}>{proteinRemaining > 0 ? 'még kell' : 'célba értél'}</div>
          </div>
        </div>
        <div style={s.progressBg}>
          <div style={{ ...s.progressFill, width:`${proteinPct}%`, background: proteinPct >= 100 ? '#22c55e' : '#3b82f6' }} />
        </div>
        <div style={s.progressLabel}>{proteinPct}% — cél: {proteinTarget}g fehérje</div>
      </div>

      {!plan && (
        <div style={s.noPlan}>
          <div style={{ fontSize:15, fontWeight:500, color:'#e8e8e8', marginBottom:8 }}>Nincs betöltve heti terv</div>
          <div style={{ fontSize:13, color:'#606060' }}>Importálj egy tervet a Heti terv fülön, vagy szerkeszd az étkezéseket manuálisan a ✎ gombbal.</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {MEAL_ORDER.map(key => {
          const mealData = getMealData(key)
          const kcal = mealData?.total_kcal || 0
          const protein = mealData?.total_protein || 0
          const name = mealData?.name || MEAL_LABELS[key]
          const done = checks[key]
          const isOverride = mealData?.isOverride

          return (
            <div key={key} style={{ ...s.mealItem, ...(done ? s.mealDone : {}) }}>
              <div style={{ ...s.cb, ...(done ? s.cbDone : {}) }} onClick={() => toggle(key)}>
                {done && <span style={{ color:'#0d1a0d', fontSize:12, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ flex:1 }} onClick={() => toggle(key)}>
                <div style={{ fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:2 }}>
                  {MEAL_LABELS[key]} · {MEAL_TIMES[key]}
                  {isOverride && <span style={s.badge}>módosított</span>}
                </div>
                <div style={{ fontSize:14, fontWeight:500, color: mealData ? '#e8e8e8' : '#606060' }}>
                  {mealData ? name : 'Nincs beállítva — kattints ✎'}
                </div>
              </div>
              <div style={{ textAlign:'right', marginRight:8 }}>
                {kcal > 0 && <div style={{ fontSize:13, color: done ? '#22c55e' : '#a0a0a0', fontWeight:500 }}>{kcal} kcal</div>}
                {protein > 0 && <div style={{ fontSize:11, color:'#3b82f6', marginTop:2 }}>{Math.round(protein)}g P</div>}
              </div>
              <button onClick={() => setEditingMeal(key)} style={s.editBtn} title="Szerkesztés">✎</button>
            </div>
          )
        })}
      </div>
      <WeeklySummary plan={plan} user={user} profile={profile} />
    </div>
  )
}

const s = {
  dateRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  date: { fontSize:15, color:'#a0a0a0', fontWeight:500 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'18px 20px', marginBottom:20 },
  statsRow: { display:'flex', justifyContent:'space-between', marginBottom:10 },
  bigNum: { fontSize:24, fontWeight:600, color:'#e8e8e8', lineHeight:1 },
  smallLabel: { fontSize:12, color:'#606060', marginTop:4 },
  progressBg: { background:'#2a2a2a', borderRadius:4, height:6, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:4, transition:'width 0.3s' },
  progressLabel: { fontSize:12, color:'#606060', marginTop:6 },
  divider: { height:'1px', background:'#2a2a2a', margin:'16px 0' },
  mealItem: { display:'flex', alignItems:'center', gap:10, background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'12px 14px' },
  mealDone: { background:'#052e16', borderColor:'#14532d' },
  cb: { width:24, height:24, borderRadius:6, border:'2px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' },
  cbDone: { background:'#22c55e', borderColor:'#22c55e' },
  badge: { marginLeft:6, background:'#1a1a3a', color:'#3b82f6', fontSize:10, padding:'1px 6px', borderRadius:10, border:'1px solid #3b82f633' },
  editBtn: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:6, color:'#606060', padding:'6px 10px', fontSize:13, cursor:'pointer', flexShrink:0 },
  noPlan: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'20px 24px', marginBottom:16, textAlign:'center' },
  // Editor
  editorWrap: { display:'flex', flexDirection:'column', gap:14 },
  editorHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  editorLabel: { fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 },
  editorName: { fontSize:16, fontWeight:500, color:'#e8e8e8' },
  cancelBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#606060', padding:'6px 12px', fontSize:12, cursor:'pointer' },
  budgetBar: { display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:8, border:'1px solid', flexWrap:'wrap' },
  itemsBox: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, overflow:'hidden' },
  itemsTitle: { fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', padding:'8px 14px', background:'#111', borderBottom:'1px solid #222' },
  itemRow: { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid #222' },
  itemName: { flex:1, fontSize:13, color:'#e8e8e8' },
  itemAmt: { fontSize:12, color:'#a0a0a0', minWidth:55 },
  itemKcal: { fontSize:12, color:'#606060', minWidth:55, textAlign:'right' },
  removeBtn: { background:'none', border:'none', color:'#606060', fontSize:12, cursor:'pointer' },
  itemTotals: { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#111' },
  totalKcal: { fontSize:15, fontWeight:600, color:'#22c55e' },
  totalMacro: { fontSize:12, color:'#606060' },
  addSection: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'14px' },
  panelTitle: { fontSize:12, color:'#a0a0a0', fontWeight:500 },
  recipeBtn: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, color:'#22c55e', padding:'6px 12px', fontSize:12, cursor:'pointer' },
  recipesPanel: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'14px' },
  smallBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:6, color:'#606060', padding:'4px 10px', fontSize:11, cursor:'pointer' },
  recipeItem: { padding:'10px 0', borderBottom:'1px solid #2a2a2a', cursor:'pointer' },
  recipeName: { display:'block', fontSize:14, color:'#e8e8e8', marginBottom:3 },
  recipeMeta: { fontSize:12, color:'#606060' },
  emptyMsg: { fontSize:13, color:'#606060', textAlign:'center', padding:'16px 0' },
  saveBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600, cursor:'pointer' },
}
