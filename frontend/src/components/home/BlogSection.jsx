import { useCallback, useEffect, useRef, useState } from 'react'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { BLOG_POSTS } from '../../data/blogSource.js'
import Reveal from '../ui/Reveal.jsx'

function BlogReader({ post, onClose }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' }
  }, [onClose])

  function updateProgress(event) {
    const element = event.currentTarget
    const maxScroll = element.scrollHeight - element.clientHeight
    setProgress(maxScroll > 0 ? (element.scrollTop / maxScroll) * 100 : 0)
  }

  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 pt-20 backdrop-blur-sm sm:p-6" onClick={onClose}><article role="dialog" aria-modal="true" aria-label={post.title} onClick={(event) => event.stopPropagation()} onScroll={updateProgress} className="relative max-h-[calc(100vh-7rem)] w-[min(680px,94vw)] overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="sticky top-0 z-10 h-1 bg-pink-soft"><div className="h-full bg-rose transition-[width]" style={{ width: `${progress}%` }}/></div><button type="button" onClick={onClose} aria-label="Close article" className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-black/60 text-lg text-white">×</button><img src={`/${post.image}`} alt={post.title} className="block max-h-[45vh] w-full object-cover object-top"/><div className="px-6 pb-10 pt-6 sm:px-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">{post.tag} · {post.read}</p><h2 className="mt-2 font-serif text-[28px] font-normal leading-tight sm:text-[34px]">{post.title}</h2>{post.body.map((paragraph, index) => <p key={`${post.id}-${index}`} className="mt-5 text-[16px] leading-8 text-ink/80">{paragraph}</p>)}</div></article></div>
}

export default function BlogSection() {
  const [openPost, setOpenPost] = useState(null)
  const swiperRef = useRef(null)
  const closeArticle = useCallback(() => setOpenPost(null), [])

  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay
    if (!autoplay) return
    if (openPost) autoplay.stop()
    else autoplay.start()
  }, [openPost])

  return <section className="blog-coverflow mx-auto max-w-[1200px] px-5 py-16"><Reveal className="mb-3 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Tips, tutorials & stories</p><h2 className="mt-2 font-serif text-[34px] font-normal">Our Blog</h2></Reveal><Swiper onSwiper={(swiper) => { swiperRef.current = swiper }} style={{ marginLeft: '-20px', marginRight: '-20px' }} modules={[EffectCoverflow, Autoplay, Pagination]} effect="coverflow" grabCursor centeredSlides loop speed={700} autoplay={{ delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: true }} pagination={{ clickable: true }} slidesPerView={1.3} coverflowEffect={{ rotate: 8, stretch: 0, depth: 120, scale: 0.9, modifier: 1, slideShadows: false }} breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3 } }}>
      {BLOG_POSTS.map((post) => <SwiperSlide key={post.id} className="!h-auto px-1.5 py-5"><button type="button" onClick={() => setOpenPost(post)} className="blog-card flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm"><img src={`/${post.image}`} alt={post.title} draggable="false" loading="lazy" className="h-40 w-full object-cover object-top"/><span className="flex flex-1 flex-col p-4"><span className="text-[11px] font-semibold uppercase tracking-widest text-rose">{post.tag}</span><span className="mt-1 line-clamp-2 font-serif text-lg leading-snug">{post.title}</span><span className="mt-1 line-clamp-2 text-sm text-ink/70">{post.excerpt}</span><span className="mt-3 text-[13px] font-medium text-rose">Read blog →</span></span></button></SwiperSlide>)}
    </Swiper>{openPost && <BlogReader post={openPost} onClose={closeArticle}/>}</section>
}
