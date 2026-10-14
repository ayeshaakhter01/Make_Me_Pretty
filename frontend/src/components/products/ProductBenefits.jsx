import Icon from '../ui/Icon.jsx'

function DeliveryIcon({ kind }) {
  if (kind === 'truck') return <svg viewBox="0 0 640 512" aria-hidden="true" className="size-4 shrink-0 fill-current text-[#86766e]"><path d="M112 0C85.5 0 64 21.5 64 48v48H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h256c8.8 0 16 7.2 16 16s-7.2 16-16 16H64c-8.8 0-16 7.2-16 16s7.2 16 16 16h176c8.8 0 16 7.2 16 16s-7.2 16-16 16H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h208c8.8 0 16 7.2 16 16s-7.2 16-16 16H64v128c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32V237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H112zm432 256H416v-96h50.7L544 237.3V256zM160 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm272 48a48 48 0 1 1 96 0 48 48 0 1 1-96 0z"/></svg>
  if (kind === 'card') return <svg viewBox="0 0 576 512" aria-hidden="true" className="size-4 shrink-0 fill-current text-[#253b5c]"><path d="M64 32C28.7 32 0 60.7 0 96v32h576V96c0-35.3-28.7-64-64-64H64zm512 192H0v192c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V224zM112 352h64c8.8 0 16 7.2 16 16s-7.2 16-16 16h-64c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
  if (kind === 'return') return <span aria-hidden="true" className="w-4 shrink-0 text-center text-[16px] leading-none text-[#86766e]">↩</span>
  if (kind === 'sparkle') return <span aria-hidden="true" className="w-4 shrink-0 text-center text-[15px] leading-none text-rose">✦</span>
  return <Icon name={kind} className="size-4 shrink-0" />
}

const benefits = [
  { icon: 'truck', text: 'Delivery in 1–2 days inside Chittagong · 2–4 days nationwide' },
  { icon: 'card', text: 'bKash · Cards · Cash on Delivery' },
  { icon: 'return', text: '7-day easy returns on unopened products' },
  { icon: 'sparkle', text: 'Use code GLOW20 — 20% off', accent: true },
]

export default function ProductBenefits() {
  return <ul className="grid gap-1.5 rounded-[22px] border border-line bg-cream p-5 text-[13.5px] leading-5 text-ink-soft">{benefits.map(({ icon, text, accent }) => <li key={icon} className={`flex items-center gap-2 ${accent ? 'text-rose' : ''}`}><DeliveryIcon kind={icon}/><span>{text}</span></li>)}</ul>
}
