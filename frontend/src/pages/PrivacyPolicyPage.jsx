import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'

const sections = [
  {
    title: 'What we collect',
    list: [
      'Your name, phone number, email address and delivery address when you place an order or create an account.',
      'Your order history and the items in your bag and wishlist.',
      'What you type into our Skin Advisor, such as skin concerns, so we can suggest suitable products.',
      'Basic technical details such as browser type and pages visited, to keep the site working well.',
    ],
  },
  {
    title: 'How we use it',
    list: [
      'To process, deliver and support your orders.',
      'To show your bag, wishlist and order tracking.',
      'To give you skincare suggestions that fit what you told us.',
      'To send order updates, and offers only if you agree to receive them.',
      'To prevent fraud and improve the website.',
    ],
  },
  {
    title: 'Payments',
    body: [
      'We accept mobile wallet, card and cash on delivery. Payments are handled by the payment provider. We do not store your full card number or PIN on our own servers.',
    ],
  },
  {
    title: 'Who we share it with',
    body: [
      'We share only what is needed with delivery partners (name, phone number and address) and payment providers so your order can reach you. We do not sell your personal information.',
      'We may share information if the law requires it.',
    ],
  },
  {
    title: 'Cookies and browser storage',
    body: [
      'We store small pieces of data in your browser, such as your shopping bag and wishlist, so they are still there when you come back. Clearing your browser data removes them.',
    ],
  },
  {
    title: 'Your Skin Advisor information',
    body: [
      'The Skin Advisor gives general skincare suggestions. It is not medical advice, so please do not enter sensitive health details. If you have a painful, persistent or worsening skin problem, see a doctor or dermatologist.',
    ],
  },
  {
    title: 'Keeping your data safe',
    body: [
      'We take reasonable steps to protect your information, including limiting who can access it. No website can promise perfect security, so please keep your password private.',
    ],
  },
  {
    title: 'Your choices',
    list: [
      'Ask to see the information we hold about you.',
      'Ask us to correct it or delete your account.',
      'Unsubscribe from offers at any time.',
    ],
  },
  {
    title: 'Children',
    body: ['Our shop is meant for adults. If you are under 18, please shop with a parent or guardian.'],
  },
  {
    title: 'Changes to this policy',
    body: ['We may update this policy from time to time. The latest version is always on this page.'],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PageContainer className="max-w-[810px] py-14">
      <h1 className="font-serif text-[clamp(28px,4.5vw,40px)] font-normal">Privacy Policy</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        Your privacy matters to us. This page explains what information Make Me Pretty collects, why we collect it, and the choices you have.
      </p>

      <div className="mt-10 space-y-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-[22px] text-ink">{section.title}</h2>

            {section.body?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-ink-soft">{paragraph}</p>
            ))}

            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft marker:text-rose">
                {section.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-cream p-5 text-[14px] leading-relaxed text-ink-soft">
        Questions about your information? <Link to="/p/contact" className="font-medium text-rose underline underline-offset-4 hover:text-rose-deep">Contact us</Link>.
      </div>
    </PageContainer>
  )
}
