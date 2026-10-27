import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/useCart.js'
import { Button } from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import ProductArtwork from '../products/ProductArtwork.jsx'
import { CONCERNS } from '../../data/skinAdvisor.js'
import { apiRequest } from '../../api.js'
import { useCatalog } from '../../context/useCatalog.js'

const LABEL_KEY = 'mmp_advisor_label_hidden'
const HIDDEN_ON = ['/skin-advisor', '/checkout'] // pages where the pop-up would only be in the way
const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

function readLabelHidden() {
  try { return sessionStorage.getItem(LABEL_KEY) === '1' } catch { return false }
}

/* One small product row inside the pop-up. */
function MiniPick({ product, reason }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function add() {
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-cream p-3">
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`} className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-line">
        <ProductArtwork product={product} size={0.45} className="size-full" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/product/${product.id}`} className="block truncate font-serif text-[15px] leading-snug hover:text-rose">{product.name}</Link>
        <p className="text-[11px] text-ink-soft">{product.type} · <span className="font-medium text-ink">{money(product.price)}</span></p>
        <p className="mt-1 line-clamp-3 text-[12px] leading-4 text-ink-soft">{reason}</p>
        <Button type="button" variant="rose" onClick={add} aria-label={`Add ${product.name} to bag`} className={`mt-2 gap-1.5 px-3.5 py-1.5 text-[12px] ${added ? 'bg-gold hover:bg-gold' : ''}`}>
          <Icon name="bag" className="size-4" />{added ? 'Added' : 'Add to Bag'}
        </Button>
      </div>
    </li>
  )
}

export default function AdvisorPopup() {
  const { products } = useCatalog()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [labelHidden, setLabelHidden] = useState(readLabelHidden)
  const [view, setView] = useState('ask') // ask | loading | results | error
  const [text, setText] = useState('')
  const [chosen, setChosen] = useState([])
  const [hint, setHint] = useState('')
  const [result, setResult] = useState(null)
  const requestId = useRef(0)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    bodyRef.current?.scrollTo?.({ top: 0 })
  }, [view])

  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null

  function hideLabel() {
    setLabelHidden(true)
    try { sessionStorage.setItem(LABEL_KEY, '1') } catch { /* fine without storage */ }
  }

  function toggleConcern(id) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    setHint('')
  }

  async function ask(event) {
    event.preventDefault()
    if (text.trim().length < 10 && chosen.length === 0) {
      setHint('Tell me a little about your skin, or tap a concern.')
      return
    }
    const id = ++requestId.current
    setView('loading')
    try {
      const data = await apiRequest('/skin-advisor/recommendations', { method: 'POST', body: JSON.stringify({ skinType: 'unspecified', concerns: chosen.map((id) => CONCERNS.find((concern) => concern.id === id)?.label).filter(Boolean), preferences: text.trim() }) })
      if (id !== requestId.current) return
      setResult({ ...data, picks: data.recommendations })
      setView('results')
    } catch {
      if (id === requestId.current) setView('error')
    }
  }

  function startOver() {
    requestId.current += 1
    setResult(null)
    setView('ask')
  }

  const picks = (result?.picks ?? []).map((pick) => ({ ...pick, product: products.find((item) => item.id === String(pick.productId)) })).filter((pick) => pick.product)
  const bubble = 'rounded-2xl rounded-tl-md bg-pink-soft px-4 py-3 text-[13px] leading-5 text-ink'

  return (
    <div className="fixed bottom-4 right-4 z-[120] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section role="dialog" aria-label="Skin advisor" className="animate-fadeup flex max-h-[min(640px,calc(100dvh-7.5rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[26px] border border-line bg-ivory shadow-[0_24px_64px_rgba(59,48,44,.28)]">
          <header className="flex items-center gap-3 bg-gradient-to-r from-rose via-rose-deep to-rose px-5 py-4 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/20"><Icon name="sparkle" className="size-[18px]" /></span>
            <div className="flex-1"><h2 className="font-serif text-[18px] leading-tight">Skin Advisor</h2><p className="text-[11.5px] text-white/80">Personal picks in seconds</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close skin advisor" className="grid size-8 place-items-center rounded-full text-xl leading-none text-white/85 transition hover:bg-white/15">×</button>
          </header>

          <div ref={bodyRef} aria-live="polite" className="flex-1 overflow-y-auto px-4 py-4">
            {view === 'ask' && (
              <form onSubmit={ask} className="space-y-4">
                <p className={bubble}>Hi! Tell me about your skin and I’ll pick products from our shop for you.</p>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map((concern) => {
                    const active = chosen.includes(concern.id)
                    return <button key={concern.id} type="button" aria-pressed={active} onClick={() => toggleConcern(concern.id)} className={`rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${active ? 'border-rose bg-pink-soft text-rose-deep' : 'border-line bg-cream text-ink hover:border-rose'}`}>{active && '✓ '}{concern.label}</button>
                  })}
                </div>
                <textarea value={text} maxLength={300} onChange={(event) => { setText(event.target.value); setHint('') }} aria-label="Describe your skin" placeholder="e.g. my skin gets oily by noon and I get breakouts…" className="min-h-[88px] resize-none !text-[13px]" />
                {hint && <p role="alert" className="rounded-xl bg-lowstock-bg px-3 py-2 text-[12px] text-lowstock-text">{hint}</p>}
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-[13px] font-medium tracking-[0.04em] text-white transition hover:bg-rose-deep active:scale-[0.97]"><Icon name="sparkle" className="size-4" />Find my products</button>
              </form>
            )}

            {view === 'loading' && (
              <div aria-busy="true" className="space-y-3">
                <p className={bubble}>Reading your skin notes and browsing our shelves…</p>
                {[0, 1, 2].map((row) => <div key={row} className="skel h-24 rounded-2xl" />)}
              </div>
            )}

            {view === 'results' && (
              <div className="space-y-3">
                {picks.length === 0
                  ? <p className={bubble}>I couldn’t spot a specific concern yet. Try describing how your skin looks or feels (oily, dry, red, dull…).</p>
                  : <>
                      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose">{result.mode === 'ai' ? 'AI recommendations' : 'Catalog matching · AI unavailable'}</p>
                      <p className={bubble}>{result.summary}</p>
                      <ul className="space-y-3">{picks.map((pick) => <MiniPick key={pick.productId} product={pick.product} reason={pick.reason} />)}</ul>
                    </>}
                <button type="button" onClick={startOver} className="block w-full pt-1 text-center text-[12.5px] text-ink-soft underline underline-offset-4 hover:text-rose">Start over</button>
              </div>
            )}

            {view === 'error' && (
              <div role="alert" className="space-y-3">
                <p className={bubble}>Something went wrong while finding your picks. Please try again.</p>
                <button type="button" onClick={startOver} className="block w-full text-center text-[12.5px] text-ink-soft underline underline-offset-4 hover:text-rose">Try again</button>
              </div>
            )}
          </div>

          <footer className="border-t border-line bg-cream px-4 py-3">
            <p className="text-[10.5px] leading-4 text-[#7a5d28]"><strong className="font-semibold">Good to know:</strong> general skincare advice, not medical advice. See a doctor or dermatologist for persistent or painful skin problems.</p>
            <Link to="/skin-advisor" onClick={() => setOpen(false)} className="mt-1.5 inline-block text-[12px] font-medium text-rose hover:text-rose-deep">Open the full advisor →</Link>
          </footer>
        </section>
      )}

      {open || labelHidden ? (
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Close skin advisor' : 'Open skin advisor'} className="grid size-14 place-items-center rounded-full bg-rose text-white shadow-[0_10px_30px_rgba(183,110,121,.45)] transition hover:-translate-y-0.5 hover:bg-rose-deep active:scale-95">
          <Icon name={open ? 'close' : 'sparkle'} className="size-6" />
        </button>
      ) : (
        <div className="animate-pop flex items-center gap-1 rounded-full border border-rose/30 bg-cream/95 py-1.5 pl-1.5 pr-2 shadow-[0_10px_30px_rgba(59,48,44,.18)] backdrop-blur">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open skin advisor" className="flex items-center gap-3 rounded-full pr-2 text-left">
            <span className="grid size-12 place-items-center rounded-full bg-rose text-white"><Icon name="sparkle" className="size-6" /></span>
            <span className="text-[14px] font-medium text-ink">Skin advice</span>
          </button>
          <button type="button" onClick={hideLabel} aria-label="Hide the skin advice label" className="grid size-7 place-items-center rounded-full bg-ink/5 text-base leading-none text-ink-soft transition hover:bg-ink/10">×</button>
        </div>
      )}
    </div>
  )
}
