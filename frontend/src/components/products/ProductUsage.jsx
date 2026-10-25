// "How to use" comes from the product's `usage` text in the database (one step per line, or plain sentences).
const toSteps = (text) => {
  const lines = String(text || '').split(/\n+/).map((line) => line.replace(/^\s*(\d+[.)]|[-•])\s*/, '').trim()).filter(Boolean)
  return lines.length > 1 ? lines : String(text || '').split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean)
}

export default function ProductUsage({ product }) {
  const steps = toSteps(product.usage)
  if (!steps.length) return null

  return <section aria-labelledby="product-usage-title" className="border-t border-line pt-5">
    <h2 id="product-usage-title" className="mb-6 font-serif text-[28px] font-normal">How to use</h2>

    <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
      <ol className="list-decimal space-y-3 pl-5 text-[14.5px] leading-relaxed text-ink marker:text-ink-soft">
        {steps.map((step, index) => <li key={index} className="pl-1">{step}</li>)}
      </ol>
    </div>
  </section>
}