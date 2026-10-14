import { Link, useParams } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import ProductArtwork from '../components/products/ProductArtwork.jsx'
import { useCart } from '../context/useCart.js'
import { products } from '../data/products.js'
import ProductBenefits from '../components/products/ProductBenefits.jsx'

const comboDefinitions = [
  { id: 'c1', name: 'Daily Glow Ritual', description: 'Cleanse, treat and moisturise — the essentials in one set.', price: 2800, productIds: ['1', '3', '2'] },
  { id: 'c2', name: 'Night Repair Duo', description: 'Wake up to plush, rested skin.', price: 2400, productIds: ['5', '6'] },
]
const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

function makeComboProduct(combo) {
  const members = combo.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean)
  return {
    id: `combo-${combo.id}`,
    comboId: combo.id,
    name: combo.name,
    description: combo.description,
    category: 'Combo',
    type: 'Curated set',
    price: combo.price,
    old: members.reduce((total, product) => total + product.price, 0),
    shape: 'jar',
    c1: '#F6DEE3',
    c2: '#DBA8B1',
    rating: 5,
    reviews: 0,
    stock: 20,
    badge: null,
    ingredients: [],
  }
}

function ComboCard({ combo, index = 0 }) {
  const { addItem } = useCart()
  const members = combo.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean)
  const originalTotal = members.reduce((total, product) => total + product.price, 0)
  const bundle = makeComboProduct(combo)

  return <article style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }} className="animate-fadeup group flex flex-col overflow-hidden rounded-[24px] border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-[0_18px_40px_rgba(59,48,44,.09)]"><Link to={`/combo/${combo.id}`} aria-label={`View ${combo.name}`} className="card-shine flex items-center justify-center gap-3 bg-pink-soft/60 px-5 py-7">{members.slice(0,4).map((product) => <div key={product.id} className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/70 shadow-sm"><ProductArtwork product={product} className="size-full"/></div>)}</Link><div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-2"><h2 className="font-serif text-xl leading-tight group-hover:text-rose"><Link to={`/combo/${combo.id}`}>{combo.name}</Link></h2>{originalTotal > combo.price && <span className="whitespace-nowrap rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-[#8a6a2f]">Save {money(originalTotal - combo.price)}</span>}</div><p className="mt-1.5 text-[13px] text-ink-soft">{combo.description}</p><ul className="mt-3 space-y-1 text-[13px] text-ink-soft">{members.map((product) => <li key={product.id} className="flex items-center gap-2"><span className="text-rose">✦</span><Link to={`/product/${product.id}`} className="flex-1 truncate hover:text-rose">{product.name}</Link><span>{money(product.price)}</span></li>)}</ul><div className="mt-4 flex items-end justify-between border-t border-line pt-4"><div><p className="font-serif text-2xl">{money(combo.price)}</p>{combo.price < originalTotal && <p className="text-xs text-ink-soft line-through">{money(originalTotal)}</p>}</div><button type="button" onClick={() => addItem(bundle)} className="rounded-full bg-rose px-5 py-2.5 text-xs font-medium text-white transition hover:bg-rose-deep">Add combo</button></div></div></article>
}

function ComboDetail({ combo }) {
  const { addItem } = useCart()
  const members = combo.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean)
  const bundle = makeComboProduct(combo)
  const originalTotal = members.reduce((total, product) => total + product.price, 0)

  return <PageContainer className="animate-fadeup max-w-[1200px] py-10"><Link to="/combo" className="mb-6 inline-block text-sm text-ink-soft transition-colors hover:text-rose">← Back to combo sets</Link><div className="grid items-start gap-10 md:grid-cols-2 md:gap-12"><div className="grid grid-cols-2 gap-3 rounded-3xl bg-pink-soft/50 p-4">{members.slice(0,4).map((product) => <div key={product.id} className="aspect-square overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm"><ProductArtwork product={product} className="size-full"/></div>)}</div><section><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">Combo set</span><span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">In stock</span>{originalTotal > combo.price && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-[#8a6a2f]">Save {money(originalTotal - combo.price)}</span>}</div><h1 className="mt-3 font-serif text-[36px] font-normal leading-tight">{combo.name}</h1><div className="my-5 flex items-end gap-3"><span className="text-2xl font-semibold">{money(combo.price)}</span>{originalTotal > combo.price && <span className="text-base text-ink-soft line-through">{money(originalTotal)}</span>}</div><p className="text-[15.5px] leading-[1.75] text-ink-soft">{combo.description}</p><h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">What’s inside · {members.length} products</h2><ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-cream">{members.map((product) => <li key={product.id}><Link to={`/product/${product.id}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-pink-soft/50"><span className="size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-white"><ProductArtwork product={product} size={0.42} className="size-full"/></span><span className="flex-1 truncate text-[14px] group-hover:text-rose">{product.name}</span><span className="text-[13px] text-ink-soft">{money(product.price)}</span><span className="text-rose opacity-0 transition-opacity group-hover:opacity-100">→</span></Link></li>)}</ul><button type="button" onClick={() => addItem(bundle)} className="mt-6 w-full rounded-full bg-rose px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-rose-deep">Add bundle to bag · {money(combo.price)}</button><div className="mt-6"><ProductBenefits/></div></section></div></PageContainer>
}

export default function ComboPage() {
  const { comboId } = useParams()
  const combos = comboId ? comboDefinitions.filter((combo) => combo.id === comboId) : comboDefinitions
  if (comboId && combos.length) return <ComboDetail combo={combos[0]}/>
  return <PageContainer className="py-12"><header className="animate-fadeup mb-9 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Better together</p><h1 className="mt-2 font-serif text-[clamp(30px,4.5vw,42px)] font-normal">Combo sets</h1><p className="mt-1.5 text-[14px] text-ink-soft">Curated bundles at a set price — everything your ritual needs, in one tap.</p></header>{combos.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{combos.map((combo, index) => <ComboCard key={combo.id} combo={combo} index={index}/>)}</div> : <div className="mx-auto max-w-lg rounded-3xl border border-line bg-cream px-6 py-14 text-center"><span aria-hidden="true" className="text-3xl text-rose">✿</span><h2 className="mt-3 font-serif text-2xl">That combo is not here</h2><Link to="/combo" className="mt-5 inline-flex text-sm text-rose underline">View all combo sets</Link></div>}</PageContainer>
}
