import { useState, useCallback } from 'react'

const API = 'https://world.openfoodfacts.org/cgi/search.pl'

function parseProduct(p) {
  const n = p.nutriments || {}
  return {
    id: p.id || p.code,
    name: p.product_name || p.product_name_en || 'Ismeretlen termék',
    brand: p.brands || '',
    kcal_100g: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0),
    protein_100g: Math.round((n['proteins_100g'] || 0) * 10) / 10,
    carbs_100g: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
    fat_100g: Math.round((n['fat_100g'] || 0) * 10) / 10,
    fiber_100g: Math.round((n['fiber_100g'] || 0) * 10) / 10,
  }
}

export default function FoodSearch({ onAdd, compact = false }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [grams, setGrams] = useState('')
  const [error, setError] = useState('')

  async function search(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSelected(null)
    try {
      const res = await fetch(`${API}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=id,code,product_name,product_name_en,brands,nutriments`)
      const data = await res.json()
      const valid = (data.products || [])
        .map(parseProduct)
        .filter(p => p.name && p.kcal_100g > 0)
      setResults(valid)
      if (valid.length === 0) setError('Nem találtunk eredményt. Próbálj angol szóval.')
    } catch {
      setError('Hálózati hiba. Próbáld újra.')
    }
    setLoading(false)
  }

  function calcItem(product, g) {
    const m = g / 100
    return {
      name: product.name,
      amount: `${g}g`,
      kcal: Math.round(product.kcal_100g * m),
      protein: Math.round(product.protein_100g * m * 10) / 10,
      carbs: Math.round(product.carbs_100g * m * 10) / 10,
      fat: Math.round(product.fat_100g * m * 10) / 10,
      fiber: Math.round(product.fiber_100g * m * 10) / 10,
    }
  }

  function handleAdd() {
    if (!selected || !grams || isNaN(grams) || Number(grams) <= 0) return
    const item = calcItem(selected, Number(grams))
    onAdd(item)
    setSelected(null)
    setGrams('')
    setQuery('')
    setResults([])
  }

  const preview = selected && grams && !isNaN(grams) && Number(grams) > 0
    ? calcItem(selected, Number(grams))
    : null

  return (
    <div style={s.wrap}>
      <form onSubmit={search} style={s.searchRow}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Keresés angolul: chicken breast, salmon..."
          style={s.input}
        />
        <button type="submit" disabled={loading} style={s.searchBtn}>
          {loading ? '...' : '🔍'}
        </button>
      </form>

      {error && <div style={s.err}>{error}</div>}

      {results.length > 0 && !selected && (
        <div style={s.results}>
          {results.map(p => (
            <div key={p.id} style={s.result} onClick={() => setSelected(p)}>
              <div style={s.resultName}>{p.name}</div>
              <div style={s.resultMeta}>
                {p.brand && <span style={s.brand}>{p.brand} · </span>}
                <span>{p.kcal_100g} kcal · {p.protein_100g}g P · {p.carbs_100g}g C · {p.fat_100g}g F</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={s.selectedBox}>
          <div style={s.selectedName}>{selected.name}</div>
          <div style={s.selectedPer}>100g: {selected.kcal_100g} kcal · {selected.protein_100g}g fehérje · {selected.fiber_100g}g rost</div>
          <div style={s.gramRow}>
            <input
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              placeholder="Gramm"
              style={s.gramInput}
              autoFocus
            />
            <span style={s.gramLabel}>g</span>
            <button onClick={() => { setSelected(null); setGrams('') }} style={s.cancelBtn}>✕</button>
          </div>
          {preview && (
            <div style={s.preview}>
              <span style={s.previewKcal}>{preview.kcal} kcal</span>
              <span style={s.previewMacro}>{preview.protein}g P · {preview.carbs}g C · {preview.fat}g F · {preview.fiber}g rost</span>
            </div>
          )}
          <button onClick={handleAdd} disabled={!grams || isNaN(grams) || Number(grams) <= 0} style={s.addBtn}>
            + Hozzáad
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { display:'flex', flexDirection:'column', gap:8 },
  searchRow: { display:'flex', gap:8 },
  input: { flex:1, background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#e8e8e8', fontSize:13, outline:'none' },
  searchBtn: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, color:'#e8e8e8', padding:'10px 14px', fontSize:15, cursor:'pointer' },
  err: { fontSize:12, color:'#a0a0a0', padding:'8px 0' },
  results: { background:'#1a1a1a', borderRadius:8, overflow:'hidden', border:'1px solid #2a2a2a' },
  result: { padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid #222' },
  resultName: { fontSize:13, color:'#e8e8e8', marginBottom:3 },
  resultMeta: { fontSize:11, color:'#606060' },
  brand: { color:'#a0a0a0' },
  selectedBox: { background:'#1a1a1a', border:'1px solid #22c55e33', borderRadius:8, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 },
  selectedName: { fontSize:14, fontWeight:500, color:'#e8e8e8' },
  selectedPer: { fontSize:12, color:'#606060' },
  gramRow: { display:'flex', alignItems:'center', gap:8 },
  gramInput: { width:90, background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#e8e8e8', fontSize:14, outline:'none' },
  gramLabel: { fontSize:13, color:'#606060' },
  cancelBtn: { background:'none', border:'none', color:'#606060', fontSize:14, cursor:'pointer', marginLeft:'auto' },
  preview: { display:'flex', alignItems:'baseline', gap:10, background:'#0d1a0d', borderRadius:6, padding:'8px 10px' },
  previewKcal: { fontSize:16, fontWeight:600, color:'#22c55e' },
  previewMacro: { fontSize:12, color:'#606060' },
  addBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:'10px', fontSize:13, fontWeight:600, cursor:'pointer' },
}
