import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import OrderInvoice from './OrderInvoice.jsx'
import OrderMessages from './OrderMessages.jsx'
import { CANCELLED, DELIVERED, ORDER_STATUSES, card, cx, ghostButton, money, td, th } from './adminHelpers.js'

/* ORDERS: filter by stage, change the stage, assign a delivery partner,
   view the invoice, and CHAT with the delivery partner about an order.
   An order with a reported problem shows a red "Issue" tag until it is resolved. */
export default function OrdersTable({ orders, setOrders, partners, messages, setMessages }) {
  const [stage, setStage] = useState('all') // 'all' or a stage number
  const [invoice, setInvoice] = useState(null)
  const [chatId, setChatId] = useState(null)

  const update = (id, changes) =>
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, ...changes } : order)))

  const counts = useMemo(() => {
    const result = ORDER_STATUSES.map(() => 0)
    orders.forEach((order) => { result[order.status] += 1 })
    return result
  }, [orders])

  const visible = stage === 'all' ? orders : orders.filter((order) => order.status === stage)
  const chatOrder = orders.find((order) => order.id === chatId)

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <StageTab active={stage === 'all'} onClick={() => setStage('all')} label="All orders" count={orders.length} />
        {ORDER_STATUSES.map((name, index) => (
          <StageTab key={name} active={stage === index} onClick={() => setStage(index)} label={name} count={counts[index]} />
        ))}
      </div>

      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full min-w-[1060px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Delivery partner', 'Next step', 'Chat', 'Invoice'].map((heading) => (
                <th key={heading} className={th}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-ink-soft">No orders in this stage.</td></tr>
            ) : visible.map((order) => {
              const finished = order.status === DELIVERED || order.status === CANCELLED
              const chatCount = messages.filter((message) => message.orderId === order.id).length
              return (
                <tr key={order.id}>
                  <td className={td}>
                    <div className="font-semibold">{order.id}</div>
                    <div className="text-xs text-ink-soft">{order.date}</div>
                    {order.issue && <span className="mt-1 inline-block rounded-full bg-lowstock-bg px-2 py-0.5 text-[10px] font-semibold text-lowstock-text">Issue</span>}
                  </td>
                  <td className={td}>{order.name}</td>
                  <td className={`${td} text-ink-soft`}>{order.items}</td>
                  <td className={td}>{money(order.total)}</td>
                  <td className={td}>
                    <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium', order.pay === 'Paid' ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>{order.pay}</span>
                    <div className="mt-1 text-xs text-ink-soft">{order.method}</div>
                  </td>
                  <td className={td}>
                    <select value={order.status} onChange={(event) => update(order.id, { status: Number(event.target.value) })} className="!w-auto !py-2 text-[13px]">
                      {ORDER_STATUSES.map((name, index) => <option key={name} value={index}>{name}</option>)}
                    </select>
                  </td>
                  <td className={td}>
                    <select value={order.partner} onChange={(event) => update(order.id, { partner: event.target.value })} className="!w-auto !py-2 text-[13px]" aria-label={`Delivery partner for ${order.id}`}>
                      <option value="">Not assigned</option>
                      {partners.map((partner) => <option key={partner.id} value={partner.name}>{partner.name}</option>)}
                    </select>
                  </td>
                  <td className={td}>
                    {finished ? (
                      <span className="whitespace-nowrap text-xs text-gold">{order.status === DELIVERED ? '✓ Delivered' : 'Cancelled'}</span>
                    ) : (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button type="button" onClick={() => update(order.id, { status: order.status + 1 })} className="rounded-full bg-rose px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-rose-deep">→ {ORDER_STATUSES[order.status + 1]}</button>
                        <button type="button" onClick={() => update(order.id, { status: CANCELLED })} className="text-xs text-ink-soft underline hover:text-rose">Cancel</button>
                      </div>
                    )}
                  </td>
                  <td className={td}>
                    <button type="button" onClick={() => setChatId(order.id)} className="whitespace-nowrap text-xs text-ink-soft underline hover:text-rose">
                      {chatCount ? `Chat (${chatCount})` : 'Chat'}
                    </button>
                  </td>
                  <td className={td}><button type="button" onClick={() => setInvoice(order)} className="whitespace-nowrap text-xs text-ink-soft underline hover:text-rose">View ↗</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {invoice && <OrderInvoice order={orders.find((order) => order.id === invoice.id) ?? invoice} onClose={() => setInvoice(null)} />}

      {chatOrder && (
        <Modal title={`Chat · ${chatOrder.id}`} onClose={() => setChatId(null)}>
          <p className="mb-3 text-[13px] text-ink-soft">
            {chatOrder.partner ? `Delivery partner: ${chatOrder.partner}` : 'No delivery partner assigned yet.'}
            {chatOrder.issue && <span className="ml-2 text-lowstock-text">Reported: {chatOrder.issue}</span>}
          </p>
          <OrderMessages order={chatOrder} messages={messages} setMessages={setMessages} me={{ from: 'admin', name: 'Admin' }} />
          {chatOrder.issue && (
            <button type="button" onClick={() => update(chatOrder.id, { issue: '' })} className={`${ghostButton} mt-4`}>Mark problem as resolved</button>
          )}
        </Modal>
      )}
    </div>
  )
}

function StageTab({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-[13px] transition-all',
        active ? 'border-ink bg-ink text-ivory' : 'border-line bg-cream text-ink-soft hover:border-rose hover:text-rose',
      )}
    >
      {label}
      <span className={cx('inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold', active ? 'bg-ivory/25 text-ivory' : 'bg-pink text-rose-deep')}>{count}</span>
    </button>
  )
}
