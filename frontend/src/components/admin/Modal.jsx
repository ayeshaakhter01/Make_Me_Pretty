import { useEffect } from 'react'

/* A pop-up window over the page. Close with the × button, the dark background or Esc. */
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-ink/40 p-3 backdrop-blur-[2px] sm:p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-[22px] border border-line bg-ivory p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6 ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h3 className="font-serif text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-ink-soft hover:text-rose"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}