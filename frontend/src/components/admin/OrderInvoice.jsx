import Modal from './Modal.jsx'
import { ORDER_STATUSES, money, roseButton } from './adminHelpers.js'

/* Pop-up invoice for one order. "Print" opens the browser's print / save-as-PDF window. */
export default function OrderInvoice({ order, onClose }) {
  return (
    <Modal title={`Invoice ${order.id}`} onClose={onClose}>
      <div className="grid gap-1 text-sm text-ink-soft">
        <div><span className="text-ink">{order.name}</span> · {order.phone}</div>
        <div>{order.address}</div>
        <div>Date: {order.date} · Payment: {order.method} ({order.pay})</div>
        <div>Status: <span className="text-ink">{ORDER_STATUSES[order.status]}</span>{order.partner ? ` · Delivery: ${order.partner}` : ''}</div>
      </div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
            <th className="border-b border-line py-2 font-semibold">Item</th>
            <th className="border-b border-line py-2 font-semibold">Qty</th>
            <th className="border-b border-line py-2 text-right font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {(order.lines ?? []).map((line) => (
            <tr key={line.name}>
              <td className="border-b border-line py-2">{line.name}</td>
              <td className="border-b border-line py-2">{line.qty}</td>
              <td className="border-b border-line py-2 text-right">{money(line.price * line.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex justify-between font-medium"><span>Total</span><span>{money(order.total)}</span></div>

      <button type="button" onClick={() => window.print()} className={`${roseButton} mt-5`}>Print / save as PDF</button>
    </Modal>
  )
}
