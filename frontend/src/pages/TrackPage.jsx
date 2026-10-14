import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import { SEED_ORDERS } from '../data/ordersSource.js'

const statuses = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']
const money = (amount) => `৳${amount.toLocaleString('en-BD')}`

export default function TrackPage() {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('id') ?? '')
  const [order, setOrder] = useState(null)
  const [searched, setSearched] = useState(false)

  function lookUp(event) {
    event.preventDefault()
    const foundOrder = SEED_ORDERS.find((entry) => entry.id.toLowerCase() === orderId.trim().toLowerCase())
    setOrder(foundOrder ?? null)
    setSearched(true)
  }

  return <PageContainer className="max-w-[760px] py-12"><header className="mb-8 text-center"><h1 className="font-serif text-[34px] font-normal">Track your order</h1><p className="mt-2 text-sm text-ink-soft">Enter your order ID from the confirmation SMS.</p></header>{!order && <><form onSubmit={lookUp} className="mx-auto flex max-w-md gap-2.5"><input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="e.g. AR-1042" aria-label="Order ID" className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-rose"/><button type="submit" className="rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep">Track</button></form><p className="mt-3 text-center text-[11px] text-ink-soft">Demo order IDs: AR-1042, AR-1041, AR-1040 or AR-1039.</p>{searched && <p role="status" className="mt-5 text-center text-sm text-[#b3543d]">No order found with that ID. Check the ID and try again.</p>}</>}{order && <section className="mt-8 rounded-3xl border border-line bg-cream p-6 sm:p-8"><div className="mb-6 flex flex-wrap justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Order ID</p><p className="font-serif text-2xl">{order.id}</p></div><div className="text-right"><p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Total</p><p className="font-serif text-2xl">{money(order.total)}</p></div></div><ol className="space-y-0">{statuses.map((status,index) => { const complete = index <= order.status; return <li key={status} className="relative flex gap-3 pb-5 last:pb-0"><span className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-xs ${complete ? 'border-rose bg-rose text-white' : 'border-line bg-white text-ink-soft'}`}>{complete ? '✓' : index + 1}</span>{index < statuses.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px ${index < order.status ? 'bg-rose/70' : 'bg-line'}`}/>}<span className={`pt-1 text-sm ${complete ? 'font-medium text-ink' : 'text-ink-soft'}`}>{status}</span></li>})}</ol><div className="mt-6 flex flex-wrap gap-3"><Link to="/shop" className="rounded-full border border-line px-4 py-2 text-xs hover:border-rose">Continue shopping</Link><button type="button" onClick={() => { setOrder(null); setSearched(false); setOrderId('') }} className="rounded-full border border-line px-4 py-2 text-xs hover:border-rose">Track another</button></div></section>}</PageContainer>
}
