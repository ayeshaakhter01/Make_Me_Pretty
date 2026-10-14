import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const slides = [
  { type: 'video', src: '/media/hero/MPM.mp4', title: '', subtitle: '', href: '/shop' },
  { type: 'image', src: '/media/hero/brand.png', title: 'Glow, delivered', subtitle: 'Skincare you will love', href: '/shop' },
  { type: 'image', src: '/media/hero/photo2.jpg', title: 'New in Makeup', subtitle: 'Colour for every mood', href: '/makeup' },
  { type: 'image', src: '/media/hero/offers.png', title: 'Glow for less', subtitle: 'Our favourite skincare at special prices', href: '/offers' },
]

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

  return (
    <section className="hero3d relative w-full" aria-label="Featured beauty edits">
      <Swiper modules={[EffectCoverflow, Autoplay, Pagination]} effect="coverflow" grabCursor centeredSlides loop speed={1100} autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }} pagination={{ clickable: true }} slidesPerView={1.18} coverflowEffect={{ rotate: 4, stretch: '20%', depth: 200, scale: 0.9, modifier: 1, slideShadows: false }} onSwiper={syncVideos} onSlideChangeTransitionEnd={syncVideos}>
        {slides.map((slide) => <SwiperSlide key={slide.src}><Link to={slide.href} className="hero3d-card">{slide.type === 'video' ? <video src={slide.src} muted loop playsInline preload="metadata" onError={onImageError} className="hero3d-media" /> : <img src={slide.src} alt={slide.title || 'Make Me Pretty beauty essentials'} onError={onImageError} className="hero3d-media" />}{(slide.title || slide.subtitle) && <div className="hero3d-text"><h2 className="font-serif text-2xl leading-tight text-white sm:text-4xl">{slide.title}</h2><p className="mt-1.5 max-w-md text-[13px] text-white/90 sm:text-[15px]">{slide.subtitle}</p></div>}</Link></SwiperSlide>)}
      </Swiper>
    </section>
  )
}
