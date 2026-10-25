import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AboutUsPage from './AboutUsPage.jsx'
import ContactPage from './ContactPage.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import PolicyContent from '../components/ui/PolicyContent.jsx'
import { apiRequest } from '../api.js'

// About Us and Contact are designed pages. Every policy comes from the database (GET /api/policies/:slug).
const designedPages = { 'about-us': AboutUsPage, contact: ContactPage }

export default function ContentPage() {
  const { slug } = useParams()
  const Designed = designedPages[slug]
  const [state, setState] = useState({ loading: true, policy: null })

  useEffect(() => {
    if (Designed) return undefined
    let cancelled = false
    setState({ loading: true, policy: null })
    apiRequest(`/policies/${encodeURIComponent(slug)}`)
      .then((policy) => { if (!cancelled) setState({ loading: false, policy }) })
      .catch(() => { if (!cancelled) setState({ loading: false, policy: null }) })
    return () => { cancelled = true }
  }, [slug, Designed])

  if (Designed) return <Designed />
  if (state.loading) return <PageContainer className="py-24 text-center">Loading page…</PageContainer>
  if (!state.policy) return <PageContainer className="py-24 text-center"><h1 className="font-serif text-3xl">That page is not here.</h1><Link to="/" className="mt-5 inline-block text-rose underline">Back home</Link></PageContainer>
  return (
    <PageContainer className="max-w-[810px] py-14">
      <h1 className="font-serif text-[clamp(28px,4.5vw,40px)] font-normal">{state.policy.title}</h1>
      <PolicyContent text={state.policy.content} />
    </PageContainer>
  )
}
