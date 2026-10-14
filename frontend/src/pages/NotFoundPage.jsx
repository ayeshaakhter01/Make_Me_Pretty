import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'

export default function NotFoundPage() {
  return <PageContainer className="py-24 text-center"><p className="text-xs uppercase tracking-[0.18em] text-rose">A little detour</p><h1 className="mt-3 font-display text-5xl">This page wandered off.</h1><p className="mt-4 text-sm text-muted">Let’s take you somewhere lovely instead.</p><Link to="/" className="mt-7 inline-block rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-rose-deep">Back to home</Link></PageContainer>
}
