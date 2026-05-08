import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Beépített alapanyag lista (100g-ra)
// [kcal, protein, carbs, fat, fiber]
const BUILTIN = [
  { name:'Tojás', kcal_100g:155, protein_100g:13, carbs_100g:1.1, fat_100g:11, fiber_100g:0 },
  { name:'Csirkemell', kcal_100g:165, protein_100g:31, carbs_100g:0, fat_100g:3.6, fiber_100g:0 },
  { name:'Csirkecomb (bőr nélkül)', kcal_100g:127, protein_100g:19, carbs_100g:0, fat_100g:5.5, fiber_100g:0 },
  { name:'Lazac', kcal_100g:208, protein_100g:20, carbs_100g:0, fat_100g:13, fiber_100g:0 },
  { name:'Tonhal (vizes konzerv)', kcal_100g:90, protein_100g:21, carbs_100g:0, fat_100g:0.5, fiber_100g:0 },
  { name:'Darált marhahús (15%)', kcal_100g:215, protein_100g:17.5, carbs_100g:0, fat_100g:15.5, fiber_100g:0 },
  { name:'Darált pulykahús', kcal_100g:135, protein_100g:22, carbs_100g:0, fat_100g:5, fiber_100g:0 },
  { name:'Magyar kolbász', kcal_100g:330, protein_100g:15, carbs_100g:2, fat_100g:29, fiber_100g:0 },
  { name:'Bacon', kcal_100g:214, protein_100g:12, carbs_100g:0, fat_100g:18, fiber_100g:0 },
  { name:'Sonka', kcal_100g:145, protein_100g:18, carbs_100g:1, fat_100g:7, fiber_100g:0 },
  { name:'Görög joghurt', kcal_100g:59, protein_100g:10, carbs_100g:3.6, fat_100g:0.4, fiber_100g:0 },
  { name:'Tehéntej (3.5%)', kcal_100g:61, protein_100g:3.2, carbs_100g:4.7, fat_100g:3.3, fiber_100g:0 },
  { name:'Túró', kcal_100g:98, protein_100g:12, carbs_100g:4, fat_100g:4, fiber_100g:0 },
  { name:'Mozzarella', kcal_100g:280, protein_100g:17, carbs_100g:2.2, fat_100g:22, fiber_100g:0 },
  { name:'Cheddar sajt', kcal_100g:402, protein_100g:25, carbs_100g:1.3, fat_100g:33, fiber_100g:0 },
  { name:'Tejföl', kcal_100g:192, protein_100g:2.7, carbs_100g:4.3, fat_100g:19, fiber_100g:0 },
  { name:'Vaj', kcal_100g:717, protein_100g:0.9, carbs_100g:0.1, fat_100g:81, fiber_100g:0 },
  { name:'Zabpehely', kcal_100g:389, protein_100g:17, carbs_100g:66, fat_100g:7, fiber_100g:10.6 },
  { name:'Fehér rizs (száraz)', kcal_100g:360, protein_100g:6.7, carbs_100g:79, fat_100g:0.7, fiber_100g:1.3 },
  { name:'Főtt rizs', kcal_100g:130, protein_100g:2.7, carbs_100g:28, fat_100g:0.3, fiber_100g:0.4 },
  { name:'Tészta (száraz)', kcal_100g:371, protein_100g:13, carbs_100g:75, fat_100g:1.5, fiber_100g:3 },
  { name:'Főtt tészta', kcal_100g:131, protein_100g:5, carbs_100g:25, fat_100g:1, fiber_100g:1.8 },
  { name:'Burgonya', kcal_100g:77, protein_100g:2, carbs_100g:17, fat_100g:0.1, fiber_100g:2.2 },
  { name:'Édesburgonya', kcal_100g:86, protein_100g:1.6, carbs_100g:20, fat_100g:0.1, fiber_100g:3 },
  { name:'Fehér kenyér / pirítós', kcal_100g:265, protein_100g:9, carbs_100g:49, fat_100g:3.2, fiber_100g:2.7 },
  { name:'Teljes kiőrlésű kenyér', kcal_100g:247, protein_100g:13, carbs_100g:41, fat_100g:3.5, fiber_100g:7 },
  { name:'Liszt (búza)', kcal_100g:364, protein_100g:10, carbs_100g:76, fat_100g:1, fiber_100g:2.7 },
  { name:'Chia mag', kcal_100g:486, protein_100g:16.5, carbs_100g:42, fat_100g:31, fiber_100g:34.4 },
  { name:'Lenmag', kcal_100g:534, protein_100g:18, carbs_100g:29, fat_100g:42, fiber_100g:27 },
  { name:'Dió', kcal_100g:654, protein_100g:15, carbs_100g:14, fat_100g:65, fiber_100g:6.7 },
  { name:'Mandula', kcal_100g:579, protein_100g:21, carbs_100g:22, fat_100g:50, fiber_100g:12.5 },
  { name:'Avokádó', kcal_100g:160, protein_100g:2, carbs_100g:8.5, fat_100g:14.7, fiber_100g:6.7 },
  { name:'Banán', kcal_100g:89, protein_100g:1.1, carbs_100g:23, fat_100g:0.3, fiber_100g:2.6 },
  { name:'Alma', kcal_100g:52, protein_100g:0.3, carbs_100g:14, fat_100g:0.2, fiber_100g:2.4 },
  { name:'Kivi', kcal_100g:61, protein_100g:0.9, carbs_100g:15, fat_100g:0.5, fiber_100g:3 },
  { name:'Áfonya', kcal_100g:57, protein_100g:0.7, carbs_100g:14, fat_100g:0.3, fiber_100g:2.4 },
  { name:'Eper', kcal_100g:32, protein_100g:0.7, carbs_100g:7.7, fat_100g:0.3, fiber_100g:2 },
  { name:'Paradicsom', kcal_100g:18, protein_100g:0.9, carbs_100g:3.9, fat_100g:0.2, fiber_100g:1.2 },
  { name:'Uborka', kcal_100g:15, protein_100g:0.7, carbs_100g:3.6, fat_100g:0.1, fiber_100g:0.5 },
  { name:'Paprika (piros)', kcal_100g:31, protein_100g:1, carbs_100g:6, fat_100g:0.3, fiber_100g:2.1 },
  { name:'Gomba', kcal_100g:22, protein_100g:3.1, carbs_100g:3.3, fat_100g:0.3, fiber_100g:1 },
  { name:'Spenót', kcal_100g:23, protein_100g:2.9, carbs_100g:3.6, fat_100g:0.4, fiber_100g:2.2 },
  { name:'Brokkoli', kcal_100g:34, protein_100g:2.8, carbs_100g:7, fat_100g:0.4, fiber_100g:2.6 },
  { name:'Cukkini', kcal_100g:17, protein_100g:1.2, carbs_100g:3.1, fat_100g:0.3, fiber_100g:1 },
  { name:'Savoy / fejes káposzta', kcal_100g:27, protein_100g:2, carbs_100g:6, fat_100g:0.1, fiber_100g:3.1 },
  { name:'Sárgarépa', kcal_100g:41, protein_100g:0.9, carbs_100g:10, fat_100g:0.2, fiber_100g:2.8 },
  { name:'Lencse (főtt)', kcal_100g:116, protein_100g:9, carbs_100g:20, fat_100g:0.4, fiber_100g:7.9 },
  { name:'Fehér bab (főtt)', kcal_100g:139, protein_100g:9, carbs_100g:25, fat_100g:0.5, fiber_100g:6.3 },
  { name:'Kimchi', kcal_100g:15, protein_100g:1, carbs_100g:2, fat_100g:0.2, fiber_100g:1.5 },
  { name:'Olívaolaj', kcal_100g:884, protein_100g:0, carbs_100g:0, fat_100g:100, fiber_100g:0 },
  { name:'Napraforgóolaj', kcal_100g:884, protein_100g:0, carbs_100g:0, fat_100g:100, fiber_100g:0 },
  { name:'Méz', kcal_100g:304, protein_100g:0.3, carbs_100g:82, fat_100g:0, fiber_100g:0 },
  { name:'Sötét csokoládé (85%+)', kcal_100g:546, protein_100g:5, carbs_100g:60, fat_100g:31, fiber_100g:8 },
  { name:'Paradicsom szósz (dobozos)', kcal_100g:35, protein_100g:1.5, carbs_100g:7, fat_100g:0.4, fiber_100g:1.5 },
  { name:'Gyoza (fagyasztott, 1db~15g)', kcal_100g:233, protein_100g:13, carbs_100g:27, fat_100g:7, fiber_100g:2 },
  { name:'Tejszín (30%)', kcal_100g:300, protein_100g:2.3, carbs_100g:3.4, fat_100g:30, fiber_100g:0 },
]

const OF_API = 'https://world.openfoodfacts.org/cgi/search.pl'

function calcItem(ingredient, grams) {
  const m = grams / 100
  return {
    name: ingredient.name,
    amount: `${grams}g`,
    kcal: Math.round(ingredient.kcal_100g * m),
    protein: Math.round(ingredient.protein_100g * m * 10) / 10,
    carbs: Math.round(ingredient.carbs_100g * m * 10) / 10,
    fat: Math.round(ingredient.fat_100g * m * 10) / 10,
    fiber: Math.round(ingredient.fiber_100g * m * 10) / 10,
  }
}

function GramPicker({ ingredient, onAdd, onCancel }) {
  const [grams, setGrams] = useState('')
  const preview = grams && !isNaN(grams) && Number(grams) > 0
    ? calcItem(ingredient, Number(grams))
    : null
  return (
    <div style={s.gramBox}>
      <div style={s.gramName}>{ingredient.name}</div>
      <div style={s.gramPer}>100g: {ingredient.kcal_100g} kcal · {ingredient.protein_100g}g P · {ingredient.fiber_100g}g rost</div>
      <div style={s.gramRow}>
        <input type="number" value={grams} onChange={e => setGrams(e.target.value)}
          placeholder="Gramm" style={s.gramInput} autoFocus />
        <span style={{ fontSize:13, color:'#606060' }}>g</span>
        <button onClick={onCancel} style={s.cancelSmall}>✕</button>
      </div>
      {preview && (
        <div style={s.preview}>
          <span style={s.previewKcal}>{preview.kcal} kcal</span>
          <span style={s.previewMeta}>{preview.protein}g P · {preview.carbs}g C · {preview.fat}g F · {preview.fiber}g rost</span>
        </div>
      )}
      <button onClick={() => preview && onAdd(preview)} disabled={!preview} style={s.addBtn}>
        + Hozzáad
      </button>
    </div>
  )
}

function ManualEntry({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name:'', kcal_100g:'', protein_100g:'', carbs_100g:'', fat_100g:'', fiber_100g:'' })
  const [grams, setGrams] = useState('')
  const [saving, setSaving] = useState(false)

  const f = v => parseFloat(v) || 0
  const valid = form.name.trim() && f(form.kcal_100g) > 0 && f(grams) > 0

  async function handleAdd() {
    if (!valid) return
    setSaving(true)
    const ing = {
      name: form.name.trim(),
      kcal_100g: f(form.kcal_100g),
      protein_100g: f(form.protein_100g),
      carbs_100g: f(form.carbs_100g),
      fat_100g: f(form.fat_100g),
      fiber_100g: f(form.fiber_100g),
    }
    await supabase.from('custom_ingredients').insert(ing)
    const item = calcItem(ing, f(grams))
    onAdd(item)
    setSaving(false)
  }

  return (
    <div style={s.manualBox}>
      <div style={s.manualTitle}>Saját alapanyag hozzáadása</div>
      <div style={s.manualNote}>Az értékeket a csomagoláson lévő táblázatból add meg (100g-ra).</div>
      <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Alapanyag neve" style={s.manInput} />
      <div style={s.manualGrid}>
        {[['kcal_100g','Kalória (kcal)'],['protein_100g','Fehérje (g)'],['carbs_100g','Szénhidrát (g)'],['fat_100g','Zsír (g)'],['fiber_100g','Rost (g)']].map(([k,l]) => (
          <div key={k} style={s.manField}>
            <label style={s.manLabel}>{l}</label>
            <input type="number" value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} style={s.manNumInput} />
          </div>
        ))}
      </div>
      <div style={s.gramRow}>
        <input type="number" value={grams} onChange={e => setGrams(e.target.value)} placeholder="Gramm amit hozzáadsz" style={s.gramInput} />
        <span style={{ fontSize:13, color:'#606060' }}>g</span>
      </div>
      {grams && !isNaN(grams) && f(form.kcal_100g) > 0 && (
        <div style={s.preview}>
          <span style={s.previewKcal}>{Math.round(f(form.kcal_100g) * f(grams) / 100)} kcal</span>
          <span style={s.previewMeta}>{Math.round(f(form.protein_100g) * f(grams) / 10) / 10}g P</span>
        </div>
      )}
      <div style={s.manActions}>
        <button onClick={onCancel} style={s.cancelActionBtn}>Mégse</button>
        <button onClick={handleAdd} disabled={!valid || saving} style={s.addBtn}>
          {saving ? '...' : '+ Hozzáad és ment'}
        </button>
      </div>
    </div>
  )
}

export default function FoodSearch({ onAdd }) {
  const [tab, setTab] = useState('builtin') // builtin | packaged | manual
  const [query, setQuery] = useState('')
  const [customList, setCustomList] = useState([])
  const [selected, setSelected] = useState(null)
  const [ofResults, setOfResults] = useState([])
  const [ofLoading, setOfLoading] = useState(false)
  const [ofError, setOfError] = useState('')
  const [ofSelected, setOfSelected] = useState(null)
  const [ofGrams, setOfGrams] = useState('')

  useEffect(() => { loadCustom() }, [])

  async function loadCustom() {
    const { data } = await supabase.from('custom_ingredients').select('*').order('created_at', { ascending:false })
    setCustomList(data || [])
  }

  const builtinFiltered = query.trim()
    ? BUILTIN.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : BUILTIN

  const customFiltered = query.trim()
    ? customList.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : customList

  const allFiltered = [...customFiltered, ...builtinFiltered]

  async function searchOF(e) {
    e.preventDefault()
    if (!query.trim()) return
    setOfLoading(true)
    setOfError('')
    setOfResults([])
    setOfSelected(null)
    try {
      const res = await fetch(`${OF_API}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=id,code,product_name,product_name_en,brands,nutriments`)
      const data = await res.json()
      const valid = (data.products || [])
        .map(p => {
          const n = p.nutriments || {}
          return {
            id: p.id || p.code,
            name: p.product_name || p.product_name_en || '',
            brand: p.brands || '',
            kcal_100g: Math.round(n['energy-kcal_100g'] || 0),
            protein_100g: Math.round((n['proteins_100g'] || 0) * 10) / 10,
            carbs_100g: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
            fat_100g: Math.round((n['fat_100g'] || 0) * 10) / 10,
            fiber_100g: Math.round((n['fiber_100g'] || 0) * 10) / 10,
          }
        })
        .filter(p => p.name && p.kcal_100g > 0)
      setOfResults(valid)
      if (valid.length === 0) setOfError('Nem találtunk csomagolt terméket.')
    } catch { setOfError('Hálózati hiba.') }
    setOfLoading(false)
  }

  function handleAdd(item) {
    onAdd(item)
    setSelected(null)
    setQuery('')
    setOfSelected(null)
    setOfGrams('')
    setOfResults([])
  }

  return (
    <div style={s.wrap}>
      <div style={s.tabs}>
        {[['builtin','Alapanyagok'],['packaged','Csomagolt'],['manual','Saját']].map(([id,label]) => (
          <button key={id} onClick={() => { setTab(id); setQuery(''); setSelected(null) }}
            style={{ ...s.tabBtn, ...(tab===id ? s.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'builtin' && (
        <div>
          <input value={query} onChange={e => { setQuery(e.target.value); setSelected(null) }}
            placeholder="Keresés: tojás, csirke, lazac..." style={s.searchInput} />
          {selected
            ? <GramPicker ingredient={selected} onAdd={handleAdd} onCancel={() => setSelected(null)} />
            : (
              <div style={s.list}>
                {customFiltered.length > 0 && (
                  <>
                    <div style={s.listSection}>Saját alapanyagaim</div>
                    {customFiltered.map((i,idx) => (
                      <div key={idx} style={s.listItem} onClick={() => setSelected(i)}>
                        <span style={s.listName}>{i.name}</span>
                        <span style={s.listMeta}>{i.kcal_100g} kcal · {i.protein_100g}g P</span>
                      </div>
                    ))}
                    <div style={s.listSection}>Beépített lista</div>
                  </>
                )}
                {builtinFiltered.map((i,idx) => (
                  <div key={idx} style={s.listItem} onClick={() => setSelected(i)}>
                    <span style={s.listName}>{i.name}</span>
                    <span style={s.listMeta}>{i.kcal_100g} kcal · {i.protein_100g}g P · {i.fiber_100g}g rost</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {tab === 'packaged' && (
        <div>
          <form onSubmit={searchOF} style={s.ofRow}>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Keresés angolul: ramen, protein bar..." style={s.searchInput} />
            <button type="submit" disabled={ofLoading} style={s.searchBtn}>{ofLoading ? '...' : '🔍'}</button>
          </form>
          {ofError && <div style={s.err}>{ofError}</div>}
          {ofSelected
            ? (
              <div style={s.gramBox}>
                <div style={s.gramName}>{ofSelected.name}</div>
                <div style={s.gramPer}>{ofSelected.brand && `${ofSelected.brand} · `}{ofSelected.kcal_100g} kcal · {ofSelected.protein_100g}g P</div>
                <div style={s.gramRow}>
                  <input type="number" value={ofGrams} onChange={e => setOfGrams(e.target.value)}
                    placeholder="Gramm" style={s.gramInput} autoFocus />
                  <span style={{ fontSize:13, color:'#606060' }}>g</span>
                  <button onClick={() => setOfSelected(null)} style={s.cancelSmall}>✕</button>
                </div>
                {ofGrams && !isNaN(ofGrams) && Number(ofGrams) > 0 && (
                  <div style={s.preview}>
                    <span style={s.previewKcal}>{Math.round(ofSelected.kcal_100g * ofGrams / 100)} kcal</span>
                    <span style={s.previewMeta}>{Math.round(ofSelected.protein_100g * ofGrams / 10) / 10}g P</span>
                  </div>
                )}
                <button onClick={() => {
                  if (!ofGrams || isNaN(ofGrams) || Number(ofGrams) <= 0) return
                  handleAdd(calcItem(ofSelected, Number(ofGrams)))
                }} style={s.addBtn}>+ Hozzáad</button>
              </div>
            )
            : (
              <div style={s.list}>
                {ofResults.map((p,i) => (
                  <div key={i} style={s.listItem} onClick={() => setOfSelected(p)}>
                    <div style={s.listName}>{p.name}</div>
                    <div style={s.listMeta}>{p.brand && `${p.brand} · `}{p.kcal_100g} kcal · {p.protein_100g}g P · {p.carbs_100g}g C · {p.fat_100g}g F</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {tab === 'manual' && (
        <ManualEntry onAdd={handleAdd} onCancel={() => setTab('builtin')} />
      )}
    </div>
  )
}

const s = {
  wrap: { display:'flex', flexDirection:'column', gap:10 },
  tabs: { display:'flex', gap:6, marginBottom:4 },
  tabBtn: { flex:1, padding:'8px 0', borderRadius:8, border:'1px solid #2a2a2a', background:'#1e1e1e', color:'#606060', fontSize:12, fontWeight:500, cursor:'pointer' },
  tabActive: { background:'#052e16', borderColor:'#22c55e', color:'#22c55e' },
  searchInput: { width:'100%', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#e8e8e8', fontSize:13, outline:'none', boxSizing:'border-box' },
  ofRow: { display:'flex', gap:8 },
  searchBtn: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, color:'#e8e8e8', padding:'10px 14px', cursor:'pointer' },
  list: { maxHeight:260, overflowY:'auto', background:'#1a1a1a', borderRadius:8, border:'1px solid #2a2a2a' },
  listSection: { fontSize:10, color:'#606060', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', padding:'8px 14px 4px', background:'#111' },
  listItem: { padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid #222' },
  listName: { fontSize:13, color:'#e8e8e8', display:'block', marginBottom:2 },
  listMeta: { fontSize:11, color:'#606060' },
  err: { fontSize:12, color:'#a0a0a0', padding:'8px 0' },
  gramBox: { background:'#1a1a1a', border:'1px solid #22c55e33', borderRadius:8, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 },
  gramName: { fontSize:14, fontWeight:500, color:'#e8e8e8' },
  gramPer: { fontSize:12, color:'#606060' },
  gramRow: { display:'flex', alignItems:'center', gap:8 },
  gramInput: { width:90, background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#e8e8e8', fontSize:14, outline:'none' },
  cancelSmall: { background:'none', border:'none', color:'#606060', fontSize:14, cursor:'pointer', marginLeft:'auto' },
  preview: { display:'flex', alignItems:'baseline', gap:10, background:'#0d1a0d', borderRadius:6, padding:'8px 10px' },
  previewKcal: { fontSize:16, fontWeight:600, color:'#22c55e' },
  previewMeta: { fontSize:12, color:'#606060' },
  addBtn: { background:'#22c55e', color:'#0d1a0d', border:'none', borderRadius:8, padding:'10px', fontSize:13, fontWeight:600, cursor:'pointer' },
  manualBox: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, padding:'14px', display:'flex', flexDirection:'column', gap:10 },
  manualTitle: { fontSize:14, fontWeight:500, color:'#e8e8e8' },
  manualNote: { fontSize:12, color:'#606060', lineHeight:1.5 },
  manInput: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#e8e8e8', fontSize:14, outline:'none' },
  manualGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  manField: { display:'flex', flexDirection:'column', gap:4 },
  manLabel: { fontSize:11, color:'#606060' },
  manNumInput: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#e8e8e8', fontSize:13, outline:'none' },
  manActions: { display:'flex', gap:8 },
  cancelActionBtn: { flex:1, background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#a0a0a0', padding:10, fontSize:13, cursor:'pointer' },
}
