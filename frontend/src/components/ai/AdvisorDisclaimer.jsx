export default function AdvisorDisclaimer({ className = '' }) {
  return (
    <div role="note" className={`flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft/60 px-4 py-3.5 text-[#7a5d28] ${className}`}>
      <svg viewBox="0 0 24 24" className="mt-0.5 size-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <circle cx="12" cy="7.8" r=".6" fill="currentColor" />
      </svg>
      <p className="text-[12.5px] leading-5">
        <strong className="font-semibold">Good to know:</strong> these suggestions are general skincare advice, not medical advice. If you have a painful, persistent or worsening skin condition, please see a doctor or dermatologist.
      </p>
    </div>
  )
}
