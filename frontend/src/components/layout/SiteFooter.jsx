import { Link } from 'react-router-dom'
import PageContainer from '../ui/PageContainer.jsx'
import StaggerReveal from '../ui/StaggerReveal.jsx'

const helpLinks = [
  ['Contact', '/p/contact'],
  ['About Us', '/p/about-us'],
]
const policyLinks = [
  ['Refund & Return Policy', '/p/refund-return'],
  ['Privacy Policy', '/p/privacy'],
  ['Delivery Policy', '/p/delivery'],
  ['Terms & Condition', '/p/terms'],
]
const payments = [
  { label: 'bKash', src: '/images/payments/bkash.svg' },
  { label: 'Visa', src: '/images/payments/visa.png' },
  { label: 'Cash on Delivery', src: '/images/payments/cod.png' },
]
const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/share/1GzwwLRMqB/?mibextid=wwXIfr', icon: <path d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.5c0-.8.2-1.3 1.4-1.3H16V5.8c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.2V14h2.4v7h2.9z"/> },
  { name: 'Instagram', href: 'https://www.instagram.com/makemepretty24?igsh=bmF3MXowbGR4MmY=', icon: <><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="16.6" cy="7.4" r="1.1"/></> },
  { name: 'WhatsApp', href: 'https://wa.me/', icon: <path d="M12 3.6a8.3 8.3 0 0 0-7 12.7L4 20.4l4.2-1a8.3 8.3 0 1 0 3.8-15.8Zm0 1.7a6.6 6.6 0 0 1 5.6 10 6.6 6.6 0 0 1-8.6 2.3l-.3-.2-2.5.6.6-2.4-.2-.3A6.6 6.6 0 0 1 12 5.3Z"/> },
  { name: 'TikTok', href: 'https://www.tiktok.com/@make_me_pretty9?_r=1&_t=ZS-97weg3uXdzR', icon: <path d="M15 4c.3 1.9 1.4 3.2 3.3 3.4v2.3c-1.1.1-2.1-.2-3.2-.8v4.7c0 3-2.2 5.1-5 5.1-2.6 0-4.5-2-4.5-4.5 0-2.7 2.3-4.7 5.2-4.3v2.5c-.4-.1-.8-.2-1.2-.1-1 .1-1.7.8-1.7 1.9 0 1.1.9 2 2 2 1.2 0 2-.9 2-2.3V4H15z"/> },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/make-me-pretty-773652376?utm_source=share_via&utm_content=profile&utm_medium=member_ios', icon: <path d="M6.9 8.5H4.3V20h2.6V8.5zM5.6 4.3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM20 20v-6.3c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-2.9 1.6V8.5h-2.6c0 .7 0 11.5 0 11.5h2.6v-6.4c0-.3 0-.7.1-.9.3-.7.9-1.4 1.9-1.4 1.3 0 1.9 1 1.9 2.5V20H20z"/> },
]

function FooterColumn({ title, children }) {
  return <section><h2 className="mb-3.5 text-[11px] uppercase tracking-[0.15em] text-[#C9BDB6]">{title}</h2>{children}</section>
}

export default function SiteFooter() {
  return <footer className="mt-6 bg-ink text-ivory"><PageContainer className="max-w-[1460px] py-10">
    <StaggerReveal stagger={90} className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
      <div><p className="mb-1 whitespace-nowrap font-serif text-[20px] font-semibold tracking-[0.22em]">Make Me Pretty</p><p className="mb-6 font-serif italic text-pink">we wanna make you pretty</p><FooterColumn title="Payments accepted"><div className="flex flex-wrap items-center gap-2">{payments.map((payment) => <span key={payment.label} title={payment.label} className="inline-flex h-11 items-center rounded-md bg-white px-2 py-1.5"><img src={payment.src} alt={payment.label} className="h-8 w-auto max-w-[80px] object-contain"/></span>)}</div></FooterColumn></div>
      <FooterColumn title="Help"><ul className="space-y-2">{helpLinks.map(([label, href]) => <li key={href}><Link to={href} className="link-underline text-[13.5px] text-ivory/90 hover:text-pink">{label}</Link></li>)}</ul></FooterColumn>
      <FooterColumn title="Customer Policy"><ul className="space-y-2">{policyLinks.map(([label, href]) => <li key={href}><Link to={href} className="link-underline text-[13.5px] text-ivory/90 hover:text-pink">{label}</Link></li>)}</ul></FooterColumn>
      <FooterColumn title="Social media"><div className="flex flex-wrap gap-2.5">{socialLinks.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={social.name} title={social.name} className="grid size-9 place-items-center rounded-full border border-[#5A4F49] text-ivory transition-colors hover:border-rose hover:bg-rose hover:text-white"><svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">{social.icon}</svg></a>)}</div></FooterColumn>
    </StaggerReveal>
    <div className="mt-10 border-t border-[#5A4F49] pt-6 text-center text-[12.5px] text-[#C9BDB6]">© {new Date().getFullYear()} Make Me Pretty. All rights reserved.</div>
  </PageContainer></footer>
}
