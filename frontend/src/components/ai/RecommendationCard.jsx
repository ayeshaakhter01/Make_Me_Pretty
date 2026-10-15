import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart.js'
import { Button } from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import ProductArtwork from '../products/ProductArtwork.jsx'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function RecommendationCard({ product, reason, rank }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const soldOut = product.stock <= 0

  function addToBag() {
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-cream transition-all duration-300 hover:-translate-y-1.5 hover:border-rose/30 hover:shadow-[0_18px_40px_rgba(59,48,44,0.12)]">
      <Link to={`/product/${product.id}`} className="relative block" aria-label={`View ${product.name}`}>
        <ProductArtwork product={product} className="aspect-[16/9] w-full transition-transform sm:aspect-[5/4] duration-700 ease-out group-hover:scale-[1.04]" />
        <span className="absolute left-4 top-4 grid size-8 place-items-center rounded-full bg-paper/90 font-serif text-sm text-rose shadow-sm">{rank}</span>
        {product.badge && <span className="absolute right-4 top-4 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-rose">{product.badge}</span>}
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">{product.type}</p>
        <h3 className="mt-1 font-serif text-[19px] leading-snug"><Link to={`/product/${product.id}`} className="hover:text-rose">{product.name}</Link></h3>
        <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft"><span className="text-gold">★ {product.rating}</span><span>({product.reviews})</span></p>

        <div className="mt-4 flex-1 rounded-2xl bg-pink-soft px-4 py-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose"><Icon name="sparkle" className="size-3.5" />Why it suits you</p>
          <p className="text-[13px] leading-5 text-ink">{reason}</p>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5">{product.ing.slice(0, 3).map((name) => <li key={name} className="rounded-full border border-line px-2.5 py-1 text-[10.5px] text-ink-soft">{name}</li>)}</ul>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 text-sm font-medium"><span>{money(product.price)}</span>{product.old > product.price && <span className="text-xs font-normal text-ink-soft line-through">{money(product.old)}</span>}</div>
          <Button type="button" variant="rose" disabled={soldOut} onClick={addToBag} aria-label={`Add ${product.name} to bag`} className={`gap-1.5 px-4 py-2.5 text-[13px] tracking-[0.04em] ${added ? 'bg-gold hover:bg-gold' : ''}`}>
            <Icon name="bag" className="size-[17px]" />{soldOut ? 'Sold out' : added ? 'Added' : 'Add to Bag'}
          </Button>
        </div>
      </div>
    </article>
  )
}
