import { useState } from 'react'
import { card, cx, ghostButton, roseButton } from './adminHelpers.js'

/* BANNERS: the promo messages shown on the shop. Add, switch on/off, delete.
   (Picture upload needs the backend, so here a banner is just text + a link.) */
export default function BannersManager({ banners, setBanners }) {
  const [form, setForm] = useState({ title: '', text: '', link: '/offers' })
  const [error, setError] = useState('')
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  function add(event) {
    event.preventDefault()
    if (!form.title.trim()) return setError('Please enter a banner title.')
    setBanners((current) => [{ id: `b-${Date.now()}`, ...form, title: form.title.trim(), active: true }, ...current])
    setForm({ title: '', text: '', link: '/offers' })
    setError('')
  }

  const toggle = (id) => setBanners((current) => current.map((b) => (b.id === id ? { ...b, active: !b.active } : b)))
  const remove = (id) => setBanners((current) => current.filter((b) => b.id !== id))

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-3">
        {banners.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No banners yet.</p>}
        {banners.map((banner) => (
          <div key={banner.id} className={cx(`${card} flex flex-wrap items-center gap-4 p-5`, !banner.active && 'opacity-60')}>
            <div className="min-w-0 flex-1">
              <div className="font-serif text-lg leading-tight">{banner.title}</div>
              <div className="text-sm text-ink-soft">{banner.text || '—'}</div>
              <div className="mt-1 text-xs text-rose">Links to {banner.link}</div>
            </div>
            <button type="button" onClick={() => toggle(banner.id)} className={cx('rounded-full px-3 py-1 text-[11px] font-medium', banner.active ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>
              {banner.active ? 'Showing' : 'Hidden'}
            </button>
            <button type="button" onClick={() => remove(banner.id)} className="text-xs text-ink-soft underline hover:text-rose">Delete</button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className={`grid content-start gap-3 p-5 ${card}`}>
        <h3 className="font-serif text-lg">New banner</h3>
        <input value={form.title} onChange={set('title')} placeholder="Title" />
        <input value={form.text} onChange={set('text')} placeholder="Short text" />
        <select value={form.link} onChange={set('link')}>
          {['/offers', '/shop', '/makeup', '/skincare', '/combo'].map((path) => <option key={path}>{path}</option>)}
        </select>
        {error && <p className="text-[13px] text-lowstock-text">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className={roseButton}>Add banner</button>
          <button type="button" onClick={() => { setForm({ title: '', text: '', link: '/offers' }); setError('') }} className={ghostButton}>Clear</button>
        </div>
      </form>
    </div>
  )
}
