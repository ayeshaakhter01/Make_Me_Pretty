import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { assetUrl } from '../../api.js'
import { getReviewPhotos } from './reviewPhotos.js'

/* A small review photo. Click it to see it big; click anywhere or press Escape to close.
   Give it a size with className, for example className="size-24". */
export default function ReviewPhoto({ src, alt = 'Photo from a customer review', className = '' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!src) return null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="View review photo" className={`block overflow-hidden rounded-xl border border-line ${className}`}>
        <img src={assetUrl(src)} alt={alt} loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-105" />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[210] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close photo" className="absolute -right-2 -top-2 z-10 grid size-9 place-items-center rounded-full bg-ink text-lg text-white shadow-lg">×</button>
            <img src={assetUrl(src)} alt={alt} className="max-h-[85vh] max-w-[92vw] rounded-2xl bg-white object-contain shadow-2xl" />
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

/* A row of up to 3 review photos. Example: <ReviewPhotos review={review} name="Aisha" className="mb-3" /> */
export function ReviewPhotos({ review, name = 'a customer', className = '', size = 'size-24' }) {
  const photos = getReviewPhotos(review)
  if (!photos.length) return null
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {photos.map((src, index) => <ReviewPhoto key={src} src={src} alt={`Photo ${index + 1} from ${name}`} className={size} />)}
    </div>
  )
}
