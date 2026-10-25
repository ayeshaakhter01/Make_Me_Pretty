import { useEffect, useState } from 'react'
import { apiRequest } from '../api.js'
import { SOCIAL_ICONS } from '../components/layout/socialIcons.jsx'

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '', website: '' }

function whatsappDigits(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('880')) return digits
  return digits.startsWith('0') ? `88${digits}` : `880${digits}`
}

function ContactDetail({ icon, label, value, href }) {
  const content = <div className="group flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-cream text-rose transition-colors group-hover:border-rose group-hover:bg-pink-soft"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon}/></svg></span><span><span className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</span><span className="text-[15px] font-medium text-ink">{value}</span></span></div>
  return href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="block">{content}</a> : content
}

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [contact, setContact] = useState(null)
  const [socials, setSocials] = useState([])
  const [loading, setLoading] = useState(true)
  const [settingsError, setSettingsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = () => apiRequest('/site-settings')
      .then((settings) => {
        if (!cancelled) {
          setContact(settings.contact || null)
          setSocials((settings.footer?.socials || []).filter((social) => social.active && social.href?.trim() && SOCIAL_ICONS[social.name]))
          setSettingsError('')
        }
      })
      .catch(() => { if (!cancelled) setSettingsError('Some store contact details could not be loaded.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    load()
    window.addEventListener('mmp-site-settings-change', load)
    return () => { cancelled = true; window.removeEventListener('mmp-site-settings-change', load) }
  }, [])

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      if (feedback?.type === 'error') setFeedback(null)
    }
  }

  async function sendMessage(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setFeedback(null)
    try {
      await apiRequest('/contact-messages', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          website: form.website,
        }),
      })
      setForm(EMPTY_FORM)
      setFeedback({ type: 'success', text: 'Your message was sent. Our team will get back to you.' })
    } catch (problem) {
      setFeedback({ type: 'error', text: problem.message || 'Your message could not be sent. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  function sendWhatsApp() {
    if (!contact?.whatsapp || !form.name.trim() || !form.message.trim()) return
    const message = `Hi Make Me Pretty! I'm ${form.name.trim()}${form.phone.trim() ? ` (${form.phone.trim()})` : ''}${form.email.trim() ? `, email: ${form.email.trim()}` : ''}.${form.subject.trim() ? `\n\nSubject: ${form.subject.trim()}` : ''}\n\n${form.message.trim()}`
    window.open(`https://wa.me/${whatsappDigits(contact.whatsapp)}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  if (loading) return <div className="mx-auto max-w-275 px-4 py-20 text-center text-sm text-ink-soft">Loading contact details…</div>

  const page = contact || { title: 'Contact Us', subtitle: '', introTitle: 'Let’s connect!', introText: '' }
  const details = [
    { icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z', label: 'Call', value: contact?.phone, href: contact?.phone ? `tel:${contact.phone}` : '' },
    { icon: 'M4 5h16v11H9l-5 4V5z', label: 'WhatsApp', value: contact?.whatsapp, href: contact?.whatsapp ? `https://wa.me/${whatsappDigits(contact.whatsapp)}` : '' },
    { icon: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z', label: 'Location', value: contact?.address, href: '' },
  ].filter((detail) => detail.value)

  return (
    <div className="mx-auto max-w-275 px-4 py-14 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-[clamp(30px,4.5vw,42px)] font-normal">{page.title}</h1>
        <p className="mt-2 text-[14px] text-ink-soft">{page.subtitle}</p>
      </header>
      {settingsError && <p role="status" className="mb-4 text-center text-xs text-ink-soft">{settingsError}</p>}
      <div className="grid gap-6 rounded-[28px] border border-line bg-cream/90 p-6 shadow-[0_18px_45px_rgba(59,48,44,.09)] backdrop-blur sm:p-10 md:grid-cols-2 md:gap-12">
        <section>
          <h2 className="font-serif text-2xl">{page.introTitle}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{page.introText}</p>
          <div className="mt-7 space-y-5">{details.map((detail) => <ContactDetail key={detail.label} {...detail}/>)}</div>
          {socials.length > 0 && <div className="mt-8 flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Follow us</span>
            {socials.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={social.name} className="grid size-10 place-items-center rounded-full border border-line text-rose transition-colors hover:border-rose hover:bg-pink-soft"><svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">{SOCIAL_ICONS[social.name]}</svg></a>)}
          </div>}
        </section>
        <form onSubmit={sendMessage} className="space-y-4">
          <label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Your name <span aria-hidden="true">*</span></span><input required maxLength={80} value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" className="w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label>
          <label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Email <span aria-hidden="true">*</span></span><input required type="email" maxLength={254} value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" className="w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label>
          <label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Phone (optional)</span><input maxLength={30} value={form.phone} onChange={update('phone')} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" className="w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label>
          <label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Subject (optional)</span><input maxLength={120} value={form.subject} onChange={update('subject')} placeholder="What is your message about?" className="w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label>
          <label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Message <span aria-hidden="true">*</span></span><textarea required minLength={10} maxLength={3000} rows={5} value={form.message} onChange={update('message')} placeholder="Write your message here…" className="w-full resize-y rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label>
          <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')}/></label>
          {feedback && <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`text-sm ${feedback.type === 'error' ? 'text-lowstock-text' : 'text-emerald-800'}`}>{feedback.text}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-rose px-7 py-3.5 text-sm font-medium tracking-[0.04em] text-white transition-all hover:-translate-y-0.5 hover:bg-rose-deep active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Sending…' : 'Send Message'}</button>
          {contact?.whatsapp && <div className="text-center">
            <p className="mb-2 text-[11px] leading-5 text-ink-soft">Or start a WhatsApp draft. It is separate from saving this form to our inbox.</p>
            <button type="button" onClick={sendWhatsApp} disabled={!form.name.trim() || !form.message.trim()} className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-soft transition hover:border-rose hover:text-rose disabled:cursor-not-allowed disabled:opacity-50">Continue in WhatsApp</button>
          </div>}
        </form>
      </div>
    </div>
  )
}
