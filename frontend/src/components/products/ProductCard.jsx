import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart.js'
import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import ProductArtwork from './ProductArtwork.jsx'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function ProductCard({ product }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const saved = isWishlisted(product.id)
  const [added, setAdded] = useState(false)

  function quickAdd() {
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return (
    <article className="group min-w-0">
      <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
        <Link to={`/product/${product.id}`} className="block">
        <div className="card-shine relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-line transition-all duration-300 group-hover:border-rose/30 group-hover:shadow-[0_18px_40px_rgba(59,48,44,0.12)]">
          <ProductArtwork product={product} className="size-full transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
          {product.badge && <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-rose">{product.badge}</span>}
          {product.old > product.price && <span className="absolute bottom-4 left-4 rounded-full bg-rose px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">-{Math.round((1 - product.price / product.old) * 100)}%</span>}
        </div>
        <div className="px-1.5 pt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">{product.type}</p>
          <h3 className="mb-1 mt-1 font-serif text-[19px] leading-snug">{product.name}</h3>
          <p className="flex items-center gap-2 text-xs text-ink-soft"><span className="text-gold">★ {product.rating}</span><span className={Number(product.stock) > 0 ? '' : 'text-lowstock-text'}>({Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'})</span></p>
        </div>
      </Link>
        <button type="button" onClick={() => toggleWishlist(product)} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={saved} className={`absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-line bg-cream/95 transition hover:scale-105 ${saved ? 'text-rose' : 'text-ink-soft hover:text-rose'}`}><Icon name="heart" className="size-[17px]" fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="mt-2.5 flex items-center justify-between px-1.5"><div className="flex items-center gap-2 text-sm font-medium"><span>{money(product.price)}</span>{product.old > product.price && <span className="text-xs font-normal text-ink-soft line-through">{money(product.old)}</span>}</div><Button type="button" variant="rose" className={`gap-1.5 px-4 py-2.5 text-[13px] tracking-[0.04em] ${added ? 'bg-gold hover:bg-gold' : ''}`} aria-label={`Add ${product.name} to bag`} onClick={quickAdd}><Icon name="bag" className="size-[17px]" />{added ? 'Added' : 'Add'}</Button></div>
    </article>
  )
}
