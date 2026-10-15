import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_LOGINS } from '../../data/adminSeed.js'
import { cx } from './adminHelpers.js'

/* Login screen for the Admin and the Delivery Partner.
   There is no server yet, so we only compare with the demo logins in adminSeed.js. */
export default function AdminLogin({ onLogin }) {
  const [role, setRole] = useState('admin') // 'admin' or 'partner'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const demo = DEMO_LOGINS[role]

  function submit(event) {
    event.preventDefault()
    if (email.trim().toLowerCase() === demo.email && password === demo.password) {
      onLogin({ role, name: demo.name, email: demo.email })
    } else {
      setError('Wrong email or password. Use the demo login shown below.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ivory px-5 py-10">
      <div className="w-full max-w-md rounded-[22px] border border-line bg-cream p-7 shadow-[0_18px_40px_rgba(59,48,44,.09)]">
        <div className="text-center">
          <div className="font-serif text-2xl tracking-wide">Make Me Pretty</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft">Staff sign in</div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-pink-soft p-1 text-[13px]">
          {[['admin', 'Admin'], ['partner', 'Delivery partner']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setRole(value); setError('') }}
              className={cx('rounded-full py-2 transition-colors', role === value ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink')}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-3">
          <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="text-[13px] text-lowstock-text">{error}</p>}
          <button type="submit" className="rounded-full bg-rose py-3 text-sm font-medium text-white transition-colors hover:bg-rose-deep">Sign in</button>
        </form>

        <p className="mt-5 rounded-2xl bg-pink-soft px-4 py-3 text-[12.5px] leading-5 text-ink-soft">
          Demo login — email: <strong className="text-ink">{demo.email}</strong>, password: <strong className="text-ink">{demo.password}</strong>
        </p>
        <Link to="/" className="mt-4 block text-center text-xs text-ink-soft underline hover:text-rose">← Back to the shop</Link>
      </div>
    </div>
  )
}
