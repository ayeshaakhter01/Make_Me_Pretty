import { getUsageGuide } from '../../data/usageGuides.js'

export default function ProductUsage({ product }) {
  const guide = getUsageGuide(product)
  return <section aria-labelledby="product-usage-title" className="mx-auto max-w-[1200px]">
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="product-usage-title" className="font-serif text-[28px] font-normal">How to use</h2>
      <span className="rounded-full bg-gold-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a6a2f]">{guide.when}</span>
    </div>
    <ol className="grid gap-4 sm:grid-cols-3">
      {guide.steps.map((step, index) => <li key={step} className="rounded-[22px] border border-line bg-cream p-6">
        <span className="grid size-8 place-items-center rounded-full bg-rose text-sm font-semibold text-white">{index + 1}</span>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink">{step}</p>
      </li>)}
    </ol>
    {guide.tip && <p className="mt-4 rounded-2xl bg-pink-soft px-5 py-3.5 text-[13.5px] text-ink-soft"><span className="font-semibold text-rose-deep">Pro tip · </span>{guide.tip}</p>}
  </section>
}