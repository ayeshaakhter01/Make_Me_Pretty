/* One KPI box at the top of the dashboard (label + big number). */
export default function StatCard({ label, value, accent = 'var(--color-ink)' }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4 sm:p-5">
      <div className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{label}</div>
      <div className="mt-1.5 font-serif text-[22px] sm:text-[28px]" style={{ color: accent }}>{value}</div>
    </div>
  )
}
