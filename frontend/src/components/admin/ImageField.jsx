import { useRef, useState } from 'react'
import { compressImage } from './imageHelpers.js'
import { cx } from './adminHelpers.js'

/* PHOTO PICKER used by the product form and the blog form.
   images   = list of saved pictures (the first one is the main picture)
   onChange = called with the new list whenever a photo is added, removed or moved first
   max      = how many photos are allowed (1 = a single cover photo that "Change" replaces) */
export default function ImageField({ images, onChange, max = 5, maxSide = 640, quality = 0.75 }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const single = max === 1
  const canAdd = single || images.length < max

  async function pick(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = '' // so picking the same file again still fires
    if (files.length === 0) return

    setError('')
    setBusy(true)
    try {
      const room = single ? 1 : max - images.length
      const added = []
      for (const file of files.slice(0, room)) added.push(await compressImage(file, { maxSide, quality }))
      onChange(single ? added : [...images, ...added])
      if (files.length > room) setError(`Only ${max} photos fit, so the extra ones were skipped.`)
    } catch (problem) {
      setError(problem.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = (index) => onChange(images.filter((_, position) => position !== index))
  const makeMain = (index) => onChange([images[index], ...images.filter((_, position) => position !== index)])

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {images.map((src, index) => (
          <div key={`${index}-${src.slice(-24)}`} className="relative size-20 overflow-hidden rounded-xl border border-line bg-ivory">
            <img src={src} alt={`Photo ${index + 1}`} className="size-full object-cover" />
            {!single && index === 0 && images.length > 1 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-ink/75 px-1.5 py-0.5 text-[9px] font-medium text-ivory">Main</span>
            )}
            {!single && index > 0 && (
              <button type="button" onClick={() => makeMain(index)} className="absolute inset-x-0 bottom-0 bg-ink/65 py-0.5 text-[9px] font-medium text-ivory hover:bg-ink">Set main</button>
            )}
            <button type="button" onClick={() => remove(index)} aria-label={`Remove photo ${index + 1}`} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-white/90 text-[12px] leading-none text-ink-soft hover:text-lowstock-text">×</button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cx('grid size-20 place-items-center rounded-xl border-[1.5px] border-dashed border-line bg-ivory text-center text-[11px] leading-tight text-ink-soft transition-colors hover:border-rose hover:text-rose', busy && 'opacity-60')}
          >
            {busy ? 'Adding…' : single && images.length > 0 ? 'Change' : '+ Add photo'}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={!single} className="hidden" onChange={pick} />
      {error && <p className="mt-2 text-[12.5px] text-lowstock-text">{error}</p>}
    </div>
  )
}
