import { useState } from 'react'
import Modal from './Modal.jsx'
import { card, cx } from './adminHelpers.js'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']
const TONE = { Approved: 'bg-gold-soft text-gold', Pending: 'bg-pink text-rose-deep', Rejected: 'bg-lowstock-bg text-lowstock-text' }

/* REVIEWS: approve, reject or delete what customers wrote, and see the photo they attached.
   A review keeps its photo in `review.image` (empty = no photo).
   Once customers can send reviews from the shop, their photo arrives in that same field. */
export default function ReviewsPanel({ reviews, setReviews }) {
  const [filter, setFilter] = useState('All')
  const [zoomed, setZoomed] = useState(null) // the review whose photo is open full size

  const visible = reviews.filter((r) => {
    if (filter === 'All') return true
    return r.status === filter
  })

  const update = (id, changes) => setReviews((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)))
  const setStatus = (id, status) => update(id, { status })
  const remove = (id) => setReviews((current) => current.filter((r) => r.id !== id))

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
            {name}
          </button>
        ))}
      </div>

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
