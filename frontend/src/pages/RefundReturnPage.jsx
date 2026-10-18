import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'

/* Each section is one object. To change the wording, edit the text here;
   the layout below draws every section the same way. */
const sections = [
  {
    title: 'Returns within 7 days',
    body: [
      'Unopened products can be returned within 7 days of delivery for a full refund.',
      'The product must be unused, sealed, and in its original packaging, with any tamper seal, box and tags still attached.',
    ],
  },
  {
    title: 'What cannot be returned',
    list: [
      'Opened, used or tested skincare, makeup and hair care products (for hygiene and safety reasons).',
      'Products with a broken seal, missing packaging or visible damage caused after delivery.',
      'Items bought with a final-sale or clearance label.',
    ],
  },
  {
    title: 'Damaged, wrong or expired items',
    body: [
      'If your order arrives damaged, leaking, expired or different from what you ordered, tell us within 48 hours of delivery and send clear photos of the product and the outer package.',
      'We will replace the item or refund it in full, and we will cover the return delivery.',
    ],
  },
  {
    title: 'How to request a return',
    steps: [
      'Contact us from the Contact page with your order ID (for example AR-1042) and the reason for the return.',
      'Wait for our confirmation message. Please do not send the parcel before we approve it.',
      'Pack the product securely in its original packaging and hand it to the courier we arrange.',
      'We check the item when it reaches us, then confirm your refund.',
    ],
  },
  {
    title: 'How refunds are paid',
    body: [
      'Approved refunds are sent to the same method you paid with: your mobile wallet or card. For cash on delivery orders, we refund by mobile wallet or bank transfer; we will ask for the details.',
      'Please allow 5 to 7 working days after we receive and check the product. Original delivery charges are not refunded unless the return is because of our mistake.',
    ],
  },
  {
    title: 'Cancelling an order',
    body: [
      'You can cancel before your order is shipped. After it has shipped, please use the return process once it is delivered.',
    ],
  },
]

export default function RefundReturnPage() {
  return (
    <PageContainer className="max-w-[810px] py-14">
      <h1 className="font-serif text-[clamp(28px,4.5vw,40px)] font-normal">Refund &amp; Return Policy</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        We want you to love what you buy. If something is not right, this page explains how returns and refunds work.
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

            {section.steps && (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft marker:font-medium marker:text-rose">
                {section.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-cream p-5 text-[14px] leading-relaxed text-ink-soft">
        Need help with a return? <Link to="/p/contact" className="font-medium text-rose underline underline-offset-4 hover:text-rose-deep">Contact us</Link>.
        See also our <Link to="/p/delivery" className="font-medium text-rose underline underline-offset-4 hover:text-rose-deep">Delivery Policy</Link>.
      </div>
    </PageContainer>
  )
}
