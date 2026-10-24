import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import Icon from '../components/ui/Icon.jsx'
import SkinAdvisorForm from '../components/ai/SkinAdvisorForm.jsx'
import RecommendationCard from '../components/ai/RecommendationCard.jsx'
import AdvisorDisclaimer from '../components/ai/AdvisorDisclaimer.jsx'
import { apiRequest } from '../api.js'
import { useCatalog } from '../context/useCatalog.js'
import { CONCERNS } from '../data/skinAdvisor.js'

function LoadingCards() {
  return (
    <div aria-busy="true" aria-label="Finding your matches">
      <p className="mb-6 flex items-center justify-center gap-2 text-sm text-ink-soft"><Icon name="sparkle" className="size-4 animate-floaty text-rose" />Reading your skin notes and browsing our shelves…</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="overflow-hidden rounded-3xl border border-line bg-cream">
            <div className="skel aspect-[5/4]" />
            <div className="space-y-3 p-5"><div className="skel h-3 w-1/3 rounded-full" /><div className="skel h-5 w-3/4 rounded-full" /><div className="skel h-20 rounded-2xl" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyResult() {
  return (
    <div className="rounded-3xl border border-line bg-cream px-6 py-14 text-center">
      <h2 className="font-serif text-2xl">We couldn’t spot a specific concern yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">Try describing how your skin looks or feels (oily, dry, red, dull…), or tap one of the concern buttons above.</p>
      <Link to="/shop?category=Skincare" className="mt-6 inline-block rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep">Browse all skincare</Link>
    </div>
  )
}

export default function SkinAdvisorPage() {
  const { products } = useCatalog()
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const resultsRef = useRef(null)
  const requestId = useRef(0)

  useEffect(() => {
    if (status !== 'idle') resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [status])

  async function handleSubmit(input) {
    const id = ++requestId.current
    setStatus('loading')
    try {
      const data = await apiRequest('/skin-advisor/recommendations', { method: 'POST', body: JSON.stringify({ skinType: 'unspecified', concerns: (input.concernIds || []).map((id) => CONCERNS.find((concern) => concern.id === id)?.label).filter(Boolean), preferences: input.text || '' }) })
      if (id !== requestId.current) return
      setResult({ ...data, picks: data.recommendations })
      setStatus('done')
    } catch {
      if (id === requestId.current) setStatus('error')
    }
  }

  const picks = (result?.picks ?? [])
    .map((pick) => ({ ...pick, product: products.find((item) => item.id === String(pick.productId)) }))
    .filter((pick) => pick.product)

  return (
    <PageContainer className="max-w-[1100px] py-12 sm:py-14">
      <header className="animate-fadeup mb-10 text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-soft px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose"><Icon name="sparkle" className="size-3.5" />AI Skin Advisor</p>
        <h1 className="font-serif text-[clamp(30px,4.5vw,44px)] font-normal leading-tight">Tell us about your skin,<br className="hidden sm:block" /> we’ll find your ritual</h1>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-ink-soft">Describe your skin in your own words. Our advisor reads your concerns and picks the products from our shop that suit you best, with a short reason for each.</p>
      </header>

      <SkinAdvisorForm onSubmit={handleSubmit} loading={status === 'loading'} />

      <section ref={resultsRef} aria-live="polite" className="scroll-mt-28 pt-12">
        {status === 'loading' && <LoadingCards />}

        {status === 'error' && (
          <div role="alert" className="rounded-3xl border border-line bg-cream px-6 py-12 text-center">
            <h2 className="font-serif text-2xl">Something went wrong</h2>
            <p className="mt-2 text-sm text-ink-soft">We couldn’t get your recommendations just now. Please try again in a moment.</p>
          </div>
        )}

        {status === 'done' && (picks.length === 0 ? <EmptyResult /> : (
          <>
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl">Your personalised picks</h2>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-rose">{result.mode === 'ai' ? 'OpenAI recommendations' : 'Catalog matching · AI unavailable'}</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-2">{result.concerns.map((concern) => <li key={concern.id} className="rounded-full border border-rose/30 bg-pink-soft px-3.5 py-1 text-xs font-medium text-rose-deep">{concern.label}</li>)}</ul>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-ink-soft">{result.summary}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {picks.map((pick, index) => <div key={pick.productId} className="animate-fadeup flex" style={{ animationDelay: `${index * 80}ms` }}><RecommendationCard product={pick.product} reason={pick.reason} rank={index + 1} /></div>)}
            </div>
            <AdvisorDisclaimer className="mx-auto mt-10 max-w-2xl" />
            <div className="mt-6 text-center"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-ink-soft underline underline-offset-4 hover:text-rose">Try a different description</button></div>
          </>
        ))}
      </section>
    </PageContainer>
  )
}
