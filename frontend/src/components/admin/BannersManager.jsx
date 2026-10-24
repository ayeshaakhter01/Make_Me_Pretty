import { useEffect, useState } from 'react'
import SiteLookPanel from './SiteLookPanel.jsx'
import { card, cx, ghostButton, roseButton } from './adminHelpers.js'
import { apiRequest, assetUrl, uploadImage } from '../../api.js'


/* BANNERS TAB
   1) Shop look: the menu logo and the page header picture (see SiteLookPanel).
   2) Homepage hero slides: the big carousel at the top of the home page.
      Add a slide with a picture, hide or show a slide (the hero video is one of the slides), delete. */
const EMPTY_FORM = { title: '', subtitle: '', href: '/shop', src: '' }

export default function BannersManager({ slides, setSlides, logo, setLogo }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  useEffect(() => {
    let cancelled = false
    apiRequest('/banners/admin/all')
      .then((data) => {
        if (cancelled) return
        setSlides(data.map((slide) => ({ ...slide, id: slide._id })))
        setError('')
      })
      .catch((problem) => {
        if (cancelled) return
        setSlides([])
        setError(problem.message)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [setSlides])

  async function add(event) {
    event.preventDefault()
    if (!selectedFile && !form.src.trim()) return setError('Choose an image from your device.')
    setSaving(true)
    try {
      const src = selectedFile ? await uploadImage(selectedFile) : form.src.trim()
      const payload = { type: 'image', ...form, title: form.title.trim(), subtitle: form.subtitle.trim(), src, href: form.href, placement: 'hero', pagePath: '', active: true, order: slides.filter((slide) => slide.placement !== 'pageHeader').length }
      const data = await apiRequest('/banners', { method: 'POST', body: JSON.stringify(payload) })
      setSlides((current) => [...current, { ...data, id: data._id }])
      setForm(EMPTY_FORM)
      setSelectedFile(null)
      setError('')
    } catch (problem) { setError(problem.message) } finally { setSaving(false) }
  }

  async function toggle(slide) {
    try {
      const data = await apiRequest(`/banners/${slide.id}`, { method: 'PATCH', body: JSON.stringify({ active: !slide.active }) })
      setSlides((current) => current.map((s) => (s.id === slide.id ? { ...data, id: data._id } : s)))
      setError('')
    } catch (problem) { setError(problem.message) }
  }
  async function remove(slide) {
    try {
      await apiRequest(`/banners/${slide.id}`, { method: 'DELETE' })
      setSlides((current) => current.filter((s) => s.id !== slide.id))
      setError('')
    } catch (problem) { setError(problem.message) }
  }
  const heroSlides = slides.filter((slide) => slide.placement !== 'pageHeader')
  const showing = heroSlides.filter((slide) => slide.active).length

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="mb-3 font-serif text-xl">Shop look</h2>
        <SiteLookPanel logo={logo} setLogo={setLogo} headerBanners={slides.filter((slide) => slide.placement === 'pageHeader')} onHeaderChange={setSlides} />
      </section>

      <section>
        <h2 className="font-serif text-xl">Homepage hero slides</h2>
        <p className="mb-3 mt-1 text-sm text-ink-soft">
          These slides play in the big carousel at the top of the home page. Hide a slide to turn it off. The hero video is one of the slides, so hide it to switch the video off.
          {showing === 0 && ' Right now every slide is hidden, so the home page shows no hero.'}
        </p>
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid content-start gap-3">
            {loading && <p className={`${card} p-6 text-sm text-ink-soft`}>Loading banners from database…</p>}
            {!loading && heroSlides.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No slides in the database yet.</p>}
          {heroSlides.map((slide) => {
              const isVideo = slide.type === 'video'
              return (
                <div key={slide.id} className={cx(`${card} flex flex-wrap items-center gap-4 p-5`, !slide.active && 'opacity-60')}>
                  {isVideo
                    ? <div className="grid h-16 w-28 shrink-0 place-items-center rounded-xl bg-ink text-xs text-ivory">▶ Video</div>
                    : <img src={assetUrl(slide.src)} alt="" className="h-16 w-28 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-lg leading-tight">{slide.title || (isVideo ? 'Hero video' : 'Untitled slide')}</div>
                    <div className="text-sm text-ink-soft">{slide.subtitle || '—'}</div>
                    <div className="mt-1 text-xs text-rose">Links to {slide.href}</div>
                  </div>
                  <button type="button" onClick={() => toggle(slide)} aria-pressed={slide.active} className={cx('rounded-full px-3 py-1 text-[11px] font-medium', slide.active ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>
                    {isVideo ? (slide.active ? 'Video on' : 'Video off') : (slide.active ? 'Showing' : 'Hidden')}
                  </button>
                  <button type="button" onClick={() => remove(slide)} className="text-xs text-ink-soft underline hover:text-rose">Delete</button>
                </div>
              )
            })}
          </div>

          <form onSubmit={add} className={`grid min-w-0 content-start gap-3 overflow-hidden p-5 ${card}`}>
            <h3 className="font-serif text-lg">New slide</h3>
            <input className="!w-full !min-w-0 box-border" value={form.title} onChange={set('title')} placeholder="Title (optional)" />
            <input className="!w-full !min-w-0 box-border" value={form.subtitle} onChange={set('subtitle')} placeholder="Short text (optional)" />
            <select className="!w-full !min-w-0 box-border" value={form.href} onChange={set('href')}>
              {['/shop', '/offers', '/makeup', '/skincare', '/combo'].map((path) => <option key={path}>{path}</option>)}
            </select>
            <label className="grid gap-1 text-[12.5px] text-ink-soft">
              Choose a slide image from your device
              <input className="!w-full !min-w-0 box-border overflow-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            </label>
            {selectedFile && <p className="text-xs text-ink-soft">Selected: {selectedFile.name}</p>}
            {error && <p className="text-[13px] text-lowstock-text">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving || loading} className={roseButton}>{saving ? 'Saving…' : 'Add slide'}</button>
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setSelectedFile(null); setError('') }} className={ghostButton}>Clear</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
