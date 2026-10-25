import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import { apiRequest, loadAuthSession } from '../api.js'

const statuses = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']
const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function TrackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState(searchParams.get('id') ?? '')
  const [order, setOrder] = useState(null)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Tracking is only for signed-in customers.
    if (!loadAuthSession()?.token) {
      navigate('/account', { replace: true })
      return
    }
    if (searchParams.get('id')) lookUp({ preventDefault() {} })
  }, [])

  async function lookUp(event) {
    event.preventDefault()
    setSearched(true)
    setError('')
    try {
      // /orders/my only returns the signed-in customer's own orders.
      const mine = await apiRequest('/orders/my')
      const entered = orderId.trim().toUpperCase()
      const found = mine.find((item) => item.orderNumber?.toUpperCase() === entered)
      if (!found) throw new Error('That order is not in your account history. Check the order number and try again.')
      setOrder(found)
    } catch (problem) {
      setOrder(null)
      setError(problem.message || 'No order found. Check the details and try again.')
    }
  }

  const statusIndex = ['pending', 'confirmed', 'shipped', 'outForDelivery', 'delivered'].indexOf(order?.status)
  return (
    <PageContainer className="max-w-[760px] py-12">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-[34px] font-normal">Track your order</h1>
        <p className="mt-2 text-sm text-ink-soft">Enter the order number from your Order History.</p>
      </header>
      {!order && (
        <>
          <form onSubmit={lookUp} className="mx-auto grid max-w-md gap-2.5">
            <input required value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="e.g. MMP-261024-AB12CD" aria-label="Order number" className="min-w-0 rounded-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-rose" />
            <button type="submit" className="rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep">Track order</button>
          </form>
          {searched && error && <p role="status" className="mt-5 text-center text-sm text-[#b3543d]">{error}</p>}
        </>
      )}
      {order && (
        <section className="mt-8 rounded-3xl border border-line bg-cream p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Order number</p>
              <p className="font-serif text-2xl">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Total</p>
              <p className="font-serif text-2xl">{money(order.total)}</p>
            </div>
          </div>
          {order.status === 'cancelled' ? (
            <p className="rounded-xl bg-white p-4 text-sm text-rose-deep">This order was cancelled.</p>
          ) : (
            <ol className="space-y-0">
              {statuses.map((status, index) => {
                const complete = index <= statusIndex
                return (
                  <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
                    <span className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-xs ${complete ? 'border-rose bg-rose text-white' : 'border-line bg-white text-ink-soft'}`}>{complete ? '✓' : index + 1}</span>
                    {index < statuses.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px ${index < statusIndex ? 'bg-rose/70' : 'bg-line'}`} />}
                    <span className={`pt-1 text-sm ${complete ? 'font-medium text-ink' : 'text-ink-soft'}`}>{status}</span>
                  </li>
                )
              })}
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/account/profile" className="rounded-full border border-line px-4 py-2 text-xs hover:border-rose">Back to my account</Link>
            <button type="button" onClick={() => { setOrder(null); setSearched(false); setOrderId('') }} className="rounded-full border border-line px-4 py-2 text-xs hover:border-rose">Track another</button>
          </div>
        </section>
      )}
    </PageContainer>
  )
}