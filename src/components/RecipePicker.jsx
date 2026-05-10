// Shared recipe picker component used in TodayTab and MealPlanTab editors
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function RecipePicker({ onAdd, onClose }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [grams, setGrams] = useState('')

  useEffect(() => {
    supabase.from('recipes').select('*').order('name').then(({ data }) => {
      setRecipes(data || [])
      setLoading(false)
    })
  }, [])

  function calcFromGrams(recipe, g) {
    if (!recipe.total_weight_g || !g) return null
    const ratio = g / recipe.total_weight_g
    return {
      name: recipe.name,
      amount: `${g}g`,
      kcal: Math.round(recipe.total_kcal * ratio),
      protein: Math.round(recipe.total_protein * ratio * 10) / 10,
      carbs: Math.round((recipe.total_carbs || 0) * ratio * 10) / 10,
      fat: Math.round((recipe.total_fat || 0) * ratio * 10) / 10,
      fiber: Math.round((recipe.total_fiber || 0) * ratio * 10) / 10,
    }
  }

  function calcFromServings(recipe, servings) {
    if (!servings) return null
    const s = recipe.servings || 1
    const ratio = servings / s
    return {
      name: recipe.name,
      amount: `${servings} adag`,
      kcal: Math.round(recipe.total_kcal * ratio),
      protein: Math.round(recipe.total_protein * ratio * 10) / 10,
      carbs: Math.round((recipe.total_carbs || 0) * ratio * 10) / 10,
      fat: Math.round((recipe.total_fat || 0) * ratio * 10) / 10,
      fiber: Math.round((recipe.total_fiber || 0) * ratio * 10) / 10,
    }
  }

  const hasWeight = selected && selected.total_weight_g > 0
  const preview = selected && grams && !isNaN(grams) && Number(grams) > 0
    ? (hasWeight ? calcFromGrams(selected, Number(grams)) : calcFromServings(selected, Number(grams)))
    : null

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>Receptjeim</span>
        <button onClick={onClose} style={s.closeBtn}>✕ Bezár</button>
      </div>

      {loading && <div style={s.empty}>betöltés...</div>}

      {!loading && recipes.length === 0 && (
        <div style={s.empty}>Még nincs mentett recept.</div>
      )}

      {!selected && recipes.map(r => (
        <div key={r.id} style={s.recipeItem} onClick={() => { setSelected(r); setGrams('') }}>
          <div style={s.recipeName}>{r.name}</div>
          <div style={s.recipeMeta}>
            {r.total_kcal} kcal · {r.total_protein}g P
            {r.total_weight_g ? ` · ${r.total_weight_g}g összesen` : ` · ${r.servings} adag`}
          </div>
        </div>
      ))}

      {selected && (
        <div style={s.picker}>
          <div style={s.pickerName}>{selected.name}</div>
          <div style={s.pickerMeta}>
            {selected.total_weight_g
              ? `Teljes súly: ${selected.total_weight_g}g · ${selected.total_kcal} kcal`
              : `${selected.servings} adag · ${selected.total_kcal} kcal/adag`}
          </div>

          <div style={s.gramRow}>
            <input
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              placeholder={hasWeight ? 'Hány grammot eszel?' : 'Hány adagot eszel?'}
              style={s.gramInput}
              autoFocus
            />
            <span style={s.gramUnit}>{hasWeight ? 'g' : 'adag'}</span>
            <button onClick={() => { setSelected(null); setGrams('') }} style={s.backSmall}>← vissza</button>
          </div>

          {preview && (
            <div style={s.preview}>
              <span style={s.previewKcal}>{preview.kcal} kcal</span>
              <span style={s.previewMacro}>{preview.protein}g P · {preview.carbs}g C · {preview.fat}g F · {preview.fiber}g rost</span>
            </div>
          )}

          <button
            onClick={() => { if (preview) { onAdd(preview); onClose() } }}
            disabled={!preview}
            style={s.addBtn}
          >
            + Hozzáad
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid #2a2a2a' },
  title: { fontSize:12, fontWeight:500, color:'#a0a0a0' },
  closeBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:6, color:'#606060', padding:'4px 10px', fontSize:11, cursor:'pointer' },
  empty: { padding:'16px 14px', fontSize:13, color:'#606060', textAlign:'center' },
  recipeItem: { padding:'11px 14px', borderBottom:'1px solid #222', cursor:'pointer' },
  recipeName: { fontSize:14, color:'#e8e8e8', marginBottom:3 },
  recipeMeta: { fontSize:11, color:'#606060' },
  picker: { padding:'14px', display:'flex', flexDirection:'column', gap:10 },
  pickerName: { fontSize:15, fontWeight:500, color:'#e8e8e8' },
  pickerMeta: { fontSize:12, color:'#606060' },
  gramRow: { display:'flex', alignItems:'center', gap:8 },
  gramInput: { flex:1, background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#e8e8e8', fontSize:14, outline:'none' },
  gramUnit: { fontSize:13, color:'#606060' },
  backSmall: { background:'none', border:'none', color:'#606060', fontSize:12, cursor:'pointer', whiteSpace:'nowrap' },
  preview: { display:'flex', alignItems:'baseline', gap:10, background:'#0d1a0d', borderRadius:6, padding:'8px 10px' },
  previewKcal: { fontSize:16, fontWeight:600, color:'#22c55e' },
  previewMacro: { fontSize:12, color:'#606060' },
  addBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:'10px', fontSize:13, fontWeight:600, cursor:'pointer' },
}
