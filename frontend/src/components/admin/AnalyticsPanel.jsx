import { useMemo, useState } from 'react'
import { DELIVERED, CANCELLED, card, money, roseButton } from './adminHelpers.js'

/* SALES REPORT built from the orders:
   - revenue per day (paid orders only), - best sellers (units sold), - CSV download. */
export default function AnalyticsPanel({ orders }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const { days, total, max } = useMemo(() => {
    const byDay = new Map()
    orders.filter((o) => o.pay === 'Paid' && o.status !== CANCELLED).forEach((o) => {
      byDay.set(o.date, (byDay.get(o.date) ?? 0) + o.total)
    })
    const list = [...byDay.entries()].map(([label, amount]) => ({ label, amount })).reverse() // oldest first
    const visibleDays = list.slice(-14)
    return { days: visibleDays, total: list.reduce((sum, d) => sum + d.amount, 0), max: Math.max(1, ...visibleDays.map((d) => d.amount)) }
  }, [orders])

  const bestSellers = useMemo(() => {
    const units = new Map()
    orders.forEach((o) => (o.lines ?? []).forEach((l) => units.set(l.name, (units.get(l.name) ?? 0) + l.qty)))
    return [...units.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6)
  }, [orders])

  const delivered = orders.filter((o) => o.status === DELIVERED).length
  const reportOrders = orders.filter((order) => order.pay === 'Paid' && order.status !== CANCELLED && (!selectedDay || order.date === selectedDay))

  /* build a .csv text and download it */
  function downloadReport() {
    const rows = [['Order', 'Date', 'Customer', 'Items', 'Total', 'Payment', 'Method']]
    reportOrders.forEach((o) => rows.push([o.id, o.date, o.name, o.items, o.total, o.pay, o.method]))
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = `make-me-pretty-sales-${selectedDay ? selectedDay.replaceAll('/', '-') : 'all-days'}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={`${card} p-6`}>
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-serif text-lg">Revenue by day</h3>
          <span className="text-sm text-ink-soft">{money(total)} <span className="text-[11px]">paid</span></span>
        </div>
        {days.length === 0 ? (
          <p className="text-sm text-ink-soft">No paid orders yet.</p>
        ) : (
          <div className="grid h-[166px] w-full grid-flow-col auto-cols-fr items-end gap-1 overflow-hidden" aria-label="Daily paid revenue. Select a bar to filter the sales report.">
            {days.map((day, index) => (
              <button type="button" key={day.label} onClick={() => setSelectedDay((current) => current === day.label ? null : day.label)} aria-pressed={selectedDay === day.label} aria-label={`${day.label}, ${money(day.amount)} revenue. Click to ${selectedDay === day.label ? 'clear selection' : 'select day'}`} className={`flex h-full min-w-0 flex-col items-center justify-end gap-1 overflow-hidden rounded-t-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose ${selectedDay === day.label ? 'bg-rose-soft/60' : ''}`}>
                <div
                  className="w-full max-w-8 shrink-0 rounded-t-lg transition-all duration-700"
                  style={{ height: `${Math.max(6, Math.round((day.amount / max) * 120))}px`, maxHeight: 120, background: selectedDay === day.label || (!selectedDay && index === days.length - 1) ? 'var(--color-rose)' : 'var(--color-pink)' }}
                  title={`${day.label}: ${money(day.amount)}`}
                />
                <div className="w-full shrink-0 truncate text-center text-[9px] text-ink-soft" title={day.label}>{day.label}</div>
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-ink-soft">Revenue is paid, non-cancelled orders. Bars show the latest 14 dates with sales. {selectedDay ? `Selected ${selectedDay}: ${money(reportOrders.reduce((sum, order) => sum + order.total, 0))}.` : 'Select a bar to download that date only; select it again to clear.'}</p>
        <p className="mt-4 text-[12.5px] text-ink-soft">{delivered} of {orders.length} orders delivered.</p>
        <button type="button" onClick={downloadReport} className={`${roseButton} mt-4`}>{selectedDay ? `Download ${selectedDay} sales (CSV)` : 'Download all paid sales (CSV)'}</button>
      </div>

      <div className={`${card} p-6`}>
        <h3 className="mb-4 font-serif text-lg">Best sellers</h3>
        {bestSellers.length === 0 ? (
          <p className="text-sm text-ink-soft">No sales yet.</p>
        ) : bestSellers.map((item, index) => (
          <div key={item.name} className="flex justify-between border-b border-line py-2.5 text-sm last:border-0">
            <span><span className="mr-2.5 font-serif text-gold">0{index + 1}</span>{item.name}</span>
            <span className="text-ink-soft">{item.qty} sold</span>
          </div>
        ))}
      </div>
    </div>
  )
}
