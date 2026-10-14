import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart.js'
import ProductArtwork from '../products/ProductArtwork.jsx'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, closeDrawer, setQuantity, removeItem } = useCart()
  const deliveryRemaining = Math.max(0, 3000 - subtotal)

  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeDrawer, drawerOpen])

  return <>
    <button type="button" aria-label="Close bag" onClick={closeDrawer} className={`fixed inset-0 z-[140] bg-ink/40 backdrop-blur-[2px] transition-opacity ${drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
    <aside inert={!drawerOpen || undefined} role="dialog" aria-modal="true" aria-label="Your shopping bag" aria-hidden={!drawerOpen} className={`fixed inset-y-0 right-0 z-[150] flex w-[min(420px,92vw)] flex-col bg-ivory shadow-2xl transition-transform duration-[380ms] ease-[cubic-bezier(.22,1,.36,1)] ${drawerOpen ? 'translate-x-0' : 'translate-x-[105%]'}`}>
      <header className="flex items-center justify-between border-b border-line px-6 py-5"><h2 className="font-serif text-[22px] font-medium">Your Bag ({items.length})</h2><button type="button" onClick={closeDrawer} aria-label="Close bag" className="text-2xl text-ink-soft">×</button></header>
      {items.length === 0 ? <div className="flex flex-1 flex-col items-center px-6"><div className="mb-4 mt-20 flex h-24 w-20 items-center justify-center rounded-[60px_60px_16px_16px] bg-pink-soft text-4xl">🛍</div><h3 className="font-serif text-2xl">Your bag is feeling light</h3><p className="mt-2 max-w-sm text-center text-ink-soft">Add something your skin will thank you for.</p><Link to="/shop" onClick={closeDrawer} className="mt-6 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep">Browse products</Link></div> : <>
        <div className="flex-1 overflow-y-auto px-5">{items.map(({ product, quantity }) => { const productLink = product.comboId ? `/combo/${product.comboId}` : `/product/${product.id}`; return <article key={product.id} className="flex gap-3 border-b border-line py-4"><Link to={productLink} onClick={closeDrawer} className="size-[82px] shrink-0 overflow-hidden rounded-2xl border border-line"><ProductArtwork product={product} className="size-full"/></Link><div className="min-w-0 flex-1"><Link to={productLink} onClick={closeDrawer} className="line-clamp-2 font-serif text-[15px] leading-snug hover:text-rose">{product.name}</Link><p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-soft">{product.type}</p><p className="mt-1 text-sm font-medium">{money(product.price)}</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center overflow-hidden rounded-full border border-line bg-cream"><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => setQuantity(product.id, quantity - 1)} className="px-2.5 py-1 text-ink-soft hover:text-rose">−</button><span className="min-w-6 text-center text-xs">{quantity}</span><button type="button" aria-label={`Add one ${product.name}`} onClick={() => setQuantity(product.id, quantity + 1)} className="px-2.5 py-1 text-ink-soft hover:text-rose">+</button></div><button type="button" onClick={() => removeItem(product.id)} className="text-[11px] text-ink-soft underline underline-offset-2 hover:text-rose">Remove</button></div></div></article>})}</div>
        <footer className="border-t border-line bg-cream px-5 pb-5 pt-4"><div className="mb-4 rounded-2xl bg-pink-soft px-4 py-3 text-center text-xs text-rose-deep">{deliveryRemaining ? `Add ${money(deliveryRemaining)} more for free delivery` : 'Lovely! Your order qualifies for free delivery.'}</div><div className="mb-4 flex justify-between text-sm"><span className="text-ink-soft">Subtotal</span><strong className="font-medium">{money(subtotal)}</strong></div><Link to="/checkout" onClick={closeDrawer} className="block rounded-full bg-rose px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-rose-deep">Checkout · {money(subtotal)}</Link><Link to="/cart" onClick={closeDrawer} className="mt-3 block text-center text-xs text-ink-soft underline underline-offset-2 hover:text-rose">View bag</Link></footer>
      </>}
    </aside>
  </>
}
