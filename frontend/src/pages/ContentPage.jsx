import { Link, useParams } from 'react-router-dom'
import AboutUsPage from './AboutUsPage.jsx'
import ContactPage from './ContactPage.jsx'
import RefundReturnPage from './RefundReturnPage.jsx'
import PrivacyPolicyPage from './PrivacyPolicyPage.jsx'
import DeliveryPolicyPage from './DeliveryPolicyPage.jsx'
import TermsConditionPage from './TermsConditionPage.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'

const contentPages = [
  { slug: 'about-us', title: 'The People Behind Make Me Pretty' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'refund-return', title: 'Refund & Return Policy' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'delivery', title: 'Delivery Policy' },
  { slug: 'terms', title: 'Terms & Condition' },
]

export default function ContentPage() {
  const { slug } = useParams()
  const page = contentPages.find((content) => content.slug === slug)
  if (!page) return <PageContainer className="py-24 text-center"><h1 className="font-serif text-3xl">That page is not here.</h1><Link to="/" className="mt-5 inline-block text-rose underline">Back home</Link></PageContainer>
  if (slug === 'about-us') return <AboutUsPage/>
  if (slug === 'contact') return <ContactPage/>
  if (slug === 'refund-return') return <RefundReturnPage/>
  if (slug === 'privacy') return <PrivacyPolicyPage/>
  if (slug === 'delivery') return <DeliveryPolicyPage/>
  if (slug === 'terms') return <TermsConditionPage/>
  return <PageContainer className="max-w-[810px] py-14"><h1 className="font-serif text-[clamp(28px,4.5vw,40px)] font-normal">{page.title}</h1><p className="mt-6 text-[15px] leading-relaxed text-ink-soft">This page is coming soon. Please check back shortly.</p></PageContainer>
}
