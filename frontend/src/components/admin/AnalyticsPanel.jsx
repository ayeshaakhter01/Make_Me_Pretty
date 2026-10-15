import { useMemo } from 'react'
import { DELIVERED, CANCELLED, card, money, roseButton } from './adminHelpers.js'

/* SALES REPORT built from the orders:
   - revenue per day (paid orders only), - best sellers (units sold), - CSV download. */
export default function AnalyticsPanel({ orders }) {
  const { days, total, max } = useMemo(() => {
    const byDay = new Map()
    orders.filter((o) => o.pay === 'Paid' && o.status !== CANCELLED).forEach((o) => {
      byDay.set(o.date, (byDay.get(o.date) ?? 0) + o.total)
    })
    const list = [...byDay.entries()].map(([label, amount]) => ({ label, amount })).reverse() // oldest first
    return { days: list, total: list.reduce((sum, d) => sum + d.amount, 0), max: Math.max(1, ...list.map((d) => d.amount)) }
  }, [orders])

  const bestSellers = useMemo(() => {
    const units = new Map()
    orders.forEach((o) => (o.lines ?? []).forEach((l) => units.set(l.name, (units.get(l.name) ?? 0) + l.qty)))
    return [...units.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6)
  }, [orders])

  const delivered = orders.filter((o) => o.status === DELIVERED).length

  /* build a .csv text and download it */
  function downloadReport() {
    const rows = [['Order', 'Date', 'Customer', 'Items', 'Total', 'Payment', 'Method']]
    orders.forEach((o) => rows.push([o.id, o.date, o.name, o.items, o.total, o.pay, o.method]))
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'make-me-pretty-sales-report.csv'
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
          <div className="flex h-40 items-end gap-2.5">
            {days.map((day, index) => (
              <div key={day.label} className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{ height: `${(day.amount / max) * 100}%`, minHeight: 6, background: index === days.length - 1 ? 'var(--color-rose)' : 'var(--color-pink)' }}
                  title={`${day.label}: ${money(day.amount)}`}
                />
                <div className="mt-1.5 text-[11px] text-ink-soft">{day.label}</div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[12.5px] text-ink-soft">{delivered} of {orders.length} orders delivered.</p>
        <button type="button" onClick={downloadReport} className={`${roseButton} mt-4`}>Download sales report (CSV)</button>
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
