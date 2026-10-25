import { useEffect, useRef, useState } from 'react'
import { apiRequest, loadAuthSession, uploadImage } from '../../api.js'

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTOS = 3
const MAX_PHOTO_BYTES = 3 * 1024 * 1024 // 3 MB (the server enforces the same limit)

const errorInput = '!border-rose-deep !shadow-[0_0_0_3px_rgba(190,90,110,.12)]'

function FieldError({ id, message }) {
    if (!message) return null
    return <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-left text-xs text-rose-deep"><span aria-hidden="true">✿</span>{message}</p>
}

export default function ProductReviewForm({ product, onSubmit, autoOpen = false }) {
    const [open, setOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [name, setName] = useState('')
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [errors, setErrors] = useState({})
    const [photos, setPhotos] = useState([]) // up to 3 of { file, preview }
    const [submitting, setSubmitting] = useState(false)
    const photoInput = useRef(null)

    // Free the preview pictures from memory when the form is left.
    const photosRef = useRef([])
    photosRef.current = photos
      // Coming from Order History (?review=1): scroll to this section and open the form.
    useEffect(() => {
      if (!autoOpen) return undefined
      const timer = window.setTimeout(() => {
          document.getElementById('write-review')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setOpen(true)
      }, 350)
      return () => window.clearTimeout(timer)
    }, [autoOpen])
    useEffect(() => () => photosRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), [])

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
        photos.forEach((item) => URL.revokeObjectURL(item.preview))
        setPhotos([])
        setSubmitting(false)
        setErrors({})
    }

    function choosePhotos(event) {
        const chosen = Array.from(event.target.files || [])
        event.target.value = '' // lets the same file be chosen again later
        if (!chosen.length) return
        const room = MAX_PHOTOS - photos.length
        const added = []
        let problem = chosen.length > room ? `You can add up to ${MAX_PHOTOS} photos.` : ''
        for (const file of chosen.slice(0, room)) {
            if (!PHOTO_TYPES.includes(file.type)) problem = 'Please choose JPG, PNG or WEBP photos only.'
            else if (file.size > MAX_PHOTO_BYTES) problem = 'Each photo must be smaller than 3 MB.'
            else added.push({ file, preview: URL.createObjectURL(file) })
        }
        if (added.length) setPhotos((current) => [...current, ...added])
        setErrors((current) => ({ ...current, photo: problem }))
    }

    function removePhoto(index) {
        URL.revokeObjectURL(photos[index].preview)
        setPhotos((current) => current.filter((_, position) => position !== index))
        clearError('photo')
    }

    function clearError(field) {
        if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }))
    }

    function validate() {
        const next = {}
        if (!rating) next.rating = 'Please choose a star rating.'
        if (!text.trim()) next.text = 'Please write your review.'
        else if (text.trim().length < 10) next.text = 'Please write at least 10 characters.'
        setErrors(next)
        return next
    }

    async function handleSubmit(event) {
        event.preventDefault()
        const next = validate()
        if (Object.keys(next).length) {
            if (next.name) document.getElementById('pr-name')?.focus()
            else if (next.text) document.getElementById('pr-text')?.focus()
            return
        }
        const session = loadAuthSession()
        if (!session?.token) { setErrors({ server: 'Sign in to submit a review.' }); return }
        setSubmitting(true)
        try {
            // 1) upload each photo (if any), 2) save the review with the photos' addresses
            const images = []
            for (const item of photos) images.push(await uploadImage(item.file, 'review-images'))
            await apiRequest(`/products/${product.id}/reviews`, { method: 'POST', body: JSON.stringify({ rating, title: title.trim(), text: text.trim(), ...(images.length ? { images } : {}) }) })
            onSubmit?.({ name: session.user?.name || name.trim(), title: title.trim(), text: text.trim(), rating, images, pending: true })
            setSubmitted(true)
        } catch (problem) { setErrors({ server: problem.message }) }
        finally { setSubmitting(false) }
    }

    return <>
        <div id="write-review" className="mt-8 flex scroll-mt-28 justify-center">
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
                        <label htmlFor="pr-name" className="field-label">Your account name</label>
                        <input id="pr-name" value={loadAuthSession()?.user?.name || ''} readOnly aria-describedby="pr-account-hint" autoComplete="name" placeholder="Sign in to review" className="bg-white!" />
                        <span id="pr-account-hint" className="text-xs text-ink-soft">Reviews are submitted under your signed-in account.</span>
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
                    <div>
                        <span className="field-label" id="pr-photo-label">Add photos (optional, up to {MAX_PHOTOS})</span>
                        <input ref={photoInput} id="pr-photo" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={choosePhotos} className="sr-only" aria-labelledby="pr-photo-label" />
                        {photos.length > 0 && <ul className="mb-3 flex flex-wrap gap-3">
                            {photos.map((item, index) => <li key={item.preview} className="relative">
                                <img src={item.preview} alt={`Your chosen photo ${index + 1}`} className="size-20 rounded-xl border border-line object-cover" />
                                <button type="button" onClick={() => removePhoto(index)} aria-label={`Remove photo ${index + 1}`} className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-sm text-white shadow">×</button>
                            </li>)}
                        </ul>}
                        {photos.length < MAX_PHOTOS && <button type="button" onClick={() => photoInput.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-line bg-white px-4 py-4 text-sm text-ink-soft transition hover:border-rose hover:text-rose">
                            <span aria-hidden="true" className="text-lg">+</span> {photos.length ? 'Add another photo' : 'Add photos'} <span className="text-xs">(JPG, PNG or WEBP, up to 3 MB each · {photos.length}/{MAX_PHOTOS})</span>
                        </button>}
                        <FieldError id="pr-photo-error" message={errors.photo} />
                    </div>
                    {errors.server && <p role="alert" className="text-sm text-lowstock-text">{errors.server}{errors.server.includes('Sign in') && <> <a href="/account" className="underline">Sign in</a></>}</p>}
                    <button type="submit" disabled={submitting} className="w-full rounded-full bg-rose px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-deep disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit review'}</button>
                </form>}
            </section>
        </div>}
    </>
}
