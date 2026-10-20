import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { KEYS } from '../admin/adminHelpers.js'
import { useStoredState } from '../admin/useStoredState.js'
import { SEED_HERO_SLIDES } from '../../data/siteContent.js'

function syncVideos(swiper) {
  swiper.slides.forEach((slide) => {
    const video = slide.querySelector('video')
    if (!video) return
    if (slide.classList.contains('swiper-slide-active')) video.play().catch(() => undefined)
    else video.pause()
  })
}

export default function HeroCarousel() {
  const onImageError = useCallback((event) => { event.currentTarget.style.display = 'none' }, [])
  /* the admin chooses these in the Banners tab; hidden slides (and a hidden video) are skipped */
  const [savedSlides] = useStoredState(KEYS.heroSlides, SEED_HERO_SLIDES)
  const slides = savedSlides.filter((slide) => slide.active)
  if (slides.length === 0) return null

  return (
    <section className="hero3d relative w-full" aria-label="Featured beauty edits">
      <Swiper modules={[EffectCoverflow, Autoplay, Pagination]} effect="coverflow" key={slides.map((slide) => slide.id).join('-')} grabCursor centeredSlides loop={slides.length > 3} speed={1100} autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }} pagination={{ clickable: true }} slidesPerView={1.18} coverflowEffect={{ rotate: 4, stretch: '20%', depth: 200, scale: 0.9, modifier: 1, slideShadows: false }} onSwiper={syncVideos} onSlideChangeTransitionEnd={syncVideos}>
        {slides.map((slide) => <SwiperSlide key={slide.id}><Link to={slide.href} className="hero3d-card">{slide.type === 'video' ? <video src={slide.src} muted loop playsInline preload="metadata" onError={onImageError} className="hero3d-media" /> : <img src={slide.src} alt={slide.title || 'Make Me Pretty beauty essentials'} onError={onImageError} className="hero3d-media" />}{(slide.title || slide.subtitle) && <div className="hero3d-text"><h2 className="font-serif text-2xl leading-tight text-white sm:text-4xl">{slide.title}</h2><p className="mt-1.5 max-w-md text-[13px] text-white/90 sm:text-[15px]">{slide.subtitle}</p></div>}</Link></SwiperSlide>)}
      </Swiper>
    </section>
  )
}
