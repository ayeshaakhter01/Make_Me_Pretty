import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/products/ProductGrid.jsx'
import FilterPanel from '../components/products/FilterPanel.jsx'
import { getProductFacets, matchesProductFilters } from '../data/productFilters.js'
import PageContainer from '../components/ui/PageContainer.jsx'
import TrustMarquee from '../components/home/TrustMarquee.jsx'
import { useCatalog } from '../context/useCatalog.js'

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'low', label: 'Price: low → high' },
  { value: 'high', label: 'Price: high → low' },
  { value: 'rated', label: 'Top rated' },
]
const cleanFilters = () => ({ inStock: false, outStock: false, priceMin: '', priceMax: '', types: new Set(), brands: new Set(), skins: new Set() })

export default function ShopPage({ initialCategory = null, showOffers: fixedOffers = false }) {
  const { products } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState(cleanFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersRef = useRef(null)
  const category = initialCategory || params.get('category') || 'All'
  const query = params.get('q') || ''
  const offersOnly = fixedOffers || params.get('offers') === '1'
  const brandParam = params.get('brand')
  const typeParam = params.get('type')
  const sort = params.get('sort') || 'featured'

  useEffect(() => {
    if (!filtersOpen) return undefined
    const onPointerDown = (event) => { if (filtersRef.current && !filtersRef.current.contains(event.target)) setFiltersOpen(false) }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [filtersOpen])

  const pool = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return products.filter((product) => {
      if (category !== 'All' && product.category !== category) return false
      if (offersOnly && !(product.old && product.old > product.price)) return false
      if (brandParam && (product.brand || 'Make Me Pretty') !== brandParam) return false
      if (typeParam && product.type !== typeParam) return false
      if (normalizedQuery && ![product.name, product.type, product.category].some((value) => value.toLowerCase().includes(normalizedQuery))) return false
      return true
    })
  }, [brandParam, category, offersOnly, products, query, typeParam])
  const facets = useMemo(() => getProductFacets(pool), [pool])
  const visibleProducts = useMemo(() => {
    let list = pool.filter((product) => matchesProductFilters(product, filters))
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rated') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [filters, pool, sort])

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function toggleFilter(key, value) {
    setFilters((current) => {
      const next = new Set(current[key])
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...current, [key]: next }
    })
  }

  const activeCount = (filters.inStock ? 1 : 0) + (filters.outStock ? 1 : 0) + (filters.priceMin !== '' ? 1 : 0) + (filters.priceMax !== '' ? 1 : 0) + filters.types.size + filters.brands.size + filters.skins.size
  const heading = offersOnly ? 'On Offer' : brandParam || (category === 'All' ? 'The Collection' : category)

  return <><TrustMarquee/><PageContainer className="max-w-[1280px] py-10"><header className="animate-fadeup mb-7 text-center"><h1 className="font-serif text-[clamp(30px,4.5vw,42px)] font-normal">{heading}</h1><p className="mt-1.5 text-[14px] text-ink-soft">{offersOnly ? 'Limited-time prices across the range.' : 'Gentle, climate-conscious formulas — zero filler.'}{query && <> · results for “<span className="text-ink">{query}</span>”</>}</p></header>
    <div className="mb-6 flex items-center justify-between gap-3"><div ref={filtersRef} className="relative"><button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className={`flex items-center gap-2 rounded-full border-[1.5px] px-5 py-2.5 text-[13px] font-medium transition-colors ${filtersOpen || activeCount > 0 ? 'border-rose bg-pink-soft text-rose' : 'border-line text-ink hover:border-rose'}`}><svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round"/></svg>Filters{activeCount > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[11px] font-semibold text-white">{activeCount}</span>}<span className={`text-[10px] transition-transform ${filtersOpen ? 'rotate-180' : ''}`}>▾</span></button>{filtersOpen && <div className="absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-[320px] max-w-[92vw] overflow-y-auto rounded-2xl shadow-[0_18px_50px_rgba(59,48,44,.18)]"><FilterPanel facets={facets} filters={filters} set={setFilter} toggle={toggleFilter} clear={() => setFilters(cleanFilters())} activeCount={activeCount}/></div>}</div><div className="flex items-center gap-3"><p className="hidden text-[13px] text-ink-soft sm:block" aria-live="polite">{visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'}</p><label className="hidden text-[12px] uppercase tracking-[0.1em] text-ink-soft md:block" htmlFor="product-sort">Sort by</label><select id="product-sort" value={sort} onChange={(event) => { const next = new URLSearchParams(params); if (event.target.value === 'featured') next.delete('sort'); else next.set('sort', event.target.value); setParams(next) }} aria-label="Sort products" className="!w-auto !rounded-full !py-2.5 !pl-4 !pr-9 !text-[13px]">{SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
    {visibleProducts.length ? <ProductGrid products={visibleProducts}/> : <div className="rounded-3xl border border-line bg-cream px-6 py-16 text-center"><h2 className="font-serif text-2xl">Nothing blooms here yet</h2><p className="mt-2 text-sm text-ink-soft">Try different filters or browse the full collection.</p><button type="button" onClick={() => setFilters(cleanFilters())} className="mt-5 rounded-full bg-rose px-5 py-2.5 text-sm text-white hover:bg-rose-deep">Clear filters</button></div>}
  </PageContainer></>
}
