import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { KEYS } from '../admin/adminHelpers.js'
import { INITIAL_COUPONS } from '../../data/adminSeed.js'

/* The store-wide offer. It is not a coupon, so it always shows first. */
const DELIVERY_OFFER = { id: 'delivery', title: 'Free delivery', text: 'On orders over ৳2,000 · Nationwide', label: '✓ Free delivery', to: '/shop' }

/* Reads the coupons saved by the admin "Coupons" tab and keeps only the active ones.
   If nothing is saved yet, it falls back to the starting list. */
function readActiveCoupons() {
  let coupons = INITIAL_COUPONS
  try {
    const saved = localStorage.getItem(KEYS.coupons)
    if (saved) coupons = JSON.parse(saved)
  } catch {
    // storage unavailable: use the starting list
  }
  return Array.isArray(coupons) ? coupons.filter((coupon) => coupon.active && coupon.code) : []
}

/* Turns one admin coupon into the text shown on its card. */
function describe(coupon) {
  if (coupon.type === 'shipping') return { title: 'Free delivery' }
  if (coupon.type === 'fixed') return { title: `৳${Number(coupon.value).toLocaleString('en-BD')} off` }
  return { title: `${coupon.value}% off` }
}

export default function OffersModal({ onClose }) {
  // Read once when the pop-up opens, so it always shows what the admin has right now.
  const [coupons] = useState(readActiveCoupons)

  // Escape closes it, and the page behind stops scrolling while it is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const cards = [
    DELIVERY_OFFER,
    ...coupons.map((coupon) => ({
      id: coupon.code,
      ...describe(coupon),
      text: coupon.note || 'On your order',
      code: coupon.code,
      to: '/shop',
    })),
  ]

  // createPortal draws it directly on <body>, so no other part of the page can hide it.
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onClick={onClose}>
      {/* w-fit: the box is only as wide as its cards. max-h + overflow: it scrolls instead of overflowing the screen. */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="offers-title"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[calc(100dvh-2rem)] w-fit min-w-[260px] max-w-full animate-fadeup overflow-y-auto rounded-3xl border border-line bg-ivory p-5 shadow-2xl sm:max-w-[820px]"
      >
        <div className="flex items-center justify-between gap-6">
          <h2 id="offers-title" className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Current offers</h2>
          <button type="button" onClick={onClose} aria-label="Close offers" className="grid size-8 place-items-center rounded-full text-xl leading-none text-ink-soft transition hover:bg-pink-soft hover:text-ink">×</button>
        </div>

        {/* Cards sit side by side, wrap onto a new row when there is no room, and are centred. */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {cards.map((card) => (
            <article key={card.id} className="w-[210px] max-w-full overflow-hidden rounded-2xl border border-line bg-white text-center">
              <div className="grid h-12 place-items-center bg-gradient-to-br from-[#f8e1e5] to-[#f5ece5] text-[20px] text-rose" aria-hidden="true">✿</div>
              <div className="px-4 pb-4 pt-3">
                <h3 className="font-serif text-[19px] leading-tight">{card.title}</h3>
                <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{card.text}</p>

                {card.code
                  ? <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-rose/60 bg-pink-soft px-3 py-1 text-[11px] text-ink-soft">Use code <strong className="font-mono text-[13px] tracking-wider text-rose-deep">{card.code}</strong></span>
                  : <span className="mt-3 inline-flex rounded-full bg-pink-soft px-4 py-1.5 text-[12px] font-medium text-rose-deep">{card.label}</span>}

                <Link to={card.to} onClick={onClose} className="mx-auto mt-3 flex w-fit rounded-full bg-rose px-6 py-2 text-[13px] font-semibold text-white transition hover:bg-rose-deep">Shop now</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  )
}