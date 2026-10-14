import { Link } from 'react-router-dom'
import { BRAND_LOGOS, DEFAULT_BRANDS } from '../../data/brandSource.js'
import AutoScrollRail from '../ui/AutoScrollRail.jsx'
import PageContainer from '../ui/PageContainer.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Reveal from '../ui/Reveal.jsx'

export default function BrandShowcase() {
  const brands = DEFAULT_BRANDS

  return <PageContainer className="py-16"><Reveal><SectionHeading eyebrow="Names you can trust" title="Brands we carry" linkTo="/brands" linkLabel="View all brands"/></Reveal><AutoScrollRail items={brands} auto speed={0.45} label="Beauty brands" getKey={(brand, index) => `${brand.brand}-${index}`} className="-mx-5 gap-0 pb-3 sm:-mx-8 lg:-mx-10" renderItem={(brand, _index, key, duplicated) => <Link role="listitem" aria-hidden={duplicated || undefined} inert={duplicated || undefined} key={key} to={`/shop?brand=${encodeURIComponent(brand.brand)}`} draggable="false" className="group mx-3 flex w-[210px] shrink-0 flex-col items-center rounded-3xl border border-line bg-cream p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-[0_18px_40px_rgba(59,48,44,.09)] sm:w-[240px]"><div className="card-shine mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-4"><img src={`/${BRAND_LOGOS[brand.brand]}`} alt={brand.brand} draggable="false" loading="lazy" className="size-full object-contain"/></div><span className="truncate font-serif text-[14.5px] group-hover:text-rose">{brand.brand}</span><span className="mt-0.5 line-clamp-1 text-[11.5px] text-ink-soft">{brand.description}</span><span className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-rose opacity-0 transition-opacity group-hover:opacity-100">Shop →</span></Link>}/></PageContainer>
}
