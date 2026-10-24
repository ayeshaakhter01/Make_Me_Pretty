import { useEffect, useRef, useState } from 'react'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import Reveal from '../ui/Reveal.jsx'
import { apiRequest } from '../../api.js'

function Stars({ rating }) {
  return <span className="text-[15px] tracking-[0.12em] text-gold" aria-label={`${rating} out of 5 stars`}>{'★'.repeat(rating)}<span className="text-line">{'★'.repeat(5 - rating)}</span></span>
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [selectedReview, setSelectedReview] = useState(null)
  const swiperRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    apiRequest('/reviews/featured').then((items) => {
      if (!cancelled) setReviews(items.map((review) => ({ ...review, id: review._id, name: review.customerName, location: review.product?.name || 'Customer review', product: review.product?.name || 'Product' })))
    }).catch(() => { if (!cancelled) setReviews([]) })
    return () => { cancelled = true }
  }, [])

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

  if (reviews.length === 0) return null
  return <section className="review-coverflow overflow-hidden py-16" aria-label="Customer reviews">
    <Reveal className="mx-auto mb-6 max-w-[1200px] px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">{reviews.some((review) => review.isDemo) ? 'Customer review examples' : 'From our customer community'}</p>
      <h2 className="mt-2 font-serif text-[34px] font-normal">What our customers say</h2>
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
      {reviews.map((review) => <SwiperSlide key={review.id} className="!h-auto px-1.5 py-5">
        <figure
          role="button" tabIndex={0} aria-label={`Read full review by ${review.name}`}
          onClick={() => setSelectedReview(review)}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedReview(review) } }}
          className="review-card flex h-full min-h-[250px] cursor-pointer flex-col overflow-hidden rounded-[22px] border border-line bg-cream transition-all duration-300 sm:min-h-[260px]"
        >
          <div className="flex flex-1 flex-col p-7">
            <Stars rating={review.rating}/>
            <blockquote className="my-3.5 line-clamp-4 flex-1 text-[14.5px] leading-relaxed">“{review.text}”</blockquote>
            <figcaption className="text-[13px] text-ink-soft"><span className="font-medium text-ink">{review.name}</span><span className="mt-1 block text-gold">{review.product}</span></figcaption>
            <span className="mt-3 text-[12px] font-medium text-rose">Read full review →</span>
          </div>
        </figure>
      </SwiperSlide>)}
    </Swiper>
    {selectedReview && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => setSelectedReview(null)}>
      <article role="dialog" aria-modal="true" aria-label={`Review by ${selectedReview.name}`} className="relative w-full max-w-[560px] rounded-3xl border border-line bg-cream p-7 shadow-2xl sm:p-9" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => setSelectedReview(null)} aria-label="Close review" className="absolute right-4 top-3 text-2xl text-ink-soft hover:text-ink">×</button>
        <Stars rating={selectedReview.rating}/><blockquote className="my-5 text-[16px] leading-[1.8]">“{selectedReview.text}”</blockquote>
        <p className="text-sm text-ink-soft"><span className="font-medium text-ink">{selectedReview.name}</span><span className="mt-1 block text-gold">{selectedReview.product}</span></p>
      </article>
    </div>}
  </section>
}
