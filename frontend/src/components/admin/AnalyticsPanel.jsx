import { useState } from 'react'
import { card, money, roseButton } from './adminHelpers.js'

const ORDER_STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped',
  outForDelivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
}
const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on delivery', sslcommerz: 'SSLCommerz', bkash: 'bKash', card: 'Card', unknown: 'Unknown',
}
const toCsvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

/* Business calculations and report rows are supplied by the backend. */
export default function AnalyticsPanel({ report, loading, error }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('')

  if (loading) return <p className="text-sm text-ink-soft">Loading reports…</p>
  if (error) return <p role="alert" className="text-sm text-lowstock-text">Could not load reports: {error}</p>
  if (!report) return <p className="text-sm text-ink-soft">Report data is unavailable.</p>

  const days = report.salesByDate || []
  const months = report.salesByMonth || []
  const bestSellers = report.bestSellingProducts || []
  const statusBreakdown = report.statusBreakdown || {}
  const paymentMethods = report.paymentMethods || []
  const receivedOrders = report.receivedOrders || []
  const max = Math.max(1, ...days.map((day) => day.revenue))
  const selectedDayReport = days.find((day) => day.date === selectedDay)
  const activeMonth = selectedMonth || months.at(-1)?.month || ''
  const selectedMonthReport = months.find((item) => item.month === activeMonth)
  const reportOrders = receivedOrders.filter((order) => !selectedDay || order.date === selectedDay)
  const monthlyOrders = receivedOrders.filter((order) => order.month === activeMonth)

  function saveCsv(filename, rows) {
    const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function downloadReport() {
    const rows = [
      ['Order', 'Date (Asia/Dhaka)', 'Customer', 'Items', 'Total (BDT)', 'Method'],
      ...reportOrders.map((order) => [order.orderNumber, order.date, order.customer, order.items, order.total, PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod]),
    ]
    saveCsv(`make-me-pretty-sales-${selectedDay || 'all-days'}.csv`, rows)
  }

  function downloadMonthlyReport() {
    if (!selectedMonthReport) return
    const rows = [
      ['Monthly sales report', activeMonth],
      ['Received orders', selectedMonthReport.orders],
      ['Received revenue (BDT)', selectedMonthReport.revenue],
      [],
      ['Order', 'Date (Asia/Dhaka)', 'Customer', 'Items', 'Total (BDT)', 'Method'],
      ...monthlyOrders.map((order) => [order.orderNumber, order.date, order.customer, order.items, order.total, PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod]),
    ]
    saveCsv(`make-me-pretty-sales-${activeMonth}.csv`, rows)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={`${card} p-6`}>
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-serif text-lg">Revenue by day</h3>
          <span className="text-sm text-ink-soft">{money(report.summary?.receivedRevenue || 0)} <span className="text-[11px]">received</span></span>
        </div>
        {days.length === 0 ? <p className="text-sm text-ink-soft">No received payments yet.</p> : (
          <div className="grid h-[166px] w-full grid-flow-col auto-cols-fr items-end gap-1 overflow-hidden" aria-label="Daily received revenue. Select a bar to filter the sales report.">
            {days.slice(-14).map((day, index, visibleDays) => (
              <button type="button" key={day.date} onClick={() => setSelectedDay((current) => current === day.date ? null : day.date)} aria-pressed={selectedDay === day.date} aria-label={`${day.date}, ${money(day.revenue)} revenue. Click to ${selectedDay === day.date ? 'clear selection' : 'select day'}`} className={`flex h-full min-w-0 flex-col items-center justify-end gap-1 overflow-hidden rounded-t-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose ${selectedDay === day.date ? 'bg-rose-soft/60' : ''}`}>
                <div className="w-full max-w-8 shrink-0 rounded-t-lg transition-all duration-700" style={{ height: `${Math.max(6, Math.round((day.revenue / max) * 120))}px`, maxHeight: 120, background: selectedDay === day.date || (!selectedDay && index === visibleDays.length - 1) ? 'var(--color-rose)' : 'var(--color-pink)' }} title={`${day.date}: ${money(day.revenue)}`} />
                <div className="w-full shrink-0 truncate text-center text-[9px] text-ink-soft" title={day.date}>{day.date}</div>
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-ink-soft">Only paid, non-cancelled orders count as received revenue. {selectedDay ? `Selected ${selectedDay}: ${money(selectedDayReport?.revenue || 0)}.` : 'Dates use Bangladesh time.'}</p>
        <p className="mt-4 text-[12.5px] text-ink-soft">{statusBreakdown.delivered || 0} of {report.summary?.totalOrders || 0} orders delivered.</p>
        <button type="button" onClick={downloadReport} disabled={reportOrders.length === 0} className={`${roseButton} mt-4 disabled:cursor-not-allowed disabled:opacity-50`}>{selectedDay ? `Download ${selectedDay} sales (CSV)` : 'Download all received sales (CSV)'}</button>
        <div className="mt-5 border-t border-line pt-4">
          <h4 className="font-serif text-base">Monthly sales report</h4>
          {months.length === 0 ? <p className="mt-2 text-sm text-ink-soft">No monthly received sales yet.</p> : <>
            <label className="mt-2 grid max-w-xs gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Select month
              <select value={activeMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[13px] font-normal normal-case tracking-normal text-ink outline-none focus:border-rose">
                {months.map((item) => <option key={item.month} value={item.month}>{item.month}</option>)}
              </select>
            </label>
            {selectedMonthReport && <p className="mt-2 text-xs text-ink-soft">{selectedMonthReport.orders} received orders · {money(selectedMonthReport.revenue)}</p>}
            <button type="button" onClick={downloadMonthlyReport} disabled={!selectedMonthReport || monthlyOrders.length === 0} className={`${roseButton} mt-3 disabled:cursor-not-allowed disabled:opacity-50`}>Download {activeMonth} sales (CSV)</button>
          </>}
        </div>
      </div>

      <div className={`${card} p-6`}>
        <h3 className="mb-4 font-serif text-lg">Best sellers</h3>
        {bestSellers.length === 0 ? <p className="text-sm text-ink-soft">No sales yet.</p> : bestSellers.map((item, index) => (
          <div key={item.product || item.name} className="flex justify-between border-b border-line py-2.5 text-sm last:border-0">
            <span><span className="mr-2.5 font-serif text-gold">{String(index + 1).padStart(2, '0')}</span>{item.name}</span>
            <span className="text-ink-soft">{item.unitsSold} sold</span>
          </div>
        ))}
      </div>

      <div className={`${card} p-6`}>
        <h3 className="mb-4 font-serif text-lg">Order status</h3>
        {Object.entries(statusBreakdown).length === 0 ? <p className="text-sm text-ink-soft">No orders yet.</p> : Object.entries(statusBreakdown).map(([status, count]) => (
          <div key={status} className="flex justify-between border-b border-line py-2.5 text-sm last:border-0"><span>{ORDER_STATUS_LABELS[status] || status}</span><span className="text-ink-soft">{count}</span></div>
        ))}
      </div>

      <div className={`${card} p-6`}>
        <h3 className="mb-4 font-serif text-lg">Payment methods</h3>
        {paymentMethods.length === 0 ? <p className="text-sm text-ink-soft">No active orders yet.</p> : paymentMethods.map((method) => (
          <div key={method.method} className="border-b border-line py-2.5 text-sm last:border-0">
            <div className="flex justify-between"><span>{PAYMENT_METHOD_LABELS[method.method] || method.method}</span><span>{method.orders} orders</span></div>
            <div className="mt-1 flex justify-between text-xs text-ink-soft"><span>Order amount: {money(method.totalAmount)}</span><span>Received: {money(method.receivedAmount)}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
