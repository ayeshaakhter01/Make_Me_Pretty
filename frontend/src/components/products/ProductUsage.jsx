import { getUsageGuide } from '../../data/usageGuides.js'

export default function ProductUsage({ product }) {
  const guide = getUsageGuide(product)

  return <section aria-labelledby="product-usage-title" className="border-t border-line pt-5">
    <h2 id="product-usage-title" className="mb-6 font-serif text-[28px] font-normal">How to use</h2>

    <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6a2f]">Use · {guide.when}</p>
      <ol className="list-decimal space-y-3 pl-5 text-[14.5px] leading-relaxed text-ink marker:text-ink-soft">
        {guide.steps.map((step) => <li key={step.label} className="pl-1">
          <strong className="font-semibold">{step.label}:</strong> {step.text}
        </li>)}
      </ol>

      {guide.tip && <p className="mt-5 rounded-2xl bg-pink-soft px-4 py-3 text-[13.5px] leading-6 text-ink-soft">
        <span className="font-semibold text-rose-deep">Pro tip · </span>{guide.tip}
      </p>}
    </div>
  </section>
}