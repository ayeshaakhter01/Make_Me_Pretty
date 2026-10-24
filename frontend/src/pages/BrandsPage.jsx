import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import { BRAND_LOGOS, DEFAULT_BRANDS } from '../data/brandSource.js'
import StaggerReveal from '../components/ui/StaggerReveal.jsx'
import { useCatalog } from '../context/useCatalog.js'
import { assetUrl } from '../api.js'

export default function BrandsPage() {
  const { products } = useCatalog()
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].map((brand) => ({ brand, description: DEFAULT_BRANDS.find((item) => item.brand === brand)?.description || 'Shop products from this brand' }))
  return <PageContainer className="py-14"><header className="animate-fadeup mb-9 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Names you can trust</p><h1 className="mt-2 font-serif text-[clamp(30px,4.5vw,42px)] font-normal">Brands we carry</h1><p className="mt-1.5 text-[14px] text-ink-soft">Tap a brand to see everything we stock from them.</p></header>{brands.length ? <StaggerReveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{brands.map((brand) => <Link key={brand.brand} to={`/shop?brand=${encodeURIComponent(brand.brand)}`} className="group flex flex-col items-center rounded-3xl border border-line bg-cream p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-[0_18px_40px_rgba(59,48,44,.09)]"><div className="card-shine mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-4">{BRAND_LOGOS[brand.brand] ? <img src={assetUrl(BRAND_LOGOS[brand.brand])} alt={brand.brand} loading="lazy" className="size-full object-contain"/> : <span className="font-serif text-lg text-ink">{brand.brand}</span>}</div><span className="truncate font-serif text-[15px] text-ink group-hover:text-rose">{brand.brand}</span><span className="mt-0.5 line-clamp-1 text-[11.5px] text-ink-soft">{brand.description}</span><span className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-rose opacity-0 transition-opacity group-hover:opacity-100">Shop →</span></Link>)}</StaggerReveal> : <div className="rounded-3xl border border-line bg-cream px-6 py-16 text-center text-sm text-ink-soft">Brands will appear here when the catalog has products.</div>}</PageContainer>
}
