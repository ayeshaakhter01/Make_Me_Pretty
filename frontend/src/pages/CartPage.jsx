import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import ProductArtwork from '../components/products/ProductArtwork.jsx'
import { ButtonLink } from '../components/ui/Button.jsx'
import { useCart } from '../context/useCart.js'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`
const freeDeliveryAt = 3000
const DELIVERY_FEES = { inside: 60, outside: 120 }

/* THE BAG. Every item has a tick box: ticked items are the ones that go to checkout,
   unticked items simply stay in the bag for later. "Remove" still deletes an item completely. */
export default function CartPage() {
  const { items, selectedItems, selectedCount, selectedSubtotal: subtotal, isSelected, toggleSelected, setAllSelected, setQuantity, removeItem } = useCart()

  const [area, setArea] = useState(
    () => localStorage.getItem('mmp-delivery-area') || 'inside'
  )

  function chooseArea(value) {
    setArea(value)
    localStorage.setItem('mmp-delivery-area', value)
  }

  const allSelected = items.length > 0 && selectedItems.length === items.length
  const delivery = subtotal === 0 || subtotal >= freeDeliveryAt
    ? 0
    : DELIVERY_FEES[area]

  if (items.length === 0) {
    return <PageContainer className="py-20 text-center sm:py-28"><div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-soft text-rose-deep"><Icon name="bag" className="size-7" /></div><p className="mt-5 text-xs uppercase tracking-[0.18em] text-rose">Your bag is taking a little nap</p><h1 className="mt-3 font-display text-4xl">It’s waiting for something lovely.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Take a look around and find a little something for your everyday ritual.</p><ButtonLink to="/shop" variant="rose" className="mt-7">Explore the shop <span>→</span></ButtonLink></PageContainer>
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mb-9">
        <p className="text-xs uppercase tracking-[0.18em] text-rose">The good stuff</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Your bag</h1>
        <p className="mt-2 text-sm text-muted">{items.reduce((sum, item) => sum + item.quantity, 0)} lovely things in your bag · {selectedCount} selected for checkout.</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-line rounded-[24px] bg-white px-4 sm:px-6">
          <label className="flex cursor-pointer items-center gap-3 py-4 text-sm">
            <input type="checkbox" checked={allSelected} onChange={(event) => setAllSelected(event.target.checked)} className="size-4 accent-rose" />
            <span className="font-medium">Select all ({items.length})</span>
            <span className="text-xs text-muted">Only ticked items go to checkout. The rest stay in your bag.</span>
          </label>

          {items.map(({ product, quantity }) => {
            const productLink = product.comboId ? `/combo/${product.comboId}` : `/product/${product.id}`
            const selected = isSelected(product.id)
            return (
              <article key={product.id} className={`grid grid-cols-[auto_88px_1fr] gap-4 py-5 sm:grid-cols-[auto_112px_1fr_auto] sm:gap-5 ${selected ? '' : 'opacity-60'}`}>
                <input type="checkbox" checked={selected} onChange={() => toggleSelected(product.id)} aria-label={`Include ${product.name} in checkout`} className="size-4 self-center accent-rose" />
                <Link to={productLink} className="overflow-hidden rounded-2xl"><ProductArtwork product={product} className="aspect-square" /></Link>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-muted">{product.category}</p>
                  <Link to={productLink} className="mt-1 font-display text-lg leading-snug hover:text-rose-deep">{product.name}</Link>
                  <p className="mt-1 text-sm font-medium">{money(product.price)}</p>
                  <div className="mt-3 inline-flex w-fit items-center rounded-full border border-line">
                    <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} className="grid size-8 place-items-center text-muted hover:text-ink" aria-label={`Remove one ${product.name}`}><Icon name="minus" className="size-3.5" /></button>
                    <span className="min-w-7 text-center text-xs">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(product.id, quantity + 1)} className="grid size-8 place-items-center text-muted hover:text-ink" aria-label={`Add one ${product.name}`}><Icon name="plus" className="size-3.5" /></button>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
                  <span className="text-sm font-medium">{money(product.price * quantity)}</span>
                  <button type="button" onClick={() => removeItem(product.id)} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-rose-deep"><Icon name="trash" className="size-3.5" />Remove</button>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="rounded-[24px] bg-white p-6 sm:p-7">
          <h2 className="font-display text-2xl">A quick little total</h2>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal ({selectedItems.length} of {items.length} selected)</span><span>{money(subtotal)}</span></div>

            <div className="border-b border-line py-3 text-sm text-ink-soft">
              <label htmlFor="delivery-area" className="mb-2 block text-xs">Delivery area (estimate)</label>
              <select id="delivery-area" value={area} onChange={(event) => chooseArea(event.target.value)} className="!py-2 text-[13px]">
                <option value="inside">Inside Chattogram — ৳60</option>
                <option value="outside">Outside Chattogram — ৳120</option>
              </select>
            </div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{delivery === 0 ? 'On us' : money(delivery)}</span></div>
            <div className="border-t border-line pt-4"><div className="flex justify-between font-medium"><span>Total</span><span>{money(subtotal + delivery)}</span></div></div>
          </div>

          <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-xs leading-5 text-muted">{selectedItems.length === 0 ? 'Tick the items you want to order now.' : subtotal >= freeDeliveryAt ? 'Lovely! Your delivery is on us.' : `Add ${money(freeDeliveryAt - subtotal)} more for free delivery.`}</p>

          {selectedItems.length === 0
            ? <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-full bg-rose/40 px-6 py-3 text-sm font-medium text-white">Select at least one item</button>
            : <ButtonLink to="/checkout" variant="rose" className="mt-5 w-full">Continue to checkout <span>→</span></ButtonLink>}
          <Link to="/shop" className="mt-4 block text-center text-xs text-muted hover:text-rose-deep">Keep browsing</Link>
        </aside>
      </div>
    </PageContainer>
  )
}
