import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest, loadAuthSession, uploadReviewImage } from '../../api.js'
import { useCatalog } from '../../context/useCatalog.js'
import PageContainer from '../ui/PageContainer.jsx'

export default function ShareYourGlow() {
  const { products, loading: productsLoading } = useCatalog()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fileError, setFileError] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [uploadedImage, setUploadedImage] = useState('')
  const [experience, setExperience] = useState('')
  const [productId, setProductId] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [showProductMatches, setShowProductMatches] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [session, setSession] = useState(() => loadAuthSession())
  const [errors, setErrors] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    const refreshSession = () => setSession(loadAuthSession())
    window.addEventListener('mmp-auth-change', refreshSession)
    return () => window.removeEventListener('mmp-auth-change', refreshSession)
  }, [])

  useEffect(() => {
    if (!preview) return undefined
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => { if (event.key === 'Escape' && !saving) setOpen(false) }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, saving])

  function resetForm() {
    setSubmitted(false)
    setSaving(false)
    setFileError('')
    setFile(null)
    setPreview('')
    setUploadedImage('')
    setExperience('')
    setProductId('')
    setProductQuery('')
    setShowProductMatches(false)
    setRating(0)
    setHover(0)
    setErrors({})
    if (fileRef.current) fileRef.current.value = ''
  }

  function close() {
    if (saving) return
    setOpen(false)
    resetForm()
  }

  function validate() {
    const next = {}
    if (!session?.token) next.auth = 'Sign in to submit your review.'
    if (!selectedProductId) next.product = 'Please choose a product.'
    if (!rating) next.rating = 'Please choose a star rating.'
    if (!experience.trim()) next.experience = 'Please share your experience.'
    else if (experience.trim().length < 10) next.experience = 'Please write at least 10 characters.'
    else if (experience.trim().length > 1000) next.experience = 'Please keep your review under 1000 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    setErrors({})
    try {
      let image = uploadedImage
      if (file && !image) {
        image = await uploadReviewImage(file)
        setUploadedImage(image)
      }
      await apiRequest(`/products/${selectedProductId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, text: experience.trim(), image }),
      })
      setSubmitted(true)
    } catch (problem) {
      setErrors({ server: problem.message || 'Your review could not be submitted. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  function pickFile(event) {
    const picked = event.target.files?.[0]
    if (!picked) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(picked.type) || picked.size > 4 * 1024 * 1024) {
      setFileError(!allowedTypes.includes(picked.type) ? 'Please choose a JPG, PNG, or WEBP image.' : 'Please choose an image under 4 MB.')
      event.target.value = ''
      return
    }
    setFileError('')
    setUploadedImage('')
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  function removeFile() {
    setFile(null)
    setPreview('')
    setUploadedImage('')
    setFileError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const signedInName = session?.user?.name || 'Your account'
  const selectedProductId = productId
  const matchingProducts = productQuery.trim()
    ? products
      .filter((product) => product.name.toLowerCase().includes(productQuery.trim().toLowerCase()))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(productQuery.trim().toLowerCase())) - Number(a.name.toLowerCase().startsWith(productQuery.trim().toLowerCase())))
      .slice(0, 8)
    : []

  return <>
    <PageContainer className="max-w-180 pb-20 pt-6">
      <div className="share-glow-frame">
        <div className="relative overflow-hidden rounded-[28px] bg-white/80 px-6 py-9 text-center backdrop-blur-md sm:px-10 sm:py-11">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {['10%', '84%', '26%', '70%'].map((left, index) => <span key={left} className="absolute animate-floaty text-xl text-rose/25 sm:text-2xl" style={{ left, top: `${12 + index * 27 % 66}%`, animationDelay: `${index * .8}s`, animationDuration: `${5 + index}s` }}>✿</span>)}
          </div>
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose">We’d love to hear from you</p>
            <h2 className="mt-2 font-serif text-[clamp(26px,4.4vw,34px)] font-normal">Share Your Experience</h2>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">Tell the community about a product you love. Reviews appear after our team approves them.</p>
            <button type="button" onClick={() => { resetForm(); setSession(loadAuthSession()); setOpen(true) }} className="group mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,48,44,.18)]">Share Your Experience <span className="transition-transform group-hover:translate-x-1">→</span></button>
          </div>
        </div>
      </div>
    </PageContainer>
    {open && <div className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-lg" onClick={close}>
      <section role="dialog" aria-modal="true" aria-labelledby="experience-title" onClick={(event) => event.stopPropagation()} className="relative my-6 max-h-[92vh] w-[min(94vw,620px)] overflow-y-auto rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:p-9">
        <button type="button" onClick={close} disabled={saving} aria-label="Close form" className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-ink/60 text-lg text-white transition hover:bg-ink disabled:opacity-50">×</button>
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose">We’d love to hear from you</p>
          <h2 id="experience-title" className="mt-1.5 font-serif text-[clamp(24px,4vw,30px)] font-normal">Share Your Experience</h2>
        </header>
        {submitted ? <div role="status" className="mt-6 rounded-2xl bg-pink-soft px-5 py-8 text-center">
          <p className="text-3xl">💗</p><p className="mt-2 font-serif text-lg">Thank you for sharing!</p>
          <p className="mt-1 text-[13.5px] text-ink-soft">Your review was sent to our team and will appear after it’s approved.</p>
          <button type="button" onClick={close} className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory">Done</button>
        </div> : !session?.token ? <div className="mt-6 rounded-2xl bg-pink-soft px-5 py-7 text-center">
          <p className="text-sm text-ink-soft">Please sign in to share a product review. It will be submitted under your account.</p>
          <Link to="/account" onClick={close} className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory">Sign in</Link>
        </div> : <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
          <div>
            <label htmlFor="review-product" className="field-label">Product name <span className="text-rose">*</span></label>
            <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setShowProductMatches(false) }}>
              <input
                id="review-product"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showProductMatches && !selectedProductId}
                aria-controls="review-product-matches"
                aria-invalid={Boolean(errors.product)}
                aria-describedby={errors.product ? 'review-product-error' : undefined}
                value={productQuery}
                onFocus={() => { if (productQuery.trim() && !selectedProductId) setShowProductMatches(true) }}
                onChange={(event) => {
                  setProductQuery(event.target.value)
                  setProductId('')
                  setShowProductMatches(true)
                  setErrors((current) => ({ ...current, product: '' }))
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && showProductMatches && matchingProducts.length) {
                    event.preventDefault()
                    const product = matchingProducts[0]
                    setProductId(product.id)
                    setProductQuery(product.name)
                    setShowProductMatches(false)
                  }
                }}
                disabled={productsLoading || products.length === 0}
                autoComplete="off"
                placeholder={productsLoading ? 'Loading products…' : 'Start typing a product name'}
                className="bg-white!"
              />
              {showProductMatches && !selectedProductId && productQuery.trim() && <ul id="review-product-matches" role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-line bg-white py-1 shadow-[0_14px_36px_rgba(59,48,44,.16)]">
                {matchingProducts.length ? matchingProducts.map((product) => <li key={product.id} role="presentation">
                  <button type="button" role="option" aria-selected="false" onMouseDown={(event) => event.preventDefault()} onClick={() => {
                    setProductId(product.id)
                    setProductQuery(product.name)
                    setShowProductMatches(false)
                    setErrors((current) => ({ ...current, product: '' }))
                  }} className="w-full px-4 py-2.5 text-left text-sm text-ink transition hover:bg-pink-soft">{product.name}</button>
                </li>) : <li role="option" aria-selected="false" className="px-4 py-3 text-sm text-ink-soft">No matching products found.</li>}
              </ul>}
            </div>
            {errors.product && <p id="review-product-error" role="alert" className="mt-1.5 text-xs text-rose-deep">{errors.product}</p>}
            {errors.product && <p role="alert" className="mt-1.5 text-xs text-rose-deep">{errors.product}</p>}
          </div>
          <div>
            <span className="field-label" id="experience-rating-label">Your rating <span className="text-rose">*</span></span>
            <div role="radiogroup" aria-labelledby="experience-rating-label" className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => { setRating(value); setErrors((current) => ({ ...current, rating: '' })) }} onMouseEnter={() => setHover(value)} className={`text-3xl transition-transform hover:scale-110 ${value <= (hover || rating) ? 'text-gold' : 'text-line'}`}>★</button>)}
            </div>
            {errors.rating && <p role="alert" className="mt-1.5 text-xs text-rose-deep">{errors.rating}</p>}
          </div>
          <div>
            <label htmlFor="review-account-name" className="field-label">Your account name</label>
            <input id="review-account-name" value={signedInName} readOnly className="bg-white!" />
            <span className="text-xs text-ink-soft">Your review is submitted under your signed-in account.</span>
          </div>
          <div>
            <label htmlFor="review-experience" className="field-label">Your experience <span className="text-rose">*</span></label>
            <textarea id="review-experience" value={experience} onChange={(event) => { setExperience(event.target.value); setErrors((current) => ({ ...current, experience: '' })) }} maxLength={1000} aria-required="true" aria-invalid={Boolean(errors.experience)} rows="4" placeholder="What did you love? How did your skin feel?" className={`bg-white! rounded-[18px]! py-3! resize-y ${errors.experience ? 'border-rose-deep! shadow-[0_0_0_3px_rgba(190,90,110,.12)]!' : ''}`} />
            {errors.experience && <p role="alert" className="mt-1.5 text-xs text-rose-deep">{errors.experience}</p>}
          </div>
          <div>
            <span className="field-label">Photo (optional)</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} aria-label={file ? `Replace ${file.name}` : 'Add a photo'} className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-white text-xl text-ink-soft transition hover:border-rose ${file ? 'border-rose/40' : 'border-line'}`}>
                {preview ? <img src={preview} alt="Selected review photo" className="size-full object-cover" /> : '+'}
              </button>
              <div className="text-[12px] leading-relaxed text-ink-soft">JPG, PNG or WEBP · up to 4 MB.{file && <button type="button" onClick={removeFile} className="mt-1 block text-rose underline">Remove {file.name.length > 22 ? `${file.name.slice(0, 22)}…` : file.name}</button>}</div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="hidden" />
            </div>
            {fileError && <p role="alert" className="mt-2 text-xs text-rose-deep">{fileError}</p>}
          </div>
          {errors.auth && <p role="alert" className="text-sm text-lowstock-text">{errors.auth} <Link to="/account" className="underline">Sign in</Link></p>}
          {errors.server && <p role="alert" className="text-sm text-lowstock-text">{errors.server}</p>}
          <button type="submit" disabled={saving || Boolean(fileError) || productsLoading || products.length === 0} className="w-full rounded-full bg-rose px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Submitting…' : 'Submit my review'}</button>
        </form>}
      </section>
    </div>}
  </>
}
