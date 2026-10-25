import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import { apiRequest } from '../api.js'
import ResendVerification from '../components/account/ResendVerification.jsx'

/* Opens from the link in the verification email: /verify-email?token=...
   It sends the token to the backend once and shows "verified" or the problem. */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, setState] = useState({ status: token ? 'loading' : 'error', message: token ? '' : 'This verification link is not valid.', code: token ? '' : 'INVALID_LINK' })
  const [resendEmail, setResendEmail] = useState('')
  const alreadyTried = useRef(false) // a link can only be used once, so we must not send it twice

  useEffect(() => {
    if (!token || alreadyTried.current) return
    alreadyTried.current = true
    apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then((result) => setState({ status: 'success', message: '', code: '', email: result.email }))
      .catch((problem) => setState({ status: 'error', message: problem.message, code: problem.code || '' }))
  }, [token])

  return (
    <PageContainer className="animate-fadeup py-14">
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-cream p-8 text-center">
        {state.status === 'loading' && <>
          <p className="text-3xl text-rose" aria-hidden="true">✿</p>
          <h1 className="mt-2 font-serif text-2xl">Verifying your email…</h1>
        </>}

        {state.status === 'success' && <div role="status">
          <p className="text-4xl text-rose" aria-hidden="true">✓</p>
          <h1 className="mt-2 font-serif text-2xl">Email verified!</h1>
          <p className="mt-2 text-sm text-ink-soft">{state.email} is confirmed. You can sign in now.</p>
          <Link to="/account" className="mt-6 inline-block rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep">Go to Sign In</Link>
        </div>}

        {state.status === 'error' && <div role="alert">
          <p className="text-4xl text-rose-deep" aria-hidden="true">!</p>
          <h1 className="mt-2 font-serif text-2xl">{state.code === 'LINK_EXPIRED' ? 'This link has expired' : 'We couldn’t verify your email'}</h1>
          <p className="mt-2 text-sm text-ink-soft">{state.message}</p>
          <div className="mt-6 grid justify-items-center gap-3 text-left">
            <label className="w-full">
              <span className="field-label">Your email, to get a new link</span>
              <input type="email" value={resendEmail} onChange={(event) => setResendEmail(event.target.value)} placeholder="you@email.com" autoComplete="email" />
            </label>
            <ResendVerification email={resendEmail.trim()} />
            <Link to="/account" className="text-sm text-rose-deep underline">Back to Sign In</Link>
          </div>
        </div>}
      </div>
    </PageContainer>
  )
}
