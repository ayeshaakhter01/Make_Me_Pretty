import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest, saveAuthSession } from '../../api.js'
import { cx } from './adminHelpers.js'

export default function AdminLogin({ onLogin }) {
  const [role, setRole] = useState('admin')
  const [credentials, setCredentials] = useState({
    admin: { email: '', password: '' },
    partner: { email: '', password: '' },
  })
  const [showPassword, setShowPassword] = useState({
    admin: false,
    partner: false,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentCredentials = credentials[role]

  function updateCredential(field, value) {
    setCredentials((previous) => ({
      ...previous,
      [role]: { ...previous[role], [field]: value },
    }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(currentCredentials),
      })

      const { user, token } = result
      const expectedRole = role === 'partner' ? 'deliveryPartner' : 'admin'

      if (user.role !== expectedRole) {
        setError(
          role === 'admin'
            ? 'This account does not have the Admin role.'
            : 'This account does not have the Delivery Partner role.',
        )
        return
      }

      saveAuthSession({ user, token })
      onLogin({
        role,
        name: user.name,
        email: user.email,
        user,
        token,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ivory px-5 py-10">
      <div className="w-full max-w-md rounded-[22px] border border-line bg-cream p-7 shadow-[0_18px_40px_rgba(59,48,44,.09)]">
        <div className="text-center">
          <div className="font-serif text-2xl tracking-wide">Make Me Pretty</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Staff sign in
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-pink-soft p-1 text-[13px]">
          {[
            ['admin', 'Admin'],
            ['partner', 'Delivery partner'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRole(value)
                setError('')
              }}
              className={cx(
                'rounded-full py-2 transition-colors',
                role === value
                  ? 'bg-ink text-ivory'
                  : 'text-ink-soft hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-3">
          <input
            type="email"
            placeholder="Email"
            value={currentCredentials.email}
            onChange={(event) => updateCredential('email', event.target.value)}
            autoComplete="username"
            required
          />

          <div className="relative">
            <input
              type={showPassword[role] ? 'text' : 'password'}
              placeholder="Password"
              value={currentCredentials.password}
              onChange={(event) =>
                updateCredential('password', event.target.value)
              }
              autoComplete="current-password"
              className="w-full pr-12"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPassword((previous) => ({
                  ...previous,
                  [role]: !previous[role],
                }))
              }
              aria-label={showPassword[role] ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword[role]}
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
                {showPassword[role] && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>

          {error && <p className="text-[13px] text-lowstock-text">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-rose py-3 text-sm font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-4 block text-center text-xs text-ink-soft underline hover:text-rose"
        >
          ← Back to the shop
        </Link>
      </div>
    </div>
  )
}