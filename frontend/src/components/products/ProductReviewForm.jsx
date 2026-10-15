import { useState } from 'react'

export default function ProductReviewForm({ product, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!rating) { setError('Please choose a star rating.'); return }
    const data = new FormData(event.currentTarget)
    onSubmit?.({
      name: String(data.get('name')).trim(),
      title: String(data.get('title')).trim(),
      text: String(data.get('text')).trim(),
      rating,
      pending: true,
    })
    setError('')
    setDone(true)
  }

  function reset() { setRating(0); setHover(0); setDone(false) }

  return <section aria-labelledby="write-review-title" className="mx-auto mt-10 max-w-[1200px] rounded-[28px] border border-line bg-white/80 p-6 sm:p-9">
    <h3 id="write-review-title" className="font-serif text-[24px] font-normal">Rate &amp; review {product.name}</h3>
    <p className="mt-1 text-[13.5px] text-ink-soft">Reviews appear once our team approves them.</p>
    {done ? <div role="status" className="mt-6 rounded-2xl bg-pink-soft px-5 py-8 text-center">
      <p className="text-3xl">💗</p>
      <p className="mt-2 font-serif text-lg">Thank you for your review!</p>
      <p className="mt-1 text-[13.5px] text-ink-soft">It’s with our team and will appear once approved.</p>
      <button type="button" onClick={reset} className="mt-5 rounded-full border-[1.5px] border-ink px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-ivory">Write another</button>
    </div> : <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <span className="field-label" id="rating-label">Your rating</span>
        <div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => { setRating(value); setError('') }} onMouseEnter={() => setHover(value)} className={`text-3xl transition-transform hover:scale-110 ${value <= (hover || rating) ? 'text-gold' : 'text-line'}`}>★</button>)}
        </div>
        {error && <p role="alert" className="mt-1 text-xs text-rose-deep">{error}</p>}
      </div>
      <div><label htmlFor="pr-name" className="field-label">Your name</label><input id="pr-name" name="name" required autoComplete="name" placeholder="Ayesha Rahman" className="!bg-white"/></div>
      <div><label htmlFor="pr-title" className="field-label">Review title (optional)</label><input id="pr-title" name="title" maxLength={80} placeholder="Love it!" className="!bg-white"/></div>
      <div className="md:col-span-2"><label htmlFor="pr-text" className="field-label">Your review</label><textarea id="pr-text" name="text" required minLength={10} rows="4" placeholder="How did it feel on your skin? Would you repurchase?" className="!bg-white !rounded-[18px] !py-3 resize-y"/></div>
      <div className="md:col-span-2"><button type="submit" className="w-full rounded-full bg-rose px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-deep sm:w-auto sm:px-10">Submit review</button></div>
    </form>}
  </section>
}