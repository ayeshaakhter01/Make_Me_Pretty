import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import { useCart } from '../context/useCart.js'
import { apiRequest, loadAuthSession } from '../api.js'

const money = (amount) => `৳${amount.toLocaleString('en-BD')}`
const freeDeliveryAt = 3000
const insideCtgCharge = 60
const outsideCtgCharge = 120

const districts = ['Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Chuadanga', 'Cox’s Bazar', 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon']

const paymentMethods = [
  { value: 'bkash', label: 'bKash', hint: 'Pay with your bKash wallet · setup required', mark: 'b', markClass: 'text-pink-600', disabled: true },
  { value: 'card', label: 'Card / Net Banking', hint: 'Visa, Mastercard via SSLCommerz · setup required', mark: '▭', markClass: 'text-sky-600', disabled: true },
  { value: 'cod', label: 'Cash on Delivery', hint: 'Pay when your order arrives', mark: '৳', markClass: 'text-amber-700' },
]

const labelClass = 'grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted'
const fieldClass = 'rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[13px] font-normal normal-case tracking-normal text-ink outline-none focus:border-rose'

export default function CheckoutPage() {
  const { items, subtotal, setQuantity, removeItem, clearCart } = useCart()
  const [placed, setPlaced] = useState(false)
  const [payment, setPayment] = useState('cod')
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [orderError, setOrderError] = useState('')
  const [createdOrder, setCreatedOrder] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [district, setDistrict] = useState('Chattogram')
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false)

  useEffect(() => { apiRequest('/coupons').then(setAvailableCoupons).catch(() => setAvailableCoupons([])) }, [])

  const insideCtg = district === 'Chattogram'
  const baseDelivery = subtotal === 0 || subtotal >= freeDeliveryAt ? 0 : insideCtg ? insideCtgCharge : outsideCtgCharge
  const discount = coupon?.itemDiscount || 0
  const delivery = Math.max(0, baseDelivery - (coupon?.deliveryDiscount || 0))
  const total = subtotal - discount + delivery

  async function applyCoupon(code) {
    try {
      const result = await apiRequest('/coupons/validate', { method: 'POST', body: JSON.stringify({ code: code.trim(), subtotal, deliveryCharge: baseDelivery }) })
      setCoupon({ ...result.coupon, itemDiscount: result.itemDiscount, deliveryDiscount: result.deliveryDiscount, totalDiscount: result.totalDiscount })
      setCouponError('')
      setCouponInput('')
    } catch (problem) {
      setCouponError(problem.message || 'This code isn’t valid. Please try another.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setOrderError('')
    if (!loadAuthSession()?.token) { setOrderError('Please sign in before placing your order.'); return }
    const values = new FormData(event.currentTarget)
    try {
      const order = await apiRequest('/orders', { method: 'POST', body: JSON.stringify({
        items: items.map(({ product, quantity }) => ({ productId: product._id || product.id, quantity })),
        address: { recipientName: values.get('recipientName'), phone: values.get('phone'), addressLine: values.get('addressLine'), area: values.get('area'), city: district },
        paymentMethod: payment,
        ...(coupon?.code ? { couponCode: coupon.code } : {}),
      }) })
      setCreatedOrder(order)
      clearCart()
      setPlaced(true)
    } catch (problem) { setOrderError(problem.message || 'Could not place the order.') }
  }

  if (placed) return <PageContainer className="py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-soft text-2xl text-rose-deep">✓</div><p className="mt-5 text-xs uppercase tracking-[0.18em] text-rose">Order received</p><h1 className="mt-3 font-display text-4xl">Your little treat is on its way.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Your tracking number is <strong>{createdOrder?.orderNumber || createdOrder?._id}</strong>. Payment method: Cash on Delivery.</p><Link to={`/track?id=${encodeURIComponent(createdOrder?.orderNumber || '')}&phone=${encodeURIComponent(createdOrder?.address?.phone || '')}`} className="mt-5 inline-block rounded-full bg-rose px-6 py-3 text-sm text-white">Track this order</Link><br/><Link to="/shop" className="mt-4 inline-block text-sm text-rose-deep underline">Back to the shop</Link></PageContainer>

  if (items.length === 0) return <PageContainer className="py-24 text-center"><h1 className="font-display text-4xl">Your bag is empty for now.</h1><Link to="/shop" className="mt-5 inline-block text-sm text-rose-deep underline">Find something lovely</Link></PageContainer>

  return (
    <PageContainer className="py-8 sm:py-10">
      <div className="mx-auto mb-6 max-w-[1000px]">
        <p className="text-xs uppercase tracking-[0.18em] text-rose">Almost yours</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">A few delivery details</h1>
        <p className="mt-2 text-sm text-muted">Just the essentials, then your new favourites are on their way.</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto grid max-w-[1000px] items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-[20px] bg-white p-5 sm:p-6">
            <h2 className="font-display text-xl">1 · Contact &amp; Delivery</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>Full name<input name="recipientName" required autoComplete="name" className={fieldClass} placeholder="Your name" /></label>
              <label className={labelClass}>Mobile number<input name="phone" required type="tel" autoComplete="tel" pattern="[0-9+() -]{8,}" className={fieldClass} placeholder="01XXXXXXXXX" /></label>
              <label className={labelClass}>Email (optional)<input type="email" autoComplete="email" className={fieldClass} placeholder="you@example.com" /></label>
              <label className={labelClass}>District
                <select name="district" required value={district} onChange={(event) => setDistrict(event.target.value)} autoComplete="address-level1" className={fieldClass}>
                  {districts.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className={labelClass}>Thana / Upazila<input name="area" required className={fieldClass} placeholder="e.g. Dhanmondi" /></label>
              <label className={`${labelClass} sm:col-span-2`}>Full address<textarea name="addressLine" required rows="2" autoComplete="street-address" className={`${fieldClass} resize-y`} placeholder="House, road, area..." /></label>
            </div>
          </section>

          <section className="rounded-[20px] bg-white p-5 sm:p-6">
            <h2 className="font-display text-xl">2 · Payment</h2>
            <div className="mt-4 grid gap-2.5">
              {paymentMethods.map((method) => (
                <label key={method.value} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${method.disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'} ${payment === method.value ? 'border-rose bg-rose-soft/50' : 'border-line hover:border-rose/50'}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-base font-bold ${method.markClass}`}>{method.mark}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold">{method.label}</span>
                    <span className="block text-[11px] text-muted">{method.hint}</span>
                  </span>
                  <input type="radio" name="payment" value={method.value} checked={payment === method.value} disabled={method.disabled} onChange={(event) => setPayment(event.target.value)} className="size-4 accent-rose" />
                </label>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-muted">bKash and card options are shown but unavailable until merchant credentials and a payment callback are configured. Cash on Delivery is ready.</p>
          </section>
        </div>

        <aside className="rounded-[20px] bg-white p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-xl">Your glow-up summary</h2>

          <div className="mt-4 space-y-3.5">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-start justify-between gap-3 text-[13px]">
                <div className="min-w-0">
                  <p className="leading-snug">{product.name}</p>
                  <div className="mt-1.5 inline-flex items-center rounded-full border border-line">
                    <button type="button" onClick={() => (quantity <= 1 ? removeItem(product.id) : setQuantity(product.id, quantity - 1))} className="grid size-6 place-items-center text-muted hover:text-ink" aria-label={`Remove one ${product.name}`}><Icon name="minus" className="size-3" /></button>
                    <span className="min-w-5 text-center text-xs">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(product.id, quantity + 1)} className="grid size-6 place-items-center text-muted hover:text-ink" aria-label={`Add one ${product.name}`}><Icon name="plus" className="size-3" /></button>
                  </div>
                </div>
                <span className="shrink-0 pt-0.5">{money(product.price * quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="text-[11px] text-muted">Have a coupon?</p>
            {coupon ? (
              <div className="mt-1.5 flex items-center justify-between rounded-lg bg-rose-soft/50 px-3 py-2 text-[13px]">
                <span><strong className="font-medium">{coupon.code}</strong> applied</span>
                <button type="button" onClick={() => setCoupon(null)} className="text-xs text-rose-deep underline">Remove</button>
              </div>
            ) : (
              <>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => { setCouponInput(event.target.value); setCouponError('') }}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyCoupon(couponInput) } }}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-[13px] uppercase text-ink outline-none focus:border-rose"
                  />
                  <button type="button" onClick={() => applyCoupon(couponInput)} className="rounded-lg bg-rose px-3.5 text-[13px] font-medium text-white hover:bg-rose-deep">Apply</button>
                </div>
                {couponError && <p className="mt-1.5 text-[11px] text-rose-deep">{couponError}</p>}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {availableCoupons.map((item) => (
                    <button key={item.code} type="button" onClick={() => applyCoupon(item.code)} className="rounded-full border border-dashed border-rose/50 bg-pink-soft px-2.5 py-0.5 text-[11px] font-medium text-rose-deep hover:bg-pink">
                      {item.code}{item.type === 'percent' ? ` · ${item.value}% off` : ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-line pt-4 text-[13px]">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-muted">Discount ({coupon.code})</span><span className="text-rose-deep">−{money(discount)}</span></div>}
            <div className="flex justify-between">
              <span className="inline-flex items-center gap-1.5 text-muted">
                Delivery ({insideCtg ? 'Inside' : 'Outside'} Chattogram)
                <button
                  type="button"
                  onClick={() => setShowDeliveryInfo((open) => !open)}
                  aria-expanded={showDeliveryInfo}
                  aria-label="Show delivery charges"
                  className={`grid size-4 place-items-center rounded-full border text-[10px] font-semibold leading-none transition ${showDeliveryInfo ? 'border-rose bg-rose text-white' : 'border-rose/60 text-rose-deep hover:bg-pink-soft'}`}
                >i</button>
              </span>
              <span>{delivery ? money(delivery) : 'On us'}</span>
            </div>
            {showDeliveryInfo && (
              <div className="rounded-lg bg-cream px-3 py-2.5 text-[12px]">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Delivery charges</p>
                <div className={`flex justify-between rounded-md px-2 py-1 ${insideCtg ? 'bg-rose-soft/60 font-medium text-rose-deep' : 'text-muted'}`}>
                  <span>Inside Chattogram</span><span>{money(insideCtgCharge)}</span>
                </div>
                <div className={`mt-1 flex justify-between rounded-md px-2 py-1 ${!insideCtg ? 'bg-rose-soft/60 font-medium text-rose-deep' : 'text-muted'}`}>
                  <span>Outside Chattogram</span><span>{money(outsideCtgCharge)}</span>
                </div>
                <p className="mt-2 px-2 text-[11px] text-muted">Free delivery on orders over {money(freeDeliveryAt)}.</p>
              </div>
            )}
            <div className="flex justify-between font-medium"><span>Total</span><span>{money(total)}</span></div>
          </div>

          {orderError && <p role="alert" className="mt-3 text-sm text-lowstock-text">{orderError} {orderError.includes('sign in') && <Link to="/account" className="underline">Sign in</Link>}</p>}
          <Button type="submit" variant="rose" className="mt-4 w-full">Place order</Button>
        </aside>
      </form>
    </PageContainer>
  )
}
