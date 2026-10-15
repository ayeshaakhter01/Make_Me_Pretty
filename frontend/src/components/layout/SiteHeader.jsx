import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, products } from '../../data/products.js'
import { useCart } from '../../context/useCart.js'
import Icon from '../ui/Icon.jsx'
import PageContainer from '../ui/PageContainer.jsx'

const offerMessages = [
  { message: 'Free delivery on orders over ৳2,000 · Nationwide', code: '' },
  { message: '20% off your order with code GLOW20', code: 'GLOW20' },
]

function OffersBar() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % offerMessages.length), 4200)
    return () => window.clearInterval(timer)
  }, [])

  if (!visible) return null
  const offer = offerMessages[index]
  return <div className="relative z-[95] bg-gradient-to-r from-rose via-rose-deep to-rose px-12 py-2 text-center text-[12px] font-semibold tracking-[0.06em] text-white">
    <Link to="/offers" className="inline-flex max-w-full items-center justify-center gap-2.5"><span key={offer.message} className="animate-fadeup">{offer.message}</span>{offer.code && <span className="shrink-0 rounded-full border border-white/40 bg-white/10 px-3 py-0.5 text-[10px] font-semibold tracking-[0.12em]">CODE: {offer.code}</span>}<span aria-hidden="true" className="hidden text-[9px] text-white/70 sm:inline">▼</span></Link>
    <div className="absolute right-8 top-1/2 flex -translate-y-1/2 gap-1.5">{offerMessages.map((item, dot) => <button key={item.code || item.message} type="button" onClick={() => setIndex(dot)} aria-label={`Show offer ${dot + 1}`} aria-current={dot === index} className={`size-1.5 rounded-full ${dot === index ? 'bg-white' : 'bg-white/40'}`} />)}</div>
    <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss offer banner" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-lg leading-none text-white/85 transition hover:bg-white/15 hover:text-white">×</button>
  </div>
}

function SearchForm({ compact = false, onNavigate }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const fieldRef = useRef(null)
  const results = query.trim() ? products.filter((product) => `${product.name} ${product.type} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5) : []

  function search(event) {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    navigate(`/shop?q=${encodeURIComponent(value)}`)
    setFocused(false)
    onNavigate?.()
  }

  return <form onSubmit={search} className="relative w-full" role="search"><div className="search-glow-wrap"><div className="relative"><Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-rose" /><input ref={fieldRef} value={query} onChange={(event) => { setQuery(event.target.value); setFocused(true) }} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 160)} type="search" placeholder="Search products…" aria-label="Search products" className={`search-glow w-full !rounded-2xl !bg-cream !pl-10 ${compact ? '!py-2.5 !text-[13px]' : '!py-3 !text-sm'}`} /></div></div>
    {focused && results.length > 0 && <div className="absolute left-0 right-0 top-full z-[110] mt-2 overflow-hidden rounded-2xl border border-line bg-cream shadow-[0_18px_45px_rgba(59,48,44,.16)]">{results.map((product) => <Link key={product.id} to={`/product/${product.id}`} onMouseDown={() => onNavigate?.()} className="flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-pink-soft"><span className="truncate">{product.name}<small className="ml-2 text-xs text-ink-soft">{product.type}</small></span><strong className="shrink-0 font-medium">৳{product.price.toLocaleString('en-BD')}</strong></Link>)}<button type="submit" className="w-full border-t border-line px-4 py-2.5 text-left text-xs font-medium text-rose">See all results →</button></div>}
  </form>
}

function BrandLogo() {
  return <Link to="/" aria-label="Make Me Pretty home" className="flex shrink-0 items-center"><img src="/images/logo1.png" alt="Make Me Pretty" className="h-10 w-auto max-w-[180px] object-contain sm:h-11" /></Link>
}

function WishlistLink({ count }) {
  return <Link to="/wishlist" className="hidden items-center whitespace-nowrap rounded-full bg-pink-soft px-4 py-2.5 text-[13px] font-semibold text-rose-deep ring-1 ring-inset ring-rose/25 transition hover:bg-pink md:flex" aria-label={`Wishlist, ${count} saved`}>Wishlist{count > 0 && <span className="ml-1.5 rounded-full bg-rose px-1.5 py-0.5 text-[10px] text-white">{count}</span>}</Link>
}

function CartLink({ count, onClick }) {
  const [animate, setAnimate] = useState(false)
  const previousCount = useRef(count)

  useEffect(() => {
    if (count === previousCount.current) return undefined
    previousCount.current = count
    setAnimate(true)
    const timer = window.setTimeout(() => setAnimate(false), 600)
    return () => window.clearTimeout(timer)
  }, [count])

  return <button type="button" onClick={onClick} className={`relative grid size-10 shrink-0 place-items-center rounded-full bg-pink text-rose-deep transition hover:bg-pink/80 ${animate ? 'bag-anim' : ''}`} aria-label={`Open bag, ${count} items`}><Icon name="bag" className="bag-body size-[20px]"/>{count > 0 && <span className="bag-dot absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-rose px-1 text-[10px] font-semibold leading-[18px] text-white">{count}</span>}</button>
}

function MegaMenu({ category, close }) {
  if (!category) return null
  return <div className="absolute left-1/2 top-full z-[100] hidden w-[min(760px,92vw)] -translate-x-1/2 pt-4 md:block" onMouseEnter={close.clear} onMouseLeave={close.schedule}><div className="grid grid-cols-[1.6fr_1fr] overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_24px_64px_rgba(59,48,44,.2)]"><div className="p-7"><p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose">{category.name}</p><div className="grid grid-cols-2 gap-x-5">{category.types.map((type) => <Link key={type} to={`/shop?category=${encodeURIComponent(category.name)}&type=${encodeURIComponent(type)}`} onClick={close.now} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] transition hover:bg-pink-soft">{type}<span className="translate-x-[-4px] text-rose opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">→</span></Link>)}</div><Link to={`/shop?category=${encodeURIComponent(category.name)}`} onClick={close.now} className="mt-4 inline-block border-b border-transparent pb-0.5 text-sm font-medium text-rose hover:border-rose">Shop all {category.name} →</Link></div><div className="flex flex-col justify-between bg-pink-soft p-7"><div><span className="mb-2 block text-2xl text-rose">✿</span><h3 className="font-serif text-xl">{category.featured?.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{category.featured?.copy}</p></div><p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-ink-soft">{category.note}</p></div></div></div>
}

function MobileNavigation({ open, close }) {
  const [expanded, setExpanded] = useState(null)
  return <><button type="button" aria-label="Close navigation" onClick={close} className={`fixed inset-0 z-[120] bg-ink/35 transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} /><aside inert={!open || undefined} className={`fixed inset-y-0 left-0 z-[130] flex w-[min(340px,88vw)] flex-col bg-ivory shadow-2xl transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!open}><div className="flex items-center justify-between border-b border-line px-5 py-4"><BrandLogo/><button onClick={close} aria-label="Close menu" className="text-2xl text-ink-soft">×</button></div><nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile navigation">{categories.map((category) => <div key={category.name} className="border-b border-line/70"><button onClick={() => setExpanded((current) => current === category.name ? null : category.name)} className="flex w-full items-center justify-between py-3.5 text-left font-serif text-lg">{category.name}<span className={`text-rose transition ${expanded === category.name ? 'rotate-45' : ''}`}>+</span></button>{expanded === category.name && <div className="grid grid-cols-2 gap-1 pb-3">{category.types.map((type) => <Link key={type} onClick={close} to={`/shop?category=${encodeURIComponent(category.name)}&type=${encodeURIComponent(type)}`} className="rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-pink-soft">{type}</Link>)}</div>}</div>)}{[['Combo','/combo'],['Offers','/offers'],['All brands','/brands'],['Wishlist','/wishlist'],['Track order','/track'],['About us','/p/about-us'],['Contact','/p/contact']].map(([label,to]) => <Link key={to} to={to} onClick={close} className="block border-b border-line py-3.5 font-serif text-lg last:border-0">{label}</Link>)}</nav><div className="border-t border-line px-5 py-4"><Link to="/account" onClick={close} className="block rounded-full bg-rose px-5 py-3 text-center text-sm font-medium text-white">Sign in / Create account</Link></div></aside></>
}

export default function SiteHeader({ onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { itemCount, wishlist } = useCart()
  const closeTimer = useRef(null)
  const closeMenu = { clear: () => window.clearTimeout(closeTimer.current), schedule: () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setActiveCategory(null), 180) }, now: () => { window.clearTimeout(closeTimer.current); setActiveCategory(null) } }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(closeTimer.current) }
  }, [])

  return <><OffersBar/><header className={`sticky top-0 z-[90] border-b border-line bg-ivory/90 backdrop-blur-md transition-shadow 
    ${scrolled ? 'shadow-[0_14px_36px_-18px_rgba(59,48,44,.3)]' : ''}`}><div className="relative flex h-16 w-full items-center gap-3
     px-3 lg:px-5"><button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="flex size-10 shrink-0 flex-col
      items-center justify-center gap-[5px] rounded-full border border-rose/40 text-rose hover:bg-pink-soft md:hidden">
        <span className="h-px w-4 bg-current"/><span className="h-px w-4 bg-current"/><span className="h-px w-4 bg-current"/>
        </button><div className="hidden md:block"><BrandLogo/></div><div className="absolute left-1/2 -translate-x-1/2 md:hidden">
        <BrandLogo/></div><nav className="hidden items-center gap-3 whitespace-nowrap md:flex lg:ml-2 lg:gap-5" aria-label="Main 
        navigation" onMouseLeave={closeMenu.schedule}>{categories.map((category) => <Link key={category.name} 
        to={`/shop?category=${encodeURIComponent(category.name)}`} onMouseEnter={() => { window.clearTimeout(closeTimer.current); 
          setActiveCategory(category.name) }} onFocus={() => setActiveCategory(category.name)} 
          aria-expanded={activeCategory === category.name} className={`border-b-[1.5px] py-1 text-[13px] tracking-[0.03em] 
            transition-colors ${activeCategory === category.name ? 'border-rose' : 'border-transparent hover:border-rose'}`}>
              {category.name}</Link>)}<Link to="/combo" onMouseEnter={() => setActiveCategory(null)} className="border-b 
              border-transparent py-1 text-[13px] hover:border-rose">Combo</Link>
              <Link to="/offers" onMouseEnter={() => setActiveCategory(null)} className="rounded-full bg-gold-soft px-3.5 py-1.5 text-[13px] font-semibold text-[#8a6a2f] hover:bg-gold hover:text-white">Offers ✦</Link>
              </nav><div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:gap-3 lg:gap-4"><div className="hidden min-w-0 flex-1 xl:block xl:max-w-none"><SearchForm compact/></div><WishlistLink count={wishlist.length}/><CartLink count={itemCount} onClick={onOpenCart}/><Link to="/account" aria-label="Sign in" title="Sign in" className="grid size-9 shrink-0 place-items-center rounded-full bg-pink-soft text-rose-deep ring-1 ring-inset ring-rose/25 hover:bg-pink"><svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5 19.5c0-3.6 3.2-5.5 7-5.5s7 1.9 7 5.5" strokeLinecap="round"/></svg></Link></div><MegaMenu category={categories.find((item) => item.name === activeCategory)} close={closeMenu}/></div><div className="border-t border-line px-5 py-2.5 xl:hidden"><PageContainer className="px-0"><SearchForm compact onNavigate={() => setMobileOpen(false)}/></PageContainer></div></header><MobileNavigation open={mobileOpen} close={() => setMobileOpen(false)}/></>
}
