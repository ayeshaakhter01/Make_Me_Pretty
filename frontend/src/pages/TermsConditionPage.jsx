import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'

const sections = [
  {
    title: 'Using our website',
    body: [
      'By browsing or buying from Make Me Pretty, you agree to these terms. If you do not agree to be bound by this User Agreement, please do not access, register with, or use this Site.',
      'You agree to give correct information when you order or create an account, and to keep your password private.',
    ],
  },
  {
    title: 'Products and descriptions',
    body: [
      'We try to show colours, sizes and details accurately, but screens differ and slight variations can happen. Product information, ingredients and prices may change without notice.',
      'Skincare results vary from person to person. Please read the ingredient list and do a patch test if you have sensitive skin or allergies.',
    ],
  },
  {
    title: 'Prices and payment',
    list: [
      'All prices are in Bangladeshi Taka (৳).',
      'We accept Bkash, VISA card and cash on delivery.',
      'We may cancel an order if a price or stock listing was wrong, and we will refund anything you already paid.',
    ],
  },
  {
    title: 'Offers and coupon codes',
    body: [
      'Offers and codes (such as GLOW20) have their own conditions and end dates. One code can normally be used per order, and codes cannot be exchanged for cash.',
    ],
  },
  {
    title: 'Orders',
    body: [
      'Placing an order is an offer to buy. It becomes a confirmed order when we confirm it. We may decline or cancel an order, for example if an item is out of stock or we cannot verify the details.',
    ],
  },
  {
    title: 'Delivery, returns and refunds',
    body: [
      'Delivery and returns follow our policies, which form part of these terms.',
    ],
    links: [
      { to: '/p/delivery', label: 'Delivery Policy' },
      { to: '/p/refund-return', label: 'Refund & Return Policy' },
    ],
  },
  {
    title: 'Skin Advisor',
    body: [
      'The Skin Advisor gives general skincare suggestions from products in our shop. It is not medical advice and does not replace a doctor or dermatologist. Please seek professional help for any painful, persistent or worsening skin condition.',
    ],
  },
  {
    title: 'Your account',
    body: [
      'You are responsible for activity on your account. Tell us straight away if you think someone else has used it. We may suspend accounts that are used unfairly or against these terms.',
    ],
  },
  {
    title: 'Our content',
    body: [
      'The logo, text, images and design on this site belong to Make Me Pretty or its partners. Please do not copy or reuse them without our written permission.',
    ],
  },
  {
    title: 'Limits of our responsibility',
    body: [
      'We take care to provide a reliable service, but we cannot promise the site will always be available or free of errors. To the extent the law allows, we are not responsible for indirect losses, and our responsibility for an order is limited to the amount you paid for it.',
    ],
  },
  {
    title: 'Changes and governing law',
    body: [
      'We may update these terms, and the latest version is always on this page. These terms are governed by the laws of Bangladesh.',
    ],
  },
]

export default function TermsConditionPage() {
  return (
    <PageContainer className="max-w-[810px] py-14">
      <h1 className="font-serif text-[clamp(28px,4.5vw,40px)] font-normal">Terms &amp; Condition</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        Please read these terms before you use Make Me Pretty or place an order.
      </p>

      <div className="mt-10 space-y-9">
        {sections.map((section, index) => (
          <section key={section.title}>
            <h2 className="font-serif text-[22px] text-ink">{index + 1}. {section.title}</h2>

            {section.body?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-ink-soft">{paragraph}</p>
            ))}

            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft marker:text-rose">
                {section.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}

            {section.links && (
              <p className="mt-3 text-[15px] text-ink-soft">
                {section.links.map((link, linkIndex) => (
                  <span key={link.to}>
                    {linkIndex > 0 && ' · '}
                    <Link to={link.to} className="font-medium text-rose underline underline-offset-4 hover:text-rose-deep">{link.label}</Link>
                  </span>
                ))}
              </p>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-cream p-5 text-[14px] leading-relaxed text-ink-soft">
        Questions about these terms? <Link to="/p/contact" className="font-medium text-rose underline underline-offset-4 hover:text-rose-deep">Contact us</Link>.
      </div>
    </PageContainer>
  )
}
