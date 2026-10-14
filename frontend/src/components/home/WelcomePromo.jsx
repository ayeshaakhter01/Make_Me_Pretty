import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'mmp_welcome_seen'
const offers = [
  { title: 'Free delivery on orders over ৳2,000 · Nationwide', label: '✓ Free delivery', href: '/shop' },
  { title: '20% off your order with code GLOW20', label: 'Use code  GLOW20', href: '/offers' },
]

export default function WelcomePromo() {
  const [open, setOpen] = useState(false)
  const [activeOffer, setActiveOffer] = useState(0)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return undefined
    } catch {
      // Storage can be unavailable in private browsing; the dialog still works for this visit.
    }
    const timer = window.setTimeout(() => setOpen(true), 800)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setInterval(() => setActiveOffer((index) => (index + 1) % offers.length), 3800)
    return () => window.clearInterval(timer)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => { if (event.key === 'Escape') close() }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function close() {
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* No storage needed to dismiss it now. */ }
    setOpen(false)
  }

  function moveOffer(direction) {
    setActiveOffer((index) => (index + direction + offers.length) % offers.length)
  }

  if (!open) return null
  const offer = offers[activeOffer]

  return <div className="fixed inset-0 z-[190] flex items-start justify-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-sm sm:items-center" onClick={close}>
    <section role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="relative my-6 w-full max-w-[560px] animate-fadeup rounded-[28px] border border-line bg-ivory p-6 shadow-2xl sm:px-[30px] sm:pb-[30px] sm:pt-[34px]" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={close} aria-label="Close welcome offers" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white text-xl text-ink-soft transition hover:text-ink">×</button>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-rose">Welcome to Make Me Pretty</p>
      <h2 id="welcome-title" className="mt-1 text-center font-serif text-[26px] leading-tight sm:text-[30px]">we wanna make you pretty <span aria-hidden="true">✿</span></h2>
      <div className="relative mt-6 overflow-hidden rounded-[20px] border border-line bg-white">
        <div className="grid h-[120px] place-items-center bg-gradient-to-br from-[#f8e1e5] to-[#f5ece5] text-[34px] text-rose">✿</div>
        <div key={offer.title} className="animate-fadeup px-7 pb-5 pt-4 text-center sm:px-12">
          {activeOffer === 1 && <h3 className="font-serif text-[21px]">Glow 20</h3>}
          <p className="mx-auto max-w-[310px] text-[15px] leading-6 text-ink-soft">{offer.title}</p>
          <span className="mt-4 inline-flex rounded-full bg-pink-soft px-5 py-2 text-[13px] font-medium text-rose-deep">{offer.label}</span>
          <Link to={offer.href} onClick={close} className="mx-auto mt-3 flex w-fit rounded-full bg-rose px-8 py-2.5 text-[14px] font-semibold text-white transition hover:bg-rose-deep">Shop now</Link>
        </div>
        <button type="button" aria-label="Previous offer" onClick={() => moveOffer(-1)} className="absolute left-2 top-[168px] grid size-11 place-items-center rounded-full bg-white/90 text-xl text-ink shadow-sm hover:bg-white">‹</button>
        <button type="button" aria-label="Next offer" onClick={() => moveOffer(1)} className="absolute right-2 top-[168px] grid size-11 place-items-center rounded-full bg-white/90 text-xl text-ink shadow-sm hover:bg-white">›</button>
      </div>
      <div className="mt-4 flex justify-center gap-2">{offers.map((item, index) => <button key={item.title} type="button" aria-label={`Show offer ${index + 1}`} aria-current={index === activeOffer} onClick={() => setActiveOffer(index)} className={`h-1.5 rounded-full transition-all ${index === activeOffer ? 'w-6 bg-rose' : 'w-1.5 bg-line'}`} />)}</div>
      <button type="button" onClick={close} className="mt-4 block w-full text-center text-[12.5px] text-ink-soft underline underline-offset-2">Continue to the shop</button>
    </section>
  </div>
}
