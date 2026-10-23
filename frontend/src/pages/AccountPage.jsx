import { useState } from 'react'
import PageContainer from '../components/ui/PageContainer.jsx'
import { apiRequest, saveAuthSession } from '../api.js'
import { useNavigate } from 'react-router-dom'

export default function AccountPage() {
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [signUp, setSignUp] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  function changeMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setShowPassword(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
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

      saveAuthSession({ user: result.user, token: result.token })
      if (result.user.role !== 'customer') {
        setMessage('This is a staff account. Please sign in at /admin.')
        return
      }
      navigate('/account/profile')
      setMessage(
        isSignUp
          ? 'Account created and signed in successfully!'
          : 'Signed in successfully!',
      )
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer className="animate-fadeup py-14">
      <div className="mx-auto max-w-md">
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

        <form
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
        </form>
      </div>
    </PageContainer>
  )
}