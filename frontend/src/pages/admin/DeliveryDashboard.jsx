import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/admin/Modal.jsx'
import OrderMessages from '../../components/admin/OrderMessages.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import { useStoredState } from '../../components/admin/useStoredState.js'
import { INITIAL_ORDERS } from '../../data/adminSeed.js'
import { DELIVERED, KEYS, ORDER_STATUSES, card, cx, ghostButton, money, roseButton, timeLabel } from '../../components/admin/adminHelpers.js'

/* The three steps a delivery partner can press, and the order status each one sets */
const STEPS = [
  { label: 'Picked up', status: 2 },
  { label: 'Out for delivery', status: 3 },
  { label: 'Delivered', status: 4 },
]
const PROBLEMS = [
  'Customer is not answering',
  'Wrong or incomplete address',
  'Customer refused the order',
  'Payment problem',
  'Product damaged',
  'Other',
]
const FILTERS = ['To deliver', 'Delivered', 'All']

/* cash on delivery that has not been collected yet */
const needsCash = (order) => order.method === 'COD' && order.pay !== 'Paid'

/* =============================================================================
   DELIVERY PARTNER DASHBOARD
   Shows only the orders assigned to the signed-in partner. The partner can:
   call / text the customer, open the address in Maps, update the delivery step,
   collect cash on delivery, message the admin, report a problem and share a
   location. Orders and messages are the SAME saved lists the admin uses.
============================================================================= */
export default function DeliveryDashboard({ session, onSignOut }) {
  const [orders, setOrders] = useStoredState(KEYS.orders, INITIAL_ORDERS)
  const [messages, setMessages] = useStoredState(KEYS.messages, [])
  const [filter, setFilter] = useState('To deliver')
  const [chatId, setChatId] = useState(null)
  const [problemId, setProblemId] = useState(null)
  const [problem, setProblem] = useState({ reason: PROBLEMS[0], note: '' })
  const [notice, setNotice] = useState('')

  const mine = orders.filter((order) => order.partner === session.name)
  const open = mine.filter((order) => order.status < DELIVERED)
  const done = mine.filter((order) => order.status === DELIVERED)
  const cashToCollect = open.filter(needsCash).reduce((sum, order) => sum + order.total, 0)

  const shown = filter === 'To deliver' ? open : filter === 'Delivered' ? done : mine
  const chatOrder = orders.find((order) => order.id === chatId)
  const problemOrder = orders.find((order) => order.id === problemId)

  /* change one order, and remember the step with the time */
  const change = (id, changes, stepLabel) =>
    setOrders((current) => current.map((order) => {
      if (order.id !== id) return order
      const history = stepLabel ? [...(order.history ?? []), { label: stepLabel, at: new Date().toISOString() }] : order.history
      return { ...order, ...changes, history }
    }))

  const addMessage = (order, kind, text, extra = {}) =>
    setMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, orderId: order.id, from: 'partner', name: session.name, kind, text, at: new Date().toISOString(), ...extra },
    ])

  function reportProblem(event) {
    event.preventDefault()
    const text = `${problem.reason}${problem.note.trim() ? ` — ${problem.note.trim()}` : ''}`
    addMessage(problemOrder, 'issue', text)
    change(problemOrder.id, { issue: problem.reason })
    setProblem({ reason: PROBLEMS[0], note: '' })
    setProblemId(null)
  }

  /* ask the browser for the phone's position and send it to the admin as a Maps link */
  function shareLocation(order) {
    if (!navigator.geolocation) return setNotice('This browser cannot share location.')
    setNotice('Finding your location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        addMessage(order, 'location', 'My current location', { link: `https://www.google.com/maps?q=${latitude},${longitude}` })
        setNotice(`Location sent to the admin for ${order.id}.`)
      },
      () => setNotice('Could not get your location. Please allow location access and try again.'),
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-[1000px] px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="font-serif text-[30px] font-normal">Delivery dashboard</h1>
            <p className="text-sm text-ink-soft">Hello, {session.name}. Here are your assigned orders.</p>
          </div>
          <div className="flex gap-4 text-sm sm:ml-auto">
            <Link to="/" className="text-ink-soft underline hover:text-rose">← View shop</Link>
            <button type="button" onClick={onSignOut} className="text-rose underline">Sign out</button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Assigned" value={mine.length} />
          <StatCard label="To deliver" value={open.length} accent="var(--color-rose)" />
          <StatCard label="Delivered" value={done.length} accent="var(--color-gold)" />
          <StatCard label="Cash to collect" value={money(cashToCollect)} accent={cashToCollect ? '#B3543D' : 'var(--color-ink)'} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter(name)}
              className={cx('rounded-full border-[1.5px] px-4 py-2 text-[13px] transition-all', filter === name ? 'border-ink bg-ink text-ivory' : 'border-line bg-cream text-ink-soft hover:border-rose hover:text-rose')}
            >
              {name}
            </button>
          ))}
        </div>

        {notice && <p className="mb-4 rounded-2xl bg-pink-soft px-4 py-3 text-[13px] text-ink-soft">{notice}</p>}

        <div className="grid gap-4">
          {shown.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No orders here.</p>}
          {shown.map((order) => {
            const chatCount = messages.filter((message) => message.orderId === order.id).length
            const finished = order.status >= DELIVERED
            const cash = needsCash(order)
            return (
              <div key={order.id} className={`${card} p-5`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-serif text-lg">{order.id}</div>
                  <span className="rounded-full bg-pink px-2.5 py-1 text-[11px] font-medium text-rose-deep">{ORDER_STATUSES[order.status]}</span>
                  {order.issue && <span className="rounded-full bg-lowstock-bg px-2.5 py-1 text-[11px] font-semibold text-lowstock-text">Problem: {order.issue}</span>}
                  <div className="ml-auto text-sm font-semibold">{money(order.total)} <span className="text-xs font-normal text-ink-soft">· {order.method} ({order.pay})</span></div>
                </div>

                <div className="mt-3 grid gap-1 text-sm text-ink-soft">
                  <div><span className="text-ink">{order.name}</span> · {order.phone}</div>
                  <div>{order.address}</div>
                  <div>{(order.lines ?? []).map((line) => `${line.qty} × ${line.name}`).join(', ')}</div>
                </div>

                {/* contact the customer and find the address */}
                <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
                  <a href={`tel:${order.phone}`} className="text-rose underline">Call customer</a>
                  <a href={`sms:${order.phone}`} className="text-rose underline">Text customer</a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`} target="_blank" rel="noreferrer" className="text-rose underline">Open address in Maps ↗</a>
                </div>

                {/* cash on delivery */}
                {cash && !finished && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-lowstock-bg px-4 py-3 text-sm text-lowstock-text">
                    <span>Collect <strong>{money(order.total)}</strong> cash from the customer.</span>
                    <button type="button" onClick={() => change(order.id, { pay: 'Paid' }, 'Cash collected')} className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-rose-deep">Mark cash collected</button>
                  </div>
                )}

                {/* delivery steps */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {STEPS.map((step) => {
                    const reached = order.status >= step.status
                    const blocked = step.status === DELIVERED && cash
                    return (
                      <button
                        key={step.label}
                        type="button"
                        disabled={reached || blocked}
                        title={blocked ? 'Collect the cash first' : undefined}
                        onClick={() => change(order.id, { status: step.status }, step.label)}
                        className={cx(
                          'rounded-full border-[1.5px] px-4 py-2 text-[13px] transition-colors',
                          reached ? 'cursor-default border-line bg-pink-soft text-ink-soft' : blocked ? 'cursor-not-allowed border-line text-ink-soft opacity-60' : 'border-rose bg-rose text-white hover:bg-rose-deep',
                        )}
                      >
                        {reached ? '✓ ' : ''}{step.label}
                      </button>
                    )
                  })}
                </div>
                {cash && order.status < DELIVERED && <p className="mt-2 text-xs text-ink-soft">“Delivered” unlocks after you mark the cash as collected.</p>}

                {/* the time of each step */}
                {order.history?.length > 0 && (
                  <p className="mt-3 text-xs text-ink-soft">{order.history.map((step) => `${step.label} ${timeLabel(step.at)}`).join('  →  ')}</p>
                )}

                {/* talk to the admin */}
                <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4">
                  <button type="button" onClick={() => setChatId(order.id)} className={ghostButton}>{chatCount ? `Message admin (${chatCount})` : 'Message admin'}</button>
                  {!finished && <button type="button" onClick={() => setProblemId(order.id)} className={ghostButton}>Report a problem</button>}
                  {!finished && <button type="button" onClick={() => shareLocation(order)} className={ghostButton}>Share my location</button>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {chatOrder && (
        <Modal title={`Chat with admin · ${chatOrder.id}`} onClose={() => setChatId(null)}>
          <OrderMessages order={chatOrder} messages={messages} setMessages={setMessages} me={{ from: 'partner', name: session.name }} />
        </Modal>
      )}

      {problemOrder && (
        <Modal title={`Report a problem · ${problemOrder.id}`} onClose={() => setProblemId(null)}>
          <form onSubmit={reportProblem} className="grid gap-3">
            <select value={problem.reason} onChange={(event) => setProblem((current) => ({ ...current, reason: event.target.value }))}>
              {PROBLEMS.map((reason) => <option key={reason}>{reason}</option>)}
            </select>
            <textarea rows={3} value={problem.note} onChange={(event) => setProblem((current) => ({ ...current, note: event.target.value }))} placeholder="Add details for the admin (optional)" />
            <div className="flex gap-3">
              <button type="submit" className={roseButton}>Send to admin</button>
              <button type="button" onClick={() => setProblemId(null)} className={ghostButton}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
