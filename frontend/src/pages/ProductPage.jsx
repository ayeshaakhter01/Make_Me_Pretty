  import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import ProductGallery from '../components/products/ProductGallery.jsx'
import ProductGrid from '../components/products/ProductGrid.jsx'
import ProductBenefits from '../components/products/ProductBenefits.jsx'
import ProductUsage from '../components/products/ProductUsage.jsx'
import ProductReviewForm from '../components/products/ProductReviewForm.jsx'
import { ReviewPhotos } from '../components/products/ReviewPhoto.jsx'
import { getReviewPhotos } from '../components/products/reviewPhotos.js'
import Icon from '../components/ui/Icon.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { useCart } from '../context/useCart.js'
import { useCatalog } from '../context/useCatalog.js'
import { apiRequest } from '../api.js'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function ProductPage() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const { products } = useCatalog()
  const product = products.find((item) => item.id === productId || item.slug === productId)
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [myReviews, setMyReviews] = useState({})
  const [approvedReviews, setApprovedReviews] = useState([])
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 })
  const [selectedReview, setSelectedReview] = useState(null)
  const swiperRef = useRef(null)

  useEffect(() => {
    let current = true
    apiRequest(`/products/${productId}/reviews`)
      .then((result) => { if (current) { setApprovedReviews(result.reviews); setRatingSummary(result.rating) } })
      .catch(() => { if (current) { setApprovedReviews([]); setRatingSummary({ average: 0, count: 0 }) } })
    return () => { current = false }
  }, [productId])

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') setSelectedReview(null) }
    if (selectedReview) {
      document.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
      swiperRef.current?.autoplay?.stop()
    } else {
      document.body.style.overflow = ''
      swiperRef.current?.autoplay?.start()
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedReview])

  if (!product) return <PageContainer className="py-24 text-center"><h1 className="font-display text-3xl">We couldn’t find that little lovely.</h1><Link to="/shop" className="mt-5 inline-block text-rose-deep underline">Back to the shop</Link></PageContainer>

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 6)
  const saved = isWishlisted(product.id)
  const displayReviews = approvedReviews.map((review) => ({
    ...review,
    id: review._id,
    name: review.customerName,
    product: product.name,
  }))

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
          <div className="flex flex-wrap gap-2">{product.badge && <span className="rounded-full bg-gold-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a6a2f]">{product.badge}</span>}<span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span></div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink-soft">{product.category} · {product.type}</p>
          <h1 className="mt-2 font-display text-[clamp(30px,4vw,48px)] leading-[1.1]">{product.name}</h1>
          <a href="#product-reviews" onClick={(event) => { event.preventDefault(); document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' }) }} className="mt-3 flex w-fit items-center gap-2 text-sm text-ink-soft transition hover:text-rose-deep"><span className="flex gap-0.5 text-gold" aria-label={`${ratingSummary.average} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className={`size-3.5 ${index < Math.round(ratingSummary.average) ? 'fill-current' : ''}`}/>)}</span><span>{ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'}</span></a>
          <div className="mt-6 flex items-baseline gap-3"><span className="text-[28px] font-semibold">{money(product.price)}</span>{product.old > product.price && <span className="text-base text-ink-soft line-through">{money(product.old)}</span>}</div>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">{product.description}</p>
          <div className="mt-6"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Best for · {product.skin}</p><div className="mt-3 flex flex-wrap gap-2">{(product.ingredients || product.ing || []).map((ingredient) => <span key={ingredient} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3.5 py-2 text-[12px] text-ink-soft"><span aria-hidden="true" className="text-[11px] text-rose">✿</span>{ingredient}</span>)}</div></div>
          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center gap-3 rounded-full border-[1.5px] border-line px-4"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="text-lg text-ink-soft hover:text-rose">−</button><span className="min-w-5 text-center text-sm">{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} className="text-lg text-ink-soft hover:text-rose">+</button></div>
            <button type="button" onClick={handleAdd} className={`inline-flex flex-1 basis-48 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.03em] text-white transition-all ${added ? 'bg-gold' : 'bg-rose hover:-translate-y-0.5 hover:bg-rose-deep'}`}><Icon name="bag" className="size-4.25"/>{added ? 'Added' : `Add to Bag — ${money(product.price * quantity)}`}</button>
            <button type="button" onClick={() => toggleWishlist(product)} aria-pressed={saved} className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-3.5 text-sm transition-colors hover:bg-ink hover:text-ivory">{saved ? '♥ Saved' : '♡ Save'}</button>
          </div>
          <div className="mt-7"><ProductBenefits/></div>
        </section>
      </div>
    </PageContainer>
    <PageContainer className="mt-16 pb-0 pt-0"><ProductUsage product={product}/></PageContainer>
    <PageContainer className="mt-16 pb-0 pt-0">
      <section id="product-reviews" aria-labelledby="product-reviews-title" className="mx-auto max-w-300 scroll-mt-28">
        {displayReviews.length > 0 ? <div className="review-coverflow relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-16" aria-label="Customer reviews">
          <Reveal className="mx-auto mb-6 max-w-[1200px] px-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">From our customer community</p>
            <h2 id="product-reviews-title" className="mt-2 font-serif text-[34px] font-normal">What our customers say</h2>
          </Reveal>
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            modules={[EffectCoverflow, Autoplay, Pagination]}
            effect="coverflow" grabCursor centeredSlides loop speed={620}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }} slidesPerView={1.1}
            coverflowEffect={{ rotate: 3, stretch: 12, depth: 110, scale: 0.92, modifier: 1, slideShadows: false }}
            breakpoints={{ 640: { slidesPerView: 1.9 }, 1024: { slidesPerView: 2.8 }, 1440: { slidesPerView: 3.3 } }}
          >
            {displayReviews.map((review) => <SwiperSlide key={review.id} className="!h-auto px-1.5 py-5">
              <figure
                role="button" tabIndex={0} aria-label={`Read full review by ${review.name}`}
                onClick={() => setSelectedReview(review)}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedReview(review) } }}
                className="review-card flex h-full min-h-[250px] cursor-pointer flex-col overflow-hidden rounded-[22px] border border-line bg-cream transition-all duration-300 sm:min-h-[260px]"
              >
                <div className="flex flex-1 flex-col p-7">
                  <span className="text-[15px] tracking-[0.12em] text-gold" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span className="text-line">{'★'.repeat(5 - review.rating)}</span></span>
                  <blockquote className="my-3.5 line-clamp-4 flex-1 text-[14.5px] leading-relaxed">“{review.text}”</blockquote>
                  <figcaption className="text-[13px] text-ink-soft"><span className="font-medium text-ink">{review.name}</span><span className="mt-1 block text-gold">{review.product}</span></figcaption>
                  <span className="mt-3 text-[12px] font-medium text-rose">Read full review →{getReviewPhotos(review).length > 0 && <span className="ml-1.5 text-ink-soft">· {getReviewPhotos(review).length > 1 ? `${getReviewPhotos(review).length} photos` : 'includes a photo'}</span>}</span>
                </div>
              </figure>
            </SwiperSlide>)}
          </Swiper>
        </div> : <h2 id="product-reviews-title" className="mb-6 font-serif text-[28px] font-normal">What customers say</h2>}
        {(myReviews[product.id] || []).length > 0 && <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(myReviews[product.id] || []).map((review, index) => <article key={`mine-${index}`} className="rounded-[22px] border border-rose/30 bg-cream p-6">
            <p className="text-[14px] tracking-[0.12em] text-gold" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span className="text-line">{'★'.repeat(5 - review.rating)}</span></p>
            {review.title && <p className="mt-2 text-[14.5px] font-medium">{review.title}</p>}
            <p className="my-3 text-[14.5px] leading-relaxed text-ink">“{review.text}”</p>
            <ReviewPhotos review={review} name={review.name} className="mb-3" />
            <p className="text-[13px] text-ink-soft">{review.name} · <span className="text-rose">Pending approval</span></p>
          </article>)}
        </div>}
        <ProductReviewForm key={product.id} product={product} autoOpen={searchParams.get('review') === '1'} onSubmit={(review) => setMyReviews((current) => ({ ...current, [product.id]: [review, ...(current[product.id] || [])] }))}/>
      </section>
    </PageContainer>
    {selectedReview && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => setSelectedReview(null)}>
      <article role="dialog" aria-modal="true" aria-label={`Review by ${selectedReview.name}`} className="relative w-full max-w-[560px] rounded-3xl border border-line bg-cream p-7 shadow-2xl sm:p-9" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => setSelectedReview(null)} aria-label="Close review" className="absolute right-4 top-3 text-2xl text-ink-soft hover:text-ink">×</button>
        <span className="text-[15px] tracking-[0.12em] text-gold" aria-label={`${selectedReview.rating} out of 5 stars`}>{'★'.repeat(selectedReview.rating)}<span className="text-line">{'★'.repeat(5 - selectedReview.rating)}</span></span>
        <blockquote className="my-5 text-[16px] leading-[1.8]">“{selectedReview.text}”</blockquote>
        <ReviewPhotos review={selectedReview} name={selectedReview.name} size="size-28 sm:size-36" className="mb-5" />
        <p className="text-sm text-ink-soft"><span className="font-medium text-ink">{selectedReview.name}</span><span className="mt-1 block text-gold">{selectedReview.product}</span></p>
      </article>
    </div>}
    {related.length > 0 && <PageContainer className="mt-16 max-w-300 pb-14 pt-0"><h2 className="mb-6 font-serif text-[28px] font-normal">Complete the ritual</h2><ProductGrid products={related}/></PageContainer>}
  </>
}
