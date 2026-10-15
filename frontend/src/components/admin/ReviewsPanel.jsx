import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { compressImage } from './imageHelpers.js'
import { card, cx } from './adminHelpers.js'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'With photos']
const TONE = { Approved: 'bg-gold-soft text-gold', Pending: 'bg-pink text-rose-deep', Rejected: 'bg-lowstock-bg text-lowstock-text' }

/* REVIEWS: approve, reject or delete what customers wrote, and see the photo they attached.
   A review keeps its photo in `review.image` (empty = no photo).
   Once customers can send reviews from the shop, their photo arrives in that same field. */
export default function ReviewsPanel({ reviews, setReviews }) {
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const [zoomed, setZoomed] = useState(null) // the review whose photo is open full size
  const fileInput = useRef(null)
  const photoFor = useRef(null) // which review the file picker was opened for

  const withPhotos = reviews.filter((r) => r.image).length
  const visible = reviews.filter((r) => {
    if (filter === 'All') return true
    if (filter === 'With photos') return Boolean(r.image)
    return r.status === filter
  })

  const update = (id, changes) => setReviews((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)))
  const setStatus = (id, status) => update(id, { status })
  const remove = (id) => setReviews((current) => current.filter((r) => r.id !== id))

  function choosePhoto(id) {
    photoFor.current = id
    fileInput.current?.click()
  }

  async function photoPicked(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !photoFor.current) return
    setError('')
    try {
      update(photoFor.current, { image: await compressImage(file, { maxSide: 480, quality: 0.72 }) })
    } catch (problem) {
      setError(problem.message)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setFilter(name)}
            className={cx('rounded-full border-[1.5px] px-4 py-2 text-[13px] transition-all', filter === name ? 'border-ink bg-ink text-ivory' : 'border-line bg-cream text-ink-soft hover:border-rose hover:text-rose')}
          >
            {name === 'With photos' ? `With photos · ${withPhotos}` : name}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 rounded-xl bg-lowstock-bg px-4 py-2.5 text-[13px] text-lowstock-text">{error}</p>}
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={photoPicked} />

      <div className="grid gap-3">
        {visible.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No reviews here.</p>}
        {visible.map((review) => (
          <div key={review.id} className={`${card} flex gap-4 p-5`}>
            {review.image && (
              <button type="button" onClick={() => setZoomed(review)} aria-label={`Open the photo from ${review.name}`} className="size-20 flex-shrink-0 overflow-hidden rounded-xl border border-line transition-transform hover:scale-[1.03]">
                <img src={review.image} alt={`Photo from ${review.name}`} className="size-full object-cover" />
              </button>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="font-semibold">{review.name}</div>
                <div className="text-gold" aria-label={`${review.rating} out of 5`}>{'★'.repeat(review.rating)}<span className="text-line">{'★'.repeat(5 - review.rating)}</span></div>
                <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium', TONE[review.status])}>{review.status}</span>
                <div className="ml-auto text-xs text-ink-soft">{review.product}</div>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{review.text}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {review.status !== 'Approved' && <button type="button" onClick={() => setStatus(review.id, 'Approved')} className="text-rose underline">Approve</button>}
                {review.status !== 'Rejected' && <button type="button" onClick={() => setStatus(review.id, 'Rejected')} className="text-ink-soft underline hover:text-rose">Reject</button>}
                <button type="button" onClick={() => choosePhoto(review.id)} className="text-ink-soft underline hover:text-rose">{review.image ? 'Change photo' : 'Add photo'}</button>
                {review.image && <button type="button" onClick={() => update(review.id, { image: '' })} className="text-ink-soft underline hover:text-rose">Remove photo</button>}
                <button type="button" onClick={() => remove(review.id)} className="text-ink-soft underline hover:text-rose">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {zoomed && (
        <Modal title={`${zoomed.name} · ${zoomed.product}`} onClose={() => setZoomed(null)}>
          <img src={zoomed.image} alt={`Photo from ${zoomed.name}`} className="max-h-[70vh] w-full rounded-xl object-contain" />
          <p className="mt-3 text-sm text-ink-soft">{zoomed.text}</p>
        </Modal>
      )}
    </div>
  )
}
