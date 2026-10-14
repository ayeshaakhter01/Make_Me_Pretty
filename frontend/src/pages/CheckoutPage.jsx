import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import { useCart } from '../context/useCart.js'
import { SEED_COUPONS } from '../data/ordersSource.js'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [placed, setPlaced] = useState(false)
  const [payment, setPayment] = useState('cash')
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const availableCoupons = SEED_COUPONS.filter((item) => item.active)
  const baseDelivery = subtotal >= 3000 || subtotal === 0 ? 0 : 80
  const discount = coupon?.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : 0
  const delivery = coupon?.type === 'shipping' ? 0 : baseDelivery
  const total = subtotal - discount + delivery

  function applyCoupon(code) {
    const found = availableCoupons.find((item) => item.code === code.trim().toUpperCase())
    if (!found) {
      setCouponError('This code isn’t valid. Please try another.')
      return
    }
    setCoupon(found)
    setCouponError('')
    setCouponInput('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    clearCart()
    setPlaced(true)
  }

  if (placed) return <PageContainer className="py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-soft text-2xl text-rose-deep">✓</div><p className="mt-5 text-xs uppercase tracking-[0.18em] text-rose">All set</p><h1 className="mt-3 font-display text-4xl">Your little treat is on its way.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">This is a demo order confirmation. No payment has been processed.</p><Link to="/shop" className="mt-7 inline-block text-sm text-rose-deep underline">Back to the shop</Link></PageContainer>

  if (items.length === 0) return <PageContainer className="py-24 text-center"><h1 className="font-display text-4xl">Your bag is empty for now.</h1><Link to="/shop" className="mt-5 inline-block text-sm text-rose-deep underline">Find something lovely</Link></PageContainer>

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mb-9">
        <p className="text-xs uppercase tracking-[0.18em] text-rose">Almost yours</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">A few delivery details</h1>
        <p className="mt-2 text-sm text-muted">Just the essentials, then your new favourites are on their way.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-[24px] bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl">Where should we send it?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs text-muted sm:col-span-2">Full name<input required autoComplete="name" className="rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-rose" placeholder="Your name" /></label>
              <label className="grid gap-2 text-xs text-muted">Phone number<input required type="tel" autoComplete="tel" pattern="[0-9+() -]{8,}" className="rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-rose" placeholder="01XXXXXXXXX" /></label>
              <label className="grid gap-2 text-xs text-muted">District<input required autoComplete="address-level1" className="rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-rose" placeholder="Dhaka" /></label>
              <label className="grid gap-2 text-xs text-muted sm:col-span-2">Delivery address<textarea required rows="3" autoComplete="street-address" className="resize-y rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-rose" placeholder="House, road, area and any helpful directions" /></label>
            </div>
          </section>
          <section className="rounded-[24px] bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl">How would you like to pay?</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[['cash', 'Cash on delivery'], ['mobile', 'Mobile payment']].map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition ${payment === value ? 'border-rose bg-rose-soft/50' : 'border-line hover:border-rose/50'}`}>
                  <input type="radio" name="payment" value={value} checked={payment === value} onChange={(event) => setPayment(event.target.value)} className="accent-rose" />{label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-[24px] bg-white p-6 sm:p-7">
          <h2 className="font-display text-2xl">Your little total</h2>
          <div className="mt-5 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between gap-4 text-sm">
                <span className="text-muted">{product.name} × {quantity}</span>
                <span className="shrink-0">{money(product.price * quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <p className="text-xs text-muted">Have a coupon?</p>
            {coupon ? (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-rose-soft/50 px-4 py-2.5 text-sm">
                <span><strong className="font-medium">{coupon.code}</strong> applied</span>
                <button type="button" onClick={() => setCoupon(null)} className="text-xs text-rose-deep underline">Remove</button>
              </div>
            ) : (
              <>
                <div className="mt-2 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => { setCouponInput(event.target.value); setCouponError('') }}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyCoupon(couponInput) } }}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-xl border border-line bg-cream px-4 py-2.5 text-sm uppercase text-ink outline-none focus:border-rose"
                  />
                  <button type="button" onClick={() => applyCoupon(couponInput)} className="rounded-xl bg-rose px-4 text-sm font-medium text-white hover:bg-rose-deep">Apply</button>
                </div>
                {couponError && <p className="mt-2 text-xs text-rose-deep">{couponError}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableCoupons.map((item) => (
                    <button key={item.code} type="button" onClick={() => applyCoupon(item.code)} className="rounded-full border border-dashed border-rose/50 bg-pink-soft px-3 py-1 text-xs font-medium text-rose-deep hover:bg-pink">
                      {item.code}{item.type === 'percent' ? ` · ${item.value}% off` : ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            {discount > 0 && <div className="flex justify-between"><span className="text-muted">Discount ({coupon.code})</span><span className="text-rose-deep">−{money(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{delivery ? money(delivery) : 'On us'}</span></div>
            <div className="flex justify-between font-medium"><span>Total</span><span>{money(total)}</span></div>
          </div>

          <Button type="submit" variant="rose" className="mt-6 w-full">Place demo order</Button>
          <p className="mt-3 text-center text-[11px] leading-5 text-muted">Demo checkout only. This does not process a payment or send an order.</p>
        </aside>
      </form>
    </PageContainer>
  )
}