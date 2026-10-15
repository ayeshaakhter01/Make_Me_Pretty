import { useState } from 'react'

const contact = {
  phone: '01644611916',
  whatsapp: '01622736644',
  address: 'Block-G, Halishahar, Chittagong',
  facebook: 'https://www.facebook.com/makemepretty24',
  instagram: 'https://www.instagram.com/makemepretty24',
}
const whatsapp = `88${contact.whatsapp}`

function ContactDetail({ icon, label, value, href }) {
  const content = <div className="group flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-cream text-rose transition-colors group-hover:border-rose group-hover:bg-pink-soft"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon}/></svg></span><span><span className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</span><span className="text-[15px] font-medium text-ink">{value}</span></span></div>
  return href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="block">{content}</a> : content
}

const contactDetails = [
  { icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z', label: 'Call', value: contact.phone, href: `tel:${contact.phone}` },
  { icon: 'M4 5h16v11H9l-5 4V5z', label: 'WhatsApp', value: contact.whatsapp, href: `https://wa.me/${whatsapp}` },
  { icon: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z', label: 'Location', value: contact.address },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function sendMessage(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    const message = `Hi Make Me Pretty! I'm ${form.name.trim()}${form.phone.trim() ? ` (${form.phone.trim()})` : ''}.\n\n${form.message.trim()}`
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setForm({ name: '', phone: '', message: '' })
  }

  return <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6"><header className="mb-10 text-center"><h1 className="font-serif text-[clamp(30px,4.5vw,42px)] font-normal">Contact Us</h1><p className="mt-2 text-[14px] text-ink-soft">Questions about an order or a product? We’d love to hear from you.</p></header><div className="grid gap-6 rounded-[28px] border border-line bg-cream/90 p-6 shadow-[0_18px_45px_rgba(59,48,44,.09)] backdrop-blur sm:p-10 md:grid-cols-2 md:gap-12"><section><h2 className="font-serif text-2xl">Let’s connect!</h2><p className="mt-2 text-[14px] leading-relaxed text-ink-soft">Whether it’s about an order, a product, or your skin’s next favourite ritual — call us, WhatsApp us, or drop a note here. We reply within a day.</p><div className="mt-7 space-y-5">{contactDetails.map((detail) => <ContactDetail key={detail.label} {...detail}/>)}</div><div className="mt-8 flex items-center gap-3"><span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Follow us</span>{[[contact.facebook,'Facebook'],[contact.instagram,'Instagram']].map(([href,label]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-line text-rose transition-colors hover:border-rose hover:bg-pink-soft">{label === 'Instagram' ? <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="16.7" cy="7.3" r=".8" fill="currentColor" stroke="none"/></svg> : <span className="font-sans text-lg font-medium">f</span>}</a>)}</div></section><form onSubmit={sendMessage} className="space-y-4"><label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Your name</span><input required value={form.name} onChange={update('name')} placeholder="Your name" className="w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label><label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Phone (optional)</span><input value={form.phone} onChange={update('phone')} placeholder="01XXXXXXXXX" inputMode="tel" className="w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label><label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose">Message</span><textarea required value={form.message} onChange={update('message')} placeholder="Write your message here…" className="min-h-[130px] w-full resize-y rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/60 focus:border-rose"/></label><button type="submit" className="w-full rounded-full bg-rose px-7 py-3.5 text-sm font-medium tracking-[0.04em] text-white transition-all hover:-translate-y-0.5 hover:bg-rose-deep active:scale-[0.97]">Send Message</button><p className="text-center text-[11px] leading-5 text-ink-soft">Your message opens in WhatsApp so you can review it before sending.</p></form></div></div>
}