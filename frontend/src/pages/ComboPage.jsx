import { Link, useParams } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import ProductArtwork from '../components/products/ProductArtwork.jsx'
import ProductBenefits from '../components/products/ProductBenefits.jsx'
import { useCart } from '../context/useCart.js'
import { useCatalog } from '../context/useCatalog.js'

const comboDefinitions = [
  { id: 'c1', name: 'Daily Glow Ritual', description: 'Cleanse, treat and moisturise with these catalog products.', productIds: ['cosrx-low-ph-good-morning-gel-cleanser', 'the-ordinary-niacinamide-10-zinc-1', 'cerave-moisturizing-cream'] },
  { id: 'c2', name: 'Night Repair Duo', description: 'A simple evening cleanse and hydration ritual from the catalog.', productIds: ['anua-heartleaf-77-hydrating-soothing-toner', 'cosrx-advanced-snail-96-mucin-power-essence'] },
]
const money = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`
const comboMembers = (combo, products) => combo.productIds.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean)

function ProductList({ products }) {
  return <ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-cream">{products.map((product) => <li key={product.id}><Link to={`/product/${product.id}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-pink-soft/50"><span className="size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-white"><ProductArtwork product={product} className="size-full"/></span><span className="flex-1 truncate text-sm group-hover:text-rose">{product.name}</span><span className="text-[13px] text-ink-soft">{money(product.price)}</span></Link></li>)}</ul>
}
function AddCombo({ products }) {
  const { addItem } = useCart()
  return <button type="button" disabled={!products.length} onClick={() => products.forEach((product) => addItem(product))} className="rounded-full bg-rose px-5 py-2.5 text-xs font-medium text-white transition hover:bg-rose-deep disabled:opacity-50">Add combo</button>
}
function ComboCard({ combo, products }) {
  const members = comboMembers(combo, products)
  const total = members.reduce((sum, product) => sum + product.price, 0)
  return <article className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-cream transition-all hover:-translate-y-1 hover:border-rose/40 hover:shadow-[0_18px_40px_rgba(59,48,44,.09)]"><Link to={`/combo/${combo.id}`} className="flex items-center justify-center gap-3 bg-pink-soft/60 px-5 py-7">{members.slice(0, 4).map((product) => <div key={product.id} className="size-16 overflow-hidden rounded-2xl border border-white/70"><ProductArtwork product={product} className="size-full"/></div>)}</Link><div className="flex flex-1 flex-col p-5"><h2 className="font-serif text-xl"><Link to={`/combo/${combo.id}`}>{combo.name}</Link></h2><p className="mt-1.5 text-[13px] text-ink-soft">{combo.description}</p><div className="mt-3"><ProductList products={members}/></div><div className="mt-4 flex items-end justify-between border-t border-line pt-4"><div><p className="font-serif text-2xl">{money(total)}</p><p className="text-xs text-ink-soft">Current catalog total</p></div><AddCombo products={members}/></div></div></article>
}
function ComboDetail({ combo, products }) {
  const members = comboMembers(combo, products)
  const total = members.reduce((sum, product) => sum + product.price, 0)
  return <PageContainer className="animate-fadeup max-w-[1200px] py-10"><Link to="/combo" className="mb-6 inline-block text-sm text-ink-soft hover:text-rose">← Back to combo sets</Link><div className="grid items-start gap-10 md:grid-cols-2"><div className="grid grid-cols-2 gap-3 rounded-3xl bg-pink-soft/50 p-4">{members.map((product) => <div key={product.id} className="aspect-square overflow-hidden rounded-2xl bg-white"><ProductArtwork product={product} className="size-full"/></div>)}</div><section><span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold uppercase text-ink-soft">Combo set</span><h1 className="mt-3 font-serif text-4xl">{combo.name}</h1><p className="my-4 text-2xl font-semibold">{money(total)}</p><p className="text-[15px] leading-relaxed text-ink-soft">{combo.description}</p><h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-ink-soft">What’s inside · {members.length} products</h2><ProductList products={members}/><div className="mt-5"><AddCombo products={members}/></div><div className="mt-6"><ProductBenefits/></div></section></div></PageContainer>
}
export default function ComboPage() {
  const { products } = useCatalog()
  const { comboId } = useParams()
  const combos = comboDefinitions.map((combo) => ({ ...combo, products: comboMembers(combo, products) })).filter((combo) => combo.products.length === combo.productIds.length)
  const selected = combos.find((combo) => combo.id === comboId)
  if (comboId) return selected ? <ComboDetail combo={selected} products={products}/> : <PageContainer className="py-16 text-center"><p className="text-ink-soft">This combo is not available in the current catalog.</p><Link to="/combo" className="mt-4 inline-block text-rose underline">Back to combo sets</Link></PageContainer>
  return <PageContainer className="py-12"><header className="mb-9 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Better together</p><h1 className="mt-2 font-serif text-[clamp(30px,4.5vw,42px)]">Combo sets</h1><p className="mt-1.5 text-sm text-ink-soft">Curated routines from products currently in the catalog. Cart and checkout use each actual product and its live price.</p></header>{combos.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{combos.map((combo) => <ComboCard key={combo.id} combo={combo} products={products}/>)}</div> : <div className="rounded-3xl border border-line bg-cream px-6 py-14 text-center text-sm text-ink-soft">These combo products are unavailable in the current catalog.</div>}</PageContainer>
}
