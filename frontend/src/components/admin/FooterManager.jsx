import { useState } from 'react'
import ImageField from './ImageField.jsx'
import { SEED_FOOTER } from '../../data/siteContent.js'
import { SOCIAL_ICONS } from '../layout/socialIcons.jsx'
import { card, cx, ghostButton, roseButton } from './adminHelpers.js'
import { assetUrl } from '../../api.js'

/* FOOTER TAB
   Edits the shop's footer: Help links, social media and payment logos, plus the About and Contact pages.
   Policies are managed by PolicyManager (their own "policies" collection); the footer's Customer Policy
   column is built from them automatically. Footer, About, and Contact settings are saved by AdminDashboard. */
const KNOWN_PAGES = ['/p/contact', '/p/about-us']

/* a list of links: change the label or address, remove one, add one */
function LinkListEditor({ title, hint, links, onChange }) {
  const [draft, setDraft] = useState({ label: '', href: '' })
  const [error, setError] = useState('')

  const edit = (id, field) => (event) => onChange(links.map((link) => (link.id === id ? { ...link, [field]: event.target.value } : link)))
  const remove = (id) => onChange(links.filter((link) => link.id !== id))

  function add(event) {
    event.preventDefault()
    if (!draft.label.trim() || !draft.href.trim()) return setError('Please fill in both the name and the link.')
    onChange([...links, { id: `l-${Date.now()}`, label: draft.label.trim(), href: draft.href.trim() }])
    setDraft({ label: '', href: '' })
    setError('')
  }

  return (
    <section className={`${card} p-5`}>
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="mb-4 mt-1 text-sm text-ink-soft">{hint}</p>
      <div className="grid gap-2">
        {links.length === 0 && <p className="text-sm text-ink-soft">No links yet.</p>}
        {links.map((link) => (
          <div key={link.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
            <input value={link.label} onChange={edit(link.id, 'label')} aria-label="Link name" />
            <input value={link.href} onChange={edit(link.id, 'href')} list="footer-pages" aria-label="Link address" />
            <button type="button" onClick={() => remove(link.id)} className="text-xs text-ink-soft underline hover:text-rose">Remove</button>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
        <input value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="New link name" />
        <input value={draft.href} onChange={(e) => setDraft((d) => ({ ...d, href: e.target.value }))} list="footer-pages" placeholder="/p/contact or https://…" />
        <button type="submit" className={roseButton}>Add</button>
        {error && <p className="text-[13px] text-lowstock-text sm:col-span-3">{error}</p>}
      </form>
    </section>
  )
}

export default function FooterManager({ footer, setFooter, about, setAbout, contact, setContact }) {
  const [payDraft, setPayDraft] = useState({ label: '', src: '' })
  const [payError, setPayError] = useState('')

  /* change one part of the footer and leave the rest alone */
  const patch = (key, update) => setFooter((current) => ({ ...current, [key]: update(current[key] ?? []) }))

  const editSocial = (name, field) => (event) => patch('socials', (list) => list.map((s) => (s.name === name ? { ...s, [field]: event.target.value } : s)))
  const toggleSocial = (name) => patch('socials', (list) => list.map((s) => (s.name === name ? { ...s, active: !s.active } : s)))
  const editAbout = (id, field) => (event) => setAbout((current) => current.map((section) => section.id === id ? { ...section, [field]: event.target.value } : section))
  const addAbout = () => setAbout((current) => [...current, { id: `about-${Date.now()}`, name: 'New section', text: '', image: '' }])
  const removeAbout = (id) => setAbout((current) => current.filter((section) => section.id !== id))
  const editContact = (field) => (event) => setContact((current) => ({ ...current, [field]: event.target.value }))

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-ink-soft">Manage footer links, payment logos, and the About and Contact pages. Policies are managed in the Policies section.</p>
        <button type="button" className={ghostButton} onClick={() => { if (window.confirm('Put the footer back to how it was at the start?')) setFooter(SEED_FOOTER) }}>
          Restore original footer
        </button>
      </div>

      <datalist id="footer-pages">{KNOWN_PAGES.map((path) => <option key={path} value={path} />)}</datalist>

      <LinkListEditor title="Help links" hint="The “Help” column, for example Contact and About Us." links={footer.helpLinks ?? []} onChange={(next) => patch('helpLinks', () => next)} />

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
              <img src={assetUrl(payment.src)} alt={payment.label} className="h-8 w-auto max-w-[80px] object-contain" />
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

      <section className={`${card} p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg">About page content</h3>
            <p className="mt-1 text-sm text-ink-soft">Edit the title, story text, and photo shown on the About Us page.</p>
          </div>
          <button type="button" onClick={addAbout} className={roseButton}>+ Add section</button>
        </div>
        <div className="mt-4 grid gap-4">
          {(about ?? []).length === 0 && <p className="text-sm text-ink-soft">No About page sections. Add one to show content.</p>}
          {(about ?? []).map((section) => (
            <div key={section.id} className="grid gap-3 rounded-xl border border-line bg-cream p-4">
              <div className="flex items-center justify-between gap-3">
                <label className="grid flex-1 gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Section title
                  <input value={section.name} onChange={editAbout(section.id, 'name')} maxLength={100} placeholder="Founder name or section title" />
                </label>
                <button type="button" onClick={() => removeAbout(section.id)} className="mt-5 text-xs text-ink-soft underline hover:text-rose">Remove</button>
              </div>
              <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Story text
                <textarea value={section.text} onChange={editAbout(section.id, 'text')} maxLength={5000} rows={5} placeholder="Write the About page text…" className="w-full resize-y rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-normal normal-case tracking-normal text-ink outline-none focus:border-rose" />
              </label>
              <div className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Image
                <ImageField images={section.image ? [section.image] : []} onChange={(images) => setAbout((current) => current.map((item) => item.id === section.id ? { ...item, image: images[0] ?? '' } : item))} max={1} maxSide={1200} previewClass="h-28 w-36" fit="cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Contact page content</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">Edit the public text, contact details, and WhatsApp number. Social profile links are managed in the Social media section above.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Page title<input value={contact?.title || ''} onChange={editContact('title')} maxLength={300} /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Subtitle<input value={contact?.subtitle || ''} onChange={editContact('subtitle')} maxLength={1000} /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Intro heading<input value={contact?.introTitle || ''} onChange={editContact('introTitle')} maxLength={300} /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Phone<input value={contact?.phone || ''} onChange={editContact('phone')} maxLength={30} placeholder="01XXXXXXXXX" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">WhatsApp number<input value={contact?.whatsapp || ''} onChange={editContact('whatsapp')} maxLength={30} placeholder="01XXXXXXXXX" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Location<input value={contact?.address || ''} onChange={editContact('address')} maxLength={300} /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted sm:col-span-2">Intro text<textarea value={contact?.introText || ''} onChange={editContact('introText')} maxLength={1000} rows={3} className="w-full resize-y rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-normal normal-case tracking-normal text-ink outline-none focus:border-rose" /></label>
        </div>
      </section>
    </div>
  )
}