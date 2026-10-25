/* "How to use" comes from the product's `usage` text in the database (edited in Admin -> Inventory -> Edit).
   Write one step per line. Two optional lines:  "When: AM & PM"  and  "Tip: ..."  (shown as a label and a tip box).
   A single paragraph is split into steps at each full stop. */
const toSteps = (lines) => {
  if (lines.length > 1) return lines
  return String(lines[0] || '').split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean)
}

export default function ProductUsage({ product }) {
  const lines = String(product.usage || '').split(/\n+/).map((line) => line.replace(/^\s*(\d+[.)]|[-•])\s*/, '').trim()).filter(Boolean)
  const when = lines.find((line) => /^when:/i.test(line))?.replace(/^when:\s*/i, '')
  const tip = lines.find((line) => /^tip:/i.test(line))?.replace(/^tip:\s*/i, '')
  const steps = toSteps(lines.filter((line) => !/^(when|tip):/i.test(line)))
  if (!steps.length) return null

  return <section aria-labelledby="product-usage-title" className="border-t border-line pt-5">
    <h2 id="product-usage-title" className="mb-6 font-serif text-[28px] font-normal">How to use</h2>

    <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
      {when && <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6a2f]">Use · {when}</p>}
      <ol className="list-decimal space-y-3 pl-5 text-[14.5px] leading-relaxed text-ink marker:text-ink-soft">
        {steps.map((step, index) => <li key={index} className="pl-1">{step}</li>)}
      </ol>
      {tip && <p className="mt-5 rounded-2xl bg-pink-soft px-4 py-3 text-[13.5px] leading-6 text-ink-soft">
        <span className="font-semibold text-rose-deep">Pro tip · </span>{tip}
      </p>}
    </div>
  </section>
}
