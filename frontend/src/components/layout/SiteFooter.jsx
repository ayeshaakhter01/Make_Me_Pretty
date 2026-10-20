import { Link } from 'react-router-dom'
import PageContainer from '../ui/PageContainer.jsx'
import StaggerReveal from '../ui/StaggerReveal.jsx'
import { KEYS } from '../admin/adminHelpers.js'
import { useStoredState } from '../admin/useStoredState.js'
import { SEED_FOOTER } from '../../data/siteContent.js'
import { SOCIAL_ICONS } from './socialIcons.jsx'

/* The footer content (links, social media, payment logos) is edited by the admin in the Footer tab. */
const linkClass = 'link-underline text-[13.5px] text-ivory/90 hover:text-pink'

function FooterColumn({ title, children }) {
  return <section><h2 className="mb-3.5 text-[11px] uppercase tracking-[0.15em] text-[#C9BDB6]">{title}</h2>{children}</section>
}

/* a link inside the shop, or an outside website when it starts with http */
function FooterLink({ link }) {
  if (/^https?:\/\//i.test(link.href)) return <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>{link.label}</a>
  return <Link to={link.href} className={linkClass}>{link.label}</Link>
}

function LinkColumn({ title, links }) {
  return <FooterColumn title={title}><ul className="space-y-2">{links.map((link) => <li key={link.id}><FooterLink link={link} /></li>)}</ul></FooterColumn>
}

export default function SiteFooter() {
  const [footer] = useStoredState(KEYS.footer, SEED_FOOTER)
  const usable = (links = []) => links.filter((link) => link.label?.trim() && link.href?.trim())
  const payments = (footer.payments ?? []).filter((payment) => payment.src)
  const socials = (footer.socials ?? []).filter((social) => social.active && social.href?.trim() && SOCIAL_ICONS[social.name])

  return <footer className="mt-6 bg-ink text-ivory"><PageContainer className="max-w-[1460px] py-10">
    <StaggerReveal stagger={90} className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
      <div><p className="mb-1 whitespace-nowrap font-serif text-[20px] font-semibold tracking-[0.22em]">Make Me Pretty</p><p className="mb-6 font-serif italic text-pink">we wanna make you pretty</p>
        {payments.length > 0 && <FooterColumn title="Payments accepted"><div className="flex flex-wrap items-center gap-2">{payments.map((payment) => <span key={payment.id} title={payment.label} className="inline-flex h-11 items-center rounded-md bg-white px-2 py-1.5"><img src={payment.src} alt={payment.label} className="h-8 w-auto max-w-[80px] object-contain" /></span>)}</div></FooterColumn>}
      </div>
      <LinkColumn title="Help" links={usable(footer.helpLinks)} />
      <LinkColumn title="Customer Policy" links={usable(footer.policyLinks)} />
      <FooterColumn title="Social media"><div className="flex flex-wrap gap-2.5">{socials.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={social.name} title={social.name} className="grid size-9 place-items-center rounded-full border border-[#5A4F49] text-ivory transition-colors hover:border-rose hover:bg-rose hover:text-white"><svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">{SOCIAL_ICONS[social.name]}</svg></a>)}</div></FooterColumn>
    </StaggerReveal>
    <div className="mt-10 border-t border-[#5A4F49] pt-6 text-center text-[12.5px] text-[#C9BDB6]">© {new Date().getFullYear()} Make Me Pretty. All rights reserved.</div>
  </PageContainer></footer>
}
