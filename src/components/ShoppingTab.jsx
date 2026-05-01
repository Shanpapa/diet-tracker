import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const TEMPLATE = [
  { name:'Egész csirke', quantity:'1 db (~1.5 kg)', category:'Fehérjék' },
  { name:'Magyar kolbász', quantity:'500 g', category:'Fehérjék' },
  { name:'Tonhal konzerv', quantity:'6 db', category:'Fehérjék' },
  { name:'Tojás', quantity:'18 db', category:'Fehérjék' },
  { name:'Gyoza (fagyasztott)', quantity:'1 csomag (~20 db)', category:'Fehérjék' },
  { name:'Savoy káposzta', quantity:'1 fej', category:'Zöldségek' },
  { name:'Paprika (piros / sárga)', quantity:'6 db', category:'Zöldségek' },
  { name:'Paradicsom', quantity:'500 g', category:'Zöldségek' },
  { name:'Gomba', quantity:'400 g', category:'Zöldségek' },
  { name:'Répa', quantity:'4 db', category:'Zöldségek' },
  { name:'Fehérrépa', quantity:'2 db', category:'Zöldségek' },
  { name:'Krumpli', quantity:'1.5 kg', category:'Zöldségek' },
  { name:'Cukkini', quantity:'2 db', category:'Zöldségek' },
  { name:'Uborka', quantity:'3 db', category:'Zöldségek' },
  { name:'Banán', quantity:'8 db', category:'Gyümölcsök' },
  { name:'Áfonya / bogyós mix', quantity:'500 g (fagyasztott is jó)', category:'Gyümölcsök' },
  { name:'Kivi', quantity:'7 db', category:'Gyümölcsök' },
  { name:'Avokádó', quantity:'3-4 db', category:'Gyümölcsök' },
  { name:'Görög joghurt (természetes)', quantity:'1 kg', category:'Tejtermék & magvak' },
  { name:'Chia mag', quantity:'200 g (ha nincs)', category:'Tejtermék & magvak' },
  { name:'Dió', quantity:'150 g', category:'Tejtermék & magvak' },
  { name:'Mandula', quantity:'150 g', category:'Tejtermék & magvak' },
  { name:'Kimchi', quantity:'1 üveg (ha nincs)', category:'Kamra' },
  { name:'Ramen alap', quantity:'5 csomag', category:'Kamra' },
  { name:'Rizs', quantity:'1 kg', category:'Kamra' },
  { name:'Tészta', quantity:'500 g', category:'Kamra' },
  { name:'Savanyúság', quantity:'1 üveg (ha nincs)', category:'Kamra' },
]

const CATS = ['Fehérjék','Zöldségek','Gyümölcsök','Tejtermék & magvak','Kamra','Egyéb']

export default function ShoppingTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [resetting, setResetting] = useState(false)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    const { data, error } = await supabase
      .from('shopping_items').select('*').order('category').order('created_at')
    if (error) setErr(error.message)
    else setItems(data || [])
    setLoading(false)
  }

  async function toggle(item) {
    await supabase.from('shopping_items').update({ checked:!item.checked }).eq('id', item.id)
    await loadItems()
  }

  async function resetList() {
    setResetting(true)
    setErr('')
    const { error: delErr } = await supabase.from('shopping_items')
      .delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (delErr) { setErr(delErr.message); setResetting(false); return }
    const { error: insErr } = await supabase.from('shopping_items')
      .insert(TEMPLATE.map(t => ({ ...t, checked:false })))
    if (insErr) setErr(insErr.message)
    await loadItems()
    setResetting(false)
  }

  async function addItem(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    setAdding(true)
    setErr('')
    const { error } = await supabase.from('shopping_items')
      .insert({ name:newItem.trim(), category:'Egyéb', checked:false })
    if (error) setErr(error.message)
    else setNewItem('')
    await loadItems()
    setAdding(false)
  }

  const done = items.filter(i => i.checked).length

  if (loading) return <div style={{ color:'#606060', textAlign:'center', paddingTop:40 }}>betöltés...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <span style={{ fontSize:14, color:'#a0a0a0', fontWeight:500 }}>{done} / {items.length} kész</span>
        <button onClick={resetList} disabled={resetting} style={s.resetBtn}>
          {resetting ? '...' : '↺ Heti lista reset'}
        </button>
      </div>

      {err && <div style={s.errBox}>{err}</div>}

      <form onSubmit={addItem} style={{ display:'flex', gap:8, marginBottom:20 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)}
          placeholder="Extra tétel..." style={s.input} />
        <button type="submit" disabled={adding} style={s.addBtn}>{adding ? '…' : '+'}</button>
      </form>

      {items.length === 0 && (
        <div style={s.empty}>
          A lista üres — nyomd meg a <strong>↺ Heti lista reset</strong> gombot a heti bevásárlólista betöltéséhez.
        </div>
      )}

      {CATS.map(cat => {
        const catItems = items.filter(i => i.category === cat)
        if (catItems.length === 0) return null
        return (
          <div key={cat} style={s.section}>
            <div style={s.catTitle}>{cat}</div>
            {catItems.map(item => (
              <div key={item.id} style={{ ...s.item, opacity: item.checked ? 0.45 : 1 }} onClick={() => toggle(item)}>
                <div style={{ ...s.cb, ...(item.checked ? s.cbDone : {}) }}>
                  {item.checked && <span style={{ color:'#0d1a0d', fontSize:11, fontWeight:700 }}>✓</span>}
                </div>
                <span style={{ flex:1, fontSize:14, color:'#e8e8e8', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
                {item.quantity && <span style={{ fontSize:12, color:'#606060' }}>{item.quantity}</span>}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

const s = {
  resetBtn: { background:'none', border:'1px solid #2a2a2a', borderRadius:8, color:'#606060', padding:'8px 14px', fontSize:13 },
  input: { flex:1, background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'12px 14px', color:'#e8e8e8', fontSize:14, outline:'none' },
  addBtn: { background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, color:'#22c55e', width:46, fontSize:22, fontWeight:300 },
  section: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, overflow:'hidden', marginBottom:12 },
  catTitle: { fontSize:11, fontWeight:500, color:'#606060', textTransform:'uppercase', letterSpacing:'0.5px', padding:'12px 16px 10px', borderBottom:'1px solid #2a2a2a' },
  item: { display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid #1e1e1e', cursor:'pointer' },
  cb: { width:20, height:20, borderRadius:5, border:'1.5px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  cbDone: { background:'#22c55e', borderColor:'#22c55e' },
  errBox: { background:'#1a0000', border:'1px solid #3a0000', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:12 },
  empty: { background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:'20px 18px', color:'#a0a0a0', fontSize:14, lineHeight:1.6, marginBottom:16 },
}
