import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import FoodSearch from './FoodSearch'

function RecipeCard({ recipe, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={s.card}>
      <div style={s.cardHeader} onClick={() => setOpen(!open)}>
        <div>
          <div style={s.recipeName}>{recipe.name}</div>
          <div style={s.recipeMeta}>{recipe.servings} adag · {recipe.total_kcal} kcal/adag · {recipe.total_protein}g fehérje</div>
        </div>
        <span style={{ fontSize:10, color:'#606060' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={s.cardBody}>
          {recipe.description && <div style={s.desc}>{recipe.description}</div>}
          <div style={s.ingTitle}>Alapanyagok (1 adag)</div>
          {(recipe.ingredients || []).map((ing, i) => (
            <div key={i} style={s.ingRow}>
              <span style={s.ingName}>{ing.name}</span>
              <span style={s.ingAmt}>{ing.amount}</span>
              <span style={s.ingKcal}>{ing.kcal} kcal</span>
            </div>
          ))}
          <div style={s.macroRow}>
            <span style={s.macro}>{recipe.total_kcal} kcal</span>
            <span style={s.macroDot}>·</span>
            <span style={s.macro}>{recipe.total_protein}g P</span>
            <span style={s.macroDot}>·</span>
            <span style={s.macro}>{recipe.total_carbs}g C</span>
            <span style={s.macroDot}>·</span>
            <span style={s.macro}>{recipe.total_fat}g F</span>
            <span style={s.macroDot}>·</span>
            <span style={s.macro}>{recipe.total_fiber}g rost</span>
          </div>
          <button onClick={() => onDelete(recipe.id)} style={s.deleteBtn}>Törlés</button>
        </div>
      )}
    </div>
  )
}

function CreateRecipe({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [servings, setServings] = useState(1)
  const [ingredients, setIngredients] = useState([])
  const [saving, setSaving] = useState(false)

  function addIngredient(item) {
    setIngredients(prev => [...prev, item])
  }

  function removeIngredient(idx) {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
  }

  function getTotals() {
    if (ingredients.length === 0) return { kcal:0, protein:0, carbs:0, fat:0, fiber:0 }
    const s = servings || 1
    return {
      kcal: Math.round(ingredients.reduce((a,i) => a + i.kcal, 0) / s),
      protein: Math.round(ingredients.reduce((a,i) => a + i.protein, 0) / s * 10) / 10,
      carbs: Math.round(ingredients.reduce((a,i) => a + i.carbs, 0) / s * 10) / 10,
      fat: Math.round(ingredients.reduce((a,i) => a + i.fat, 0) / s * 10) / 10,
      fiber: Math.round(ingredients.reduce((a,i) => a + i.fiber, 0) / s * 10) / 10,
    }
  }

  async function handleSave() {
    if (!name.trim() || ingredients.length === 0) return
    setSaving(true)
    const t = getTotals()
    const { data, error } = await supabase.from('recipes').insert({
      name: name.trim(),
      description: desc.trim(),
      servings: Number(servings) || 1,
      ingredients,
      total_kcal: t.kcal,
      total_protein: t.protein,
      total_carbs: t.carbs,
      total_fat: t.fat,
      total_fiber: t.fiber,
    }).select().single()
    if (!error) onSave(data)
    setSaving(false)
  }

  const totals = getTotals()

  return (
    <div style={s.createWrap}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <button onClick={onCancel} style={s.backBtn}>← Vissza</button>
        <span style={{ fontSize:15, fontWeight:500, color:'#e8e8e8' }}>Új recept</span>
      </div>

      <div style={s.field}>
        <label style={s.label}>Recept neve</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="pl. Lazacos tészta" style={s.textInput} />
      </div>

      <div style={s.field}>
        <label style={s.label}>Leírás (opcionális)</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Elkészítés módja..." style={s.textarea} rows={3} />
      </div>

      <div style={s.field}>
        <label style={s.label}>Adagok száma</label>
        <input type="number" value={servings} onChange={e => setServings(e.target.value)} min={1} style={{ ...s.textInput, width:80 }} />
      </div>

      <div style={s.sectionTitle}>Alapanyagok</div>
      <FoodSearch onAdd={addIngredient} />

      {ingredients.length > 0 && (
        <div style={s.ingList}>
          {ingredients.map((ing, i) => (
            <div key={i} style={s.ingItem}>
              <span style={s.ingName}>{ing.name}</span>
              <span style={s.ingAmt}>{ing.amount}</span>
              <span style={s.ingKcal}>{ing.kcal} kcal</span>
              <button onClick={() => removeIngredient(i)} style={s.removeBtn}>✕</button>
            </div>
          ))}
          <div style={s.totalRow}>
            <span style={{ color:'#606060', fontSize:12 }}>1 adag összesen:</span>
            <span style={s.totalKcal}>{totals.kcal} kcal</span>
            <span style={{ fontSize:12, color:'#606060' }}>{totals.protein}g P · {totals.fiber}g rost</span>
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={!name.trim() || ingredients.length === 0 || saving} style={s.saveBtn}>
        {saving ? 'Mentés...' : '✓ Recept mentése'}
      </button>
    </div>
  )
}

export default function RecipesTab() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // list | create | search
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadRecipes() }, [])

  async function loadRecipes() {
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending:false })
    setRecipes(data || [])
    setLoading(false)
  }

  async function deleteRecipe(id) {
    await supabase.from('recipes').delete().eq('id', id)
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  function handleSaved(recipe) {
    setRecipes(prev => [recipe, ...prev])
    setView('list')
  }

  const filtered = recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (view === 'create') return <CreateRecipe onSave={handleSaved} onCancel={() => setView('list')} />

  return (
    <div>
      <div style={s.tabHeader}>
        <button onClick={() => setView('create')} style={s.newBtn}>+ Új recept</button>
      </div>

      {view === 'list' && (
        <>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Recept keresése..."
            style={s.searchInput}
          />

          <div style={s.sectionTitle}>Alapanyag kereső</div>
          <div style={s.searchCard}>
            <FoodSearch onAdd={() => {}} />
          </div>

          <div style={s.sectionTitle}>Receptjeim ({recipes.length})</div>
          {loading && <div style={s.empty}>betöltés...</div>}
          {!loading && filtered.length === 0 && (
            <div style={s.empty}>Még nincs mentett recept. Hozz létre egyet!</div>
          )}
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} onDelete={deleteRecipe} />)}
        </>
      )}
    </div>
  )
}

const s = {
  tabHeader: { display:'flex', justifyContent:'flex-end', marginBottom:16 },
  newBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:'10px 16px', fontSize:13, fontWeight:600, cursor:'pointer' },
  searchInput: { width:'100%', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 14px', color:'#e8e8e8', fontSize:14, outline:'none', marginBottom:16 },
  sectionTitle: { fontSize:11, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10, marginTop:4 },
  searchCard: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'14px 16px', marginBottom:20 },
  card: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, overflow:'hidden', marginBottom:10 },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', cursor:'pointer' },
  recipeName: { fontSize:15, fontWeight:500, color:'#e8e8e8', marginBottom:4 },
  recipeMeta: { fontSize:12, color:'#606060' },
  cardBody: { padding:'0 18px 16px', borderTop:'1px solid #2a2a2a', paddingTop:14 },
  desc: { fontSize:13, color:'#a0a0a0', marginBottom:12, lineHeight:1.5 },
  ingTitle: { fontSize:11, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 },
  ingRow: { display:'flex', gap:8, padding:'5px 0', borderBottom:'1px solid #1a1a1a', alignItems:'center' },
  ingName: { flex:1, fontSize:13, color:'#e8e8e8' },
  ingAmt: { fontSize:12, color:'#a0a0a0', minWidth:60, textAlign:'right' },
  ingKcal: { fontSize:12, color:'#606060', minWidth:55, textAlign:'right' },
  macroRow: { display:'flex', gap:8, alignItems:'center', marginTop:10, flexWrap:'wrap' },
  macro: { fontSize:12, color:'#a0a0a0' },
  macroDot: { color:'#2a2a2a', fontSize:10 },
  deleteBtn: { marginTop:12, background:'none', border:'1px solid #3a0000', borderRadius:8, color:'#ef4444', padding:'6px 14px', fontSize:12, cursor:'pointer' },
  empty: { color:'#606060', fontSize:13, textAlign:'center', padding:'24px 0' },
  createWrap: { display:'flex', flexDirection:'column', gap:12 },
  backBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#a0a0a0', padding:'8px 14px', fontSize:13, cursor:'pointer' },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:12, color:'#606060', fontWeight:500 },
  textInput: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#e8e8e8', fontSize:14, outline:'none' },
  textarea: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#e8e8e8', fontSize:13, outline:'none', resize:'vertical', lineHeight:1.5 },
  ingList: { background:'#1a1a1a', borderRadius:8, overflow:'hidden', border:'1px solid #2a2a2a' },
  ingItem: { display:'flex', gap:8, padding:'10px 14px', borderBottom:'1px solid #222', alignItems:'center' },
  ingAmt: { fontSize:12, color:'#a0a0a0', minWidth:60, textAlign:'right' },
  ingKcal: { fontSize:12, color:'#606060', minWidth:55, textAlign:'right' },
  removeBtn: { background:'none', border:'none', color:'#606060', fontSize:12, cursor:'pointer', marginLeft:4 },
  totalRow: { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#111' },
  totalKcal: { fontSize:15, fontWeight:600, color:'#22c55e' },
  saveBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:600, cursor:'pointer', marginTop:8 },
}
