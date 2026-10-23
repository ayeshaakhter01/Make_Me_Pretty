import { useState } from 'react'
import ImageField from './ImageField.jsx'
import SiteLookPanel from './SiteLookPanel.jsx'
import { card, cx, ghostButton, roseButton } from './adminHelpers.js'

/* BANNERS TAB
   1) Shop look: the menu logo and the page header picture (see SiteLookPanel).
   2) Homepage hero slides: the big carousel at the top of the home page.
      Add a slide with a picture, hide or show a slide (the hero video is one of the slides), delete. */
const EMPTY_FORM = { title: '', subtitle: '', href: '/shop', src: '' }

export default function BannersManager({ slides, setSlides, logo, setLogo, headerImage, setHeaderImage }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  function add(event) {
    event.preventDefault()
    if (!form.src) return setError('Please add a picture for the slide.')
    setSlides((current) => [{ id: `s-${Date.now()}`, type: 'image', ...form, title: form.title.trim(), subtitle: form.subtitle.trim(), active: true }, ...current])
    setForm(EMPTY_FORM)
    setError('')
  }

  const toggle = (id) => setSlides((current) => current.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  const remove = (id) => setSlides((current) => current.filter((s) => s.id !== id))
  const showing = slides.filter((slide) => slide.active).length

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="mb-3 font-serif text-xl">Shop look</h2>
        <SiteLookPanel logo={logo} setLogo={setLogo} headerImage={headerImage} setHeaderImage={setHeaderImage} />
      </section>

      <section>
        <h2 className="font-serif text-xl">Homepage hero slides</h2>
        <p className="mb-3 mt-1 text-sm text-ink-soft">
          These slides play in the big carousel at the top of the home page. Hide a slide to turn it off. The hero video is one of the slides, so hide it to switch the video off.
          {showing === 0 && ' Right now every slide is hidden, so the home page shows no hero.'}
        </p>
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid content-start gap-3">
            {slides.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No slides yet.</p>}
            {slides.map((slide) => {
              const isVideo = slide.type === 'video'
              return (
                <div key={slide.id} className={cx(`${card} flex flex-wrap items-center gap-4 p-5`, !slide.active && 'opacity-60')}>
                  {isVideo
                    ? <div className="grid h-16 w-28 shrink-0 place-items-center rounded-xl bg-ink text-xs text-ivory">▶ Video</div>
                    : <img src={slide.src} alt="" className="h-16 w-28 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-lg leading-tight">{slide.title || (isVideo ? 'Hero video' : 'Untitled slide')}</div>
                    <div className="text-sm text-ink-soft">{slide.subtitle || '—'}</div>
                    <div className="mt-1 text-xs text-rose">Links to {slide.href}</div>
                  </div>
                  <button type="button" onClick={() => toggle(slide.id)} aria-pressed={slide.active} className={cx('rounded-full px-3 py-1 text-[11px] font-medium', slide.active ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>
                    {isVideo ? (slide.active ? 'Video on' : 'Video off') : (slide.active ? 'Showing' : 'Hidden')}
                  </button>
                  <button type="button" onClick={() => remove(slide.id)} className="text-xs text-ink-soft underline hover:text-rose">Delete</button>
                </div>
              )
            })}
          </div>

          <form onSubmit={add} className={`grid content-start gap-3 p-5 ${card}`}>
            <h3 className="font-serif text-lg">New slide</h3>
            <input value={form.title} onChange={set('title')} placeholder="Title (optional)" />
            <input value={form.subtitle} onChange={set('subtitle')} placeholder="Short text (optional)" />
            <select value={form.href} onChange={set('href')}>
              {['/shop', '/offers', '/makeup', '/skincare', '/combo'].map((path) => <option key={path}>{path}</option>)}
            </select>
            <div>
              <div className="mb-2 text-[12.5px] text-ink-soft">Slide picture</div>
              <ImageField
                images={form.src ? [form.src] : []}
                onChange={(list) => setForm((current) => ({ ...current, src: list[0] ?? '' }))}
                max={1}
                maxSide={1600}
                quality={0.72}
                previewClass="h-20 w-36"
              />
            </div>
            {error && <p className="text-[13px] text-lowstock-text">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" className={roseButton}>Add slide</button>
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setError('') }} className={ghostButton}>Clear</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
