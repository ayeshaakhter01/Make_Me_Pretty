import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import ProductGallery from '../components/products/ProductGallery.jsx'
import ProductGrid from '../components/products/ProductGrid.jsx'
import ProductBenefits from '../components/products/ProductBenefits.jsx'
import Icon from '../components/ui/Icon.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import { useCart } from '../context/useCart.js'
import { getProduct, products } from '../data/products.js'
import { PRODUCT_REVIEWS } from '../data/reviewSource.js'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function ProductPage() {
  const { productId } = useParams()
  const product = getProduct(productId)
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) return <PageContainer className="py-24 text-center"><h1 className="font-display text-3xl">We couldn’t find that little lovely.</h1><Link to="/shop" className="mt-5 inline-block text-rose-deep underline">Back to the shop</Link></PageContainer>

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 6)
  const saved = isWishlisted(product.id)

  function handleAdd() {
    addItem(product, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return <>
    <PageContainer className="py-8 sm:py-10">
      <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="mb-7 inline-flex items-center gap-2 text-sm text-ink-soft transition hover:text-rose">← Back to collection</Link>
      <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <ProductGallery product={product}/>
        <section className="flex flex-col py-1">
          <div className="flex flex-wrap gap-2">{product.badge && <span className="rounded-full bg-gold-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a6a2f]">{product.badge}</span>}<span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">In stock</span></div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink-soft">{product.category} · {product.type}</p>
          <h1 className="mt-2 font-display text-[clamp(30px,4vw,48px)] leading-[1.1]">{product.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><span className="flex gap-0.5 text-gold" aria-label={`${product.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className={`size-3.5 ${index < Math.round(product.rating) ? 'fill-current' : ''}`}/>)}</span><span>{product.rating} · {product.reviews} verified reviews</span></p>
          <div className="mt-6 flex items-baseline gap-3"><span className="text-[28px] font-semibold">{money(product.price)}</span>{product.old > product.price && <span className="text-base text-ink-soft line-through">{money(product.old)}</span>}</div>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">{product.description}</p>
          <div className="mt-6"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Best for · {product.skin}</p><div className="mt-3 flex flex-wrap gap-2">{product.ingredients.map((ingredient) => <span key={ingredient} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3.5 py-2 text-[12px] text-ink-soft"><span aria-hidden="true" className="text-[11px] text-rose">✿</span>{ingredient}</span>)}</div></div>
          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center gap-3 rounded-full border-[1.5px] border-line px-4"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="text-lg text-ink-soft hover:text-rose">−</button><span className="min-w-5 text-center text-sm">{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} className="text-lg text-ink-soft hover:text-rose">+</button></div>
            <button type="button" onClick={handleAdd} className={`inline-flex flex-1 basis-48 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.03em] text-white transition-all ${added ? 'bg-gold' : 'bg-rose hover:-translate-y-0.5 hover:bg-rose-deep'}`}><Icon name="bag" className="size-[17px]"/>{added ? 'Added' : `Add to Bag — ${money(product.price * quantity)}`}</button>
            <button type="button" onClick={() => toggleWishlist(product)} aria-pressed={saved} className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-3.5 text-sm transition-colors hover:bg-ink hover:text-ivory">{saved ? '♥ Saved' : '♡ Save'}</button>
          </div>
          <div className="mt-7"><ProductBenefits/></div>
        </section>
      </div>
    </PageContainer>
    <PageContainer className="mt-16 pb-0 pt-0">
      <section aria-labelledby="product-reviews-title" className="mx-auto max-w-[1200px]">
        <h2 id="product-reviews-title" className="mb-6 font-serif text-[28px] font-normal">What customers say</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_REVIEWS.map((review) => <article key={review.name} className="rounded-[22px] border border-line bg-cream p-6">
            <p className="text-[14px] tracking-[0.12em] text-gold" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{review.rating < 5 && <span className="text-line">{'★'.repeat(5 - review.rating)}</span>}</p>
            <p className="my-3 text-[14.5px] leading-relaxed text-ink">“{review.text}”</p>
            <p className="text-[13px] text-ink-soft">{review.name} · <span className="text-gold">✓ Verified purchase</span></p>
          </article>)}
        </div>
      </section>
    </PageContainer>
    {related.length > 0 && <PageContainer className="mt-16 max-w-[1200px] pb-14 pt-0"><h2 className="mb-6 font-serif text-[28px] font-normal">Complete the ritual</h2><ProductGrid products={related}/></PageContainer>}
  </>
}
