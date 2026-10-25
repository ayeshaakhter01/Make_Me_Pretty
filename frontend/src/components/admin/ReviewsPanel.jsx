import { useCallback, useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { card, cx } from './adminHelpers.js'
import { apiRequest, assetUrl } from '../../api.js'
import { getReviewPhotos } from '../products/reviewPhotos.js'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']
const TONE = { Approved: 'bg-gold-soft text-gold', Pending: 'bg-pink text-rose-deep', Rejected: 'bg-lowstock-bg text-lowstock-text' }

/* REVIEWS: approve, reject or delete what customers wrote, and see the photo they attached.
   A review keeps its photo in `review.image` (empty = no photo).
   Once customers can send reviews from the shop, their photo arrives in that same field. */
const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)
const formatReview = (review) => ({ ...review, id: review._id, name: review.customerName, product: typeof review.product === 'string' ? review.product : review.product?.name || 'Product', status: titleCase(review.status) })

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [zoomed, setZoomed] = useState(null) // the review whose photo is open full size

  const refreshReviews = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiRequest('/admin/reviews')
      setReviews(result.map(formatReview))
      setError('')
    } catch (problem) {
      setError(problem.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    apiRequest('/admin/reviews')
      .then((result) => { if (!cancelled) { setReviews(result.map(formatReview)); setError('') } })
      .catch((problem) => { if (!cancelled) setError(problem.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const visible = reviews.filter((r) => {
    if (filter === 'All') return true
    return r.status === filter
  })

  async function setStatus(id, status) {
    try {
      const result = await apiRequest(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status: status.toLowerCase() }) })
      setReviews((current) => current.map((review) => review.id === id ? formatReview({ ...result, product: review.product }) : review))
      setError('')
    } catch (problem) { setError(problem.message) }
  }
  async function remove(id) {
    try { await apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }); setReviews((current) => current.filter((review) => review.id !== id)); setError('') }
    catch (problem) { setError(problem.message) }
  }

  return (
    <div>
      {error && <p role="alert" className="mb-4 text-sm text-lowstock-text">{error}</p>}
      {loading && <p className={`${card} mb-4 p-5 text-sm text-ink-soft`}>Loading reviews from database…</p>}
      {!loading && reviews.some((review) => review.isDemo) && <p className="mb-4 text-xs text-ink-soft">Preview entries are generated examples, separate from customer-submitted reviews.</p>}
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <button type="button" onClick={refreshReviews} disabled={loading} className="ml-auto rounded-full border-[1.5px] border-line bg-cream px-4 py-2 text-[13px] text-ink-soft transition hover:border-rose hover:text-rose disabled:opacity-60">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-3">
        {!loading && visible.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No reviews in this filter.</p>}
        {visible.map((review) => (
          <div key={review.id} className={`${card} flex gap-4 p-5`}>
            {getReviewPhotos(review).length > 0 && (
              <button type="button" onClick={() => setZoomed(review)} aria-label={`Open the photo from ${review.name}`} className="relative size-20 flex-shrink-0 overflow-hidden rounded-xl border border-line transition-transform hover:scale-[1.03]">
                <img src={assetUrl(getReviewPhotos(review)[0])} alt={`Photo from ${review.name}`} className="size-full object-cover" />
                {getReviewPhotos(review).length > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-ink/75 px-1.5 text-[10px] text-white">+{getReviewPhotos(review).length - 1}</span>}
              </button>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="font-semibold">{review.name}</div>
                <div className="text-gold" aria-label={`${review.rating} out of 5`}>{'★'.repeat(review.rating)}<span className="text-line">{'★'.repeat(5 - review.rating)}</span></div>
                <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium', TONE[review.status])}>{review.status}</span>
                <div className="ml-auto text-xs text-ink-soft">{review.product}</div>
              </div>
              {review.title && <p className="mt-2 font-medium">{review.title}</p>}
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
          <div className="grid gap-3">
            {getReviewPhotos(zoomed).map((src, index) => <img key={src} src={assetUrl(src)} alt={`Photo ${index + 1} from ${zoomed.name}`} className="max-h-[60vh] w-full rounded-xl object-contain" />)}
          </div>
          <p className="mt-3 text-sm text-ink-soft">{zoomed.text}</p>
        </Modal>
      )}
    </div>
  )
}
