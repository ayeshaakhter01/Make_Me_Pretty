import { useState } from 'react'
import ImageField from './ImageField.jsx'
import { SEED_FOOTER } from '../../data/siteContent.js'
import { SOCIAL_ICONS } from '../layout/socialIcons.jsx'
import { card, cx, roseButton } from './adminHelpers.js'

export default function FooterManager({ footer, setFooter }) {
  const [payDraft, setPayDraft] = useState({ label: '', src: '' })
  const [payError, setPayError] = useState('')

  /* change one part of the footer and leave the rest alone */
  const patch = (key, update) => setFooter((current) => ({ ...current, [key]: update(current[key] ?? []) }))

  const editSocial = (name, field) => (event) => patch('socials', (list) => list.map((s) => (s.name === name ? { ...s, [field]: event.target.value } : s)))
  const toggleSocial = (name) => patch('socials', (list) => list.map((s) => (s.name === name ? { ...s, active: !s.active } : s)))

  function addPayment(event) {
    event.preventDefault()
    if (!payDraft.label.trim()) return setPayError('Please type the name, for example Nagad.')
    if (!payDraft.src) return setPayError('Please add the logo picture.')
    patch('payments', (list) => [...list, { id: `pay-${Date.now()}`, label: payDraft.label.trim(), src: payDraft.src }])
    setPayDraft({ label: '', src: '' })
    setPayError('')
  }
  const removePayment = (id) => patch('payments', (list) => list.filter((p) => p.id !== id))

  return (
    <div className="grid gap-6">
      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Social media</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">Paste the full address of each page. Switch a network off to hide its button.</p>
        <div className="grid gap-3">
          {(footer.socials ?? []).map((social) => (
            <div key={social.name} className={cx('grid gap-2 sm:grid-cols-[120px_1fr_auto] sm:items-center', !social.active && 'opacity-60')}>
              <div className="flex items-center gap-2 text-sm">
                <svg viewBox="0 0 24 24" className="size-[18px] text-ink" fill="currentColor" aria-hidden="true">{SOCIAL_ICONS[social.name]}</svg>
                {social.name}
              </div>
              <input value={social.href} onChange={editSocial(social.name, 'href')} placeholder="https://…" aria-label={`${social.name} address`} />
              <button type="button" onClick={() => toggleSocial(social.name)} aria-pressed={social.active} className={cx('rounded-full px-3 py-1 text-[11px] font-medium', social.active ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>
                {social.active ? 'Showing' : 'Hidden'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Payment logos</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">The “Payments accepted” logos. Remove one, or add a new one with its logo picture (a PNG looks best).</p>
        <div className="flex flex-wrap gap-3">
          {(footer.payments ?? []).length === 0 && <p className="text-sm text-ink-soft">No payment logos yet.</p>}
          {(footer.payments ?? []).map((payment) => (
            <div key={payment.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2">
              <img src={payment.src} alt={payment.label} className="h-8 w-auto max-w-[80px] object-contain" />
              <span className="text-sm">{payment.label}</span>
              <button type="button" onClick={() => removePayment(payment.id)} className="text-xs text-ink-soft underline hover:text-rose">Remove</button>
            </div>
          ))}
        </div>
        <form onSubmit={addPayment} className="mt-4 grid gap-3 border-t border-line pt-4 sm:max-w-md">
          <input value={payDraft.label} onChange={(e) => setPayDraft((d) => ({ ...d, label: e.target.value }))} placeholder="Name, for example Nagad" />
          <ImageField
            images={payDraft.src ? [payDraft.src] : []}
            onChange={(list) => setPayDraft((d) => ({ ...d, src: list[0] ?? '' }))}
            max={1}
            maxSide={240}
            format="image/png"
            previewClass="h-14 w-28"
            fit="contain"
          />
          {payError && <p className="text-[13px] text-lowstock-text">{payError}</p>}
          <div><button type="submit" className={roseButton}>Add logo</button></div>
        </form>
      </section>
    </div>
  )
}
