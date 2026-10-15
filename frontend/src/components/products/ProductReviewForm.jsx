import { useEffect, useState } from 'react'

const errorInput = '!border-rose-deep !shadow-[0_0_0_3px_rgba(190,90,110,.12)]'

function FieldError({ id, message }) {
    if (!message) return null
    return <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-left text-xs text-rose-deep"><span aria-hidden="true">✿</span>{message}</p>
}

export default function ProductReviewForm({ product, onSubmit }) {
    const [open, setOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [name, setName] = useState('')
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (!open) return undefined
        const previousOverflow = document.body.style.overflow
        const onKeyDown = (event) => { if (event.key === 'Escape') close() }
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    function close() {
        setOpen(false)
        setSubmitted(false)
        setRating(0)
        setHover(0)
        setName('')
        setTitle('')
        setText('')
        setErrors({})
    }

    function clearError(field) {
        if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }))
    }

    function validate() {
        const next = {}
        if (!rating) next.rating = 'Please choose a star rating.'
        if (!name.trim()) next.name = 'Please enter your name.'
        if (!text.trim()) next.text = 'Please write your review.'
        else if (text.trim().length < 10) next.text = 'Please write at least 10 characters.'
        setErrors(next)
        return next
    }

    function handleSubmit(event) {
        event.preventDefault()
        const next = validate()
        if (Object.keys(next).length) {
            if (next.name) document.getElementById('pr-name')?.focus()
            else if (next.text) document.getElementById('pr-text')?.focus()
            return
        }
        onSubmit?.({ name: name.trim(), title: title.trim(), text: text.trim(), rating, pending: true })
        setSubmitted(true)
    }

    return <>
        <div className="mt-8 flex justify-center">
        <button type="button" onClick={() => setOpen(true)} className="group inline-flex w-full max-w-155 items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,48,44,.18)]">Write a review <span className="transition-transform group-hover:translate-x-1">→</span></button>
        </div>
        {open && <div className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-lg" onClick={close}>
            <section role="dialog" aria-modal="true" aria-labelledby="write-review-title" onClick={(event) => event.stopPropagation()} className="relative my-6 max-h-[92vh] w-[min(94vw,620px)] overflow-y-auto rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:p-9">
                <button type="button" onClick={close} aria-label="Close form" className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-ink/60 text-lg text-white transition hover:bg-ink">×</button>
                <header className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose">Rate &amp; review</p>
                    <h2 id="write-review-title" className="mt-1.5 font-serif text-[clamp(22px,4vw,28px)] font-normal">{product.name}</h2>
                </header>
                {submitted ? <div role="status" className="mt-6 rounded-2xl bg-pink-soft px-5 py-8 text-center">
                    <p className="text-3xl text-rose" aria-hidden="true">✿</p>
                    <p className="mt-2 font-serif text-lg">Thank you for your review!</p>
                    <p className="mt-1 text-[13.5px] text-ink-soft">Your review is with our team and will appear once it’s approved.</p>
                    <button type="button" onClick={close} className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory">Done</button>
                </div> : <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
                    <div>
                        <span className="field-label" id="rating-label">Your rating <span className="text-rose">*</span></span>
                        <div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1" onMouseLeave={() => setHover(0)}>
                            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => { setRating(value); clearError('rating') }} onMouseEnter={() => setHover(value)} className={`text-3xl transition-transform hover:scale-110 ${value <= (hover || rating) ? 'text-gold' : 'text-line'}`}>★</button>)}
                        </div>
                        <FieldError id="pr-rating-error" message={errors.rating} />
                    </div>
                    <div>
                        <label htmlFor="pr-name" className="field-label">Your name <span className="text-rose">*</span></label>
                        <input id="pr-name" value={name} onChange={(event) => { setName(event.target.value); clearError('name') }} aria-required="true" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'pr-name-error' : undefined} autoComplete="name" placeholder="Ayesha Rahman" className={`bg-white! ${errors.name ? errorInput : ''}`} />
                        <FieldError id="pr-name-error" message={errors.name} />
                    </div>
                    <div>
                        <label htmlFor="pr-title" className="field-label">Review title (optional)</label>
                        <input id="pr-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="Love it!" className="bg-white!" />
                    </div>
                    <div>
                        <label htmlFor="pr-text" className="field-label">Your review <span className="text-rose">*</span></label>
                        <textarea id="pr-text" value={text} onChange={(event) => { setText(event.target.value); clearError('text') }} aria-required="true" aria-invalid={Boolean(errors.text)} aria-describedby={errors.text ? 'pr-text-error' : undefined} rows="4" placeholder="How did it feel on your skin? Would you repurchase?" className={`bg-white! rounded-[18px]! py-3! resize-y ${errors.text ? errorInput : ''}`} />
                        <FieldError id="pr-text-error" message={errors.text} />
                    </div>
                    <button type="submit" className="w-full rounded-full bg-rose px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-deep">Submit review</button>
                </form>}
            </section>
        </div>}
    </>
}