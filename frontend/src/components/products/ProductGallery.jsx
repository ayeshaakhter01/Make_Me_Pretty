import { useRef, useState } from 'react'
import ProductArtwork from './ProductArtwork.jsx'

export default function ProductGallery({ product }) {
  const colorways = [
    [product.c1, product.c2],
    [product.c2, product.c1],
    ['#F6EFE7', product.c2],
  ]
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [hoverZoomed, setHoverZoomed] = useState(false)
  const [origin, setOrigin] = useState('center')
  const imageRef = useRef(null)
  const currentProduct = { ...product, id: `${product.id}-view-${active}`, c1: colorways[active][0], c2: colorways[active][1] }

  function updateZoomOrigin(event) {
    const bounds = imageRef.current?.getBoundingClientRect()
    if (!bounds) return
    setOrigin(`${((event.clientX - bounds.left) / bounds.width) * 100}% ${((event.clientY - bounds.top) / bounds.height) * 100}%`)
  }

  return <div className="mx-auto w-full max-w-115">
    <div ref={imageRef} onMouseEnter={() => setHoverZoomed(true)} onMouseMove={updateZoomOrigin} onMouseLeave={() => { setHoverZoomed(false); setZoomed(false) }} onClick={() => { if (hoverZoomed) { setHoverZoomed(false); setZoomed(false) } else setZoomed((value) => !value) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setZoomed((value) => !value) } }} role="button" tabIndex={0} className={`gallery-zoom relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-line ${zoomed || hoverZoomed ? 'is-zoomed' : ''}`} style={{ cursor: zoomed || hoverZoomed ? 'zoom-out' : 'zoom-in', '--zoom-origin': origin }} aria-label="Product image. Hover to zoom, click to reset.">
      <ProductArtwork product={currentProduct} size={1.7} className="size-full transition-transform duration-500 ease-out" />
      <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/75 px-3 py-1 text-[10.5px] uppercase tracking-[0.1em] text-ink-soft backdrop-blur">{zoomed || hoverZoomed ? 'Move away / Click to reset' : 'Hover / Click to zoom'}</span>
    </div>
    <div className="mt-3.5 flex justify-center gap-2.5">{colorways.map(([c1, c2], index) => <button type="button" key={`${c1}-${c2}-${index}`} onClick={() => { setActive(index); setZoomed(false) }} aria-label={`View product image ${index + 1}`} aria-pressed={active === index} className={`relative grid size-16 place-items-center overflow-hidden rounded-2xl border bg-white transition ${active === index ? 'border-2 border-rose' : 'border-line opacity-85 hover:opacity-100'}`} style={{ background: `linear-gradient(150deg, ${c1}, white)` }}><ProductArtwork product={{ ...product, id: `${product.id}-thumb-${index}`, c1, c2 }} size={0.34} className="size-full bg-transparent" /></button>)}</div>
  </div>
}