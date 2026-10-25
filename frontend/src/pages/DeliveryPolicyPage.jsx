import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'

const deliveryTimes = [
  { area: 'Inside Chittagong', time: '1 to 2 working days' },
  { area: 'Other cities and districts', time: '2 to 4 working days' },
]

const sections = [
  {
    title: 'Delivery areas',
    body: ['We deliver nationwide across Bangladesh.'],
  },
  {
    title: 'Delivery charges',
    body: [
      'Free delivery on orders over ৳3,000, nationwide.',
      'For smaller orders, the delivery charge for your area is shown at checkout before you pay.',
    ],
  },
  {
    title: 'Order processing',
    body: [
      'Orders are packed and handed to the courier within 1 working day after they are confirmed. Orders placed late at night, on Fridays or on public holidays are processed on the next working day.',
    ],
  },
  {
    title: 'Paying on delivery',
    body: [
      'Cash on delivery is available. Please keep the exact amount ready for the delivery person. You can also pay by mobile wallet or card at checkout.',
    ],
  },
  {
    title: 'When you receive your parcel',
    list: [
      'Check that the outer package is not torn, wet or opened.',
      'If it looks damaged, tell the delivery person and take photos before you accept it.',
      'Report any problem within 48 hours of delivery (see our Refund & Return Policy).',
    ],
  },
  {
    title: 'Missed deliveries',
    body: [
      'If you are not reachable, the courier will try again. After repeated failed attempts, the order may be returned to us and we will contact you to arrange a new delivery.',
    ],
  },
  {
    title: 'Delays',
    body: [
      'Weather, strikes, festivals and other events outside our control can slow delivery. We will keep you updated and do our best to get your order to you quickly.',
    ],
  },
]

export default function DeliveryPolicyPage() {
  return (
    <PageContainer className="max-w-[810px] py-14">
      <h1 className="font-serif text-[clamp(28px,4.5vw,40px)] font-normal">Delivery Policy</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        Here is how and when your Make Me Pretty order reaches you.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-cream">
        <table className="w-full text-left text-[14.5px]">
          <thead className="bg-pink-soft text-ink">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Area</th>
              <th scope="col" className="px-5 py-3 font-medium">Estimated delivery</th>
            </tr>
          </thead>
          <tbody className="text-ink-soft">
            {deliveryTimes.map((row) => (
              <tr key={row.area} className="border-t border-line">
                <td className="px-5 py-3">{row.area}</td>
                <td className="px-5 py-3">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        Problem with a delivery? <Link to="/p/contact" className="font-medium text-rose underline underline-offset-4 hover:text-rose-deep">Contact us</Link>.
      </div>
    </PageContainer>
  )
}
