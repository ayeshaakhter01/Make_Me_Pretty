import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function BrandStory() {
  const words = ['pretty', 'glowing', 'radiant', 'confident', 'soft', 'you']
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)
  const backgroundRef = useRef(null)

  useEffect(() => {
    const timer = window.setInterval(() => setWordIndex((index) => (index + 1) % words.length), 2200)
    return () => window.clearInterval(timer)
  }, [words.length])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } }, { threshold: 0.25 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const layer = backgroundRef.current
    if (!section || !layer) return undefined
    const onMove = (event) => {
      const rect = section.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      layer.style.transform = `translate(${x * 22}px, ${y * 16}px)`
    }
    section.addEventListener('pointermove', onMove)
    return () => section.removeEventListener('pointermove', onMove)
  }, [])

  return <section ref={sectionRef} className="relative overflow-hidden border-y border-line bg-pink-soft"><div ref={backgroundRef} aria-hidden="true" className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out">{['8%','22%','72%','88%','50%'].map((left,index) => <span key={left} className="absolute animate-floaty text-2xl text-rose/30 sm:text-3xl" style={{ left, top: `${14 + index * 23 % 60}%`, animationDelay: `${index * 0.9}s`, animationDuration: `${5 + index}s` }}>✿</span>)}</div><div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-28"><div className={`transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose">Make Me Pretty</p><h2 className="mt-5 font-serif text-[clamp(30px,5.4vw,52px)] font-normal leading-[1.18]">we wanna make you <span className="relative inline-block h-[1.25em] w-[4.6em] overflow-hidden align-bottom text-left">{words.map((word,index) => <em key={word} className={`absolute left-0 text-rose transition-all duration-500 ease-out ${index === wordIndex ? 'translate-y-0 opacity-100' : index === (wordIndex + words.length - 1) % words.length ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'}`}>{word}</em>)}</span></h2></div><p className={`mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] text-ink-soft transition-all delay-200 duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>We formulate in small batches for the realities of life in Bangladesh: heat, humidity, sun, and city air. No harsh actives, no false promises — just you, made a little prettier every day.</p><div className={`mt-9 transition-all delay-300 duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}><Link to="/shop" className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,48,44,.18)]">Begin your ritual <span className="transition-transform group-hover:translate-x-1">→</span></Link></div></div></section>
}
