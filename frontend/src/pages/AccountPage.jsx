import { useEffect, useState } from 'react'
import PageContainer from '../components/ui/PageContainer.jsx'
import { apiRequest, clearAuthSession, loadAuthSession, saveAuthSession } from '../api.js'
import { useNavigate } from 'react-router-dom'
import ResendVerification, { SandboxLink } from '../components/account/ResendVerification.jsx'

export default function AccountPage() {
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [staffSession, setStaffSession] = useState(null)
  const [pendingSignup, setPendingSignup] = useState(null) // { email, sandboxLink } after a new sign-up
  const [unverifiedEmail, setUnverifiedEmail] = useState('') // set when sign-in is blocked: email not verified yet

  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [signUp, setSignUp] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const session = loadAuthSession()
    if (!session?.token) return
    if (session.user?.role === 'customer') navigate('/account/profile', { replace: true })
    else setStaffSession(session.user)
  }, [navigate])

  function changeMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setUnverifiedEmail('')
    setPendingSignup(null)
    setShowPassword(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setUnverifiedEmail('')
    setIsSubmitting(true)

    try {
      const isSignUp = mode === 'signup'
      const result = await apiRequest(
        isSignUp ? '/auth/register' : '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(isSignUp ? signUp : signIn),
        },
      )

      if (isSignUp) {
        // New customers must verify their email first, so there is no session yet.
        setPendingSignup({ email: result.email, sandboxLink: result.sandboxLink || '' })
        setSignUp({ name: '', email: '', password: '' })
        return
      }

      saveAuthSession({ user: result.user, token: result.token })
      if (result.user.role !== 'customer') {
        setMessage('This is a staff account. Please sign in at /admin.')
        return
      }
      navigate('/account/profile')
      setMessage('Signed in successfully!')
    } catch (error) {
      setMessage(error.message)
      if (error.code === 'EMAIL_NOT_VERIFIED') setUnverifiedEmail(signIn.email.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer className="animate-fadeup py-14">
      <div className="mx-auto max-w-md">
        {staffSession && <div className="mb-5 rounded-2xl border border-line bg-cream p-4 text-sm"><p>You are currently signed in as staff ({staffSession.name}). To use a customer account, sign out of this staff session first.</p><button type="button" onClick={() => { clearAuthSession(); setStaffSession(null) }} className="mt-2 text-rose underline">Sign out of staff account</button></div>}
        <header className="mb-6 text-center">
          <h1 className="font-serif text-[34px] font-normal">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {mode === 'signin'
              ? 'Sign in to track orders and check out faster.'
              : 'Join Make Me Pretty — we wanna make you pretty.'}
          </p>
        </header>

        <div className="mb-6 flex rounded-full border border-line bg-cream p-1">
          {[
            ['signin', 'Sign In'],
            ['signup', 'Sign Up'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeMode(value)}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
                mode === value ? 'bg-ink text-ivory' : 'text-ink-soft'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {pendingSignup ? <div role="status" className="grid gap-3 rounded-3xl border border-line bg-cream p-6 text-center">
          <p className="text-3xl text-rose" aria-hidden="true">✿</p>
          <h2 className="font-serif text-2xl">Check your email</h2>
          <p className="text-sm text-ink-soft">We sent a verification link to <strong>{pendingSignup.email}</strong>. Click it to finish creating your account, then sign in.</p>
          {pendingSignup.sandboxLink && <SandboxLink href={pendingSignup.sandboxLink} />}
          <ResendVerification email={pendingSignup.email} className="justify-items-center" />
          <button type="button" onClick={() => changeMode('signin')} className="text-sm text-rose-deep underline">Back to Sign In</button>
        </div> : <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-3xl border border-line bg-cream p-6"
        >
          {mode === 'signup' && (
            <label>
              <span className="field-label">Full name</span>
              <input
                required
                placeholder="Ayesha Rahman"
                autoComplete="name"
                value={signUp.name}
                onChange={(event) =>
                  setSignUp({ ...signUp, name: event.target.value })
                }
              />
            </label>
          )}

          <label>
            <span className="field-label">Email</span>
            <input
              required
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              value={mode === 'signin' ? signIn.email : signUp.email}
              onChange={(event) => {
                if (mode === 'signin') {
                  setSignIn({ ...signIn, email: event.target.value })
                } else {
                  setSignUp({ ...signUp, email: event.target.value })
                }
              }}
            />
          </label>

          <label>
            <span className="field-label">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                className="w-full pr-12"
                value={mode === 'signin' ? signIn.password : signUp.password}
                onChange={(event) => {
                  if (mode === 'signin') {
                    setSignIn({ ...signIn, password: event.target.value })
                  } else {
                    setSignUp({ ...signUp, password: event.target.value })
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>
          </label>

          {message && (
            <p role="status" className="text-sm text-rose-deep">
              {message}
            </p>
          )}
          {unverifiedEmail && <ResendVerification email={unverifiedEmail} />}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep disabled:opacity-60"
          >
            {isSubmitting
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>}
      </div>
    </PageContainer>
  )
}
