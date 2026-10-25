import { useState } from 'react'
import { apiRequest } from '../../api.js'

/* "Send me a new verification email" button, shared by the sign-in page and the verify page.
   In sandbox mode the server also returns a link to the test email, shown here. */
export default function ResendVerification({ email, onSandboxLink, className = '' }) {
  const [state, setState] = useState({ busy: false, message: '', error: '', sandboxLink: '' })

  async function resend() {
    setState({ busy: true, message: '', error: '', sandboxLink: '' })
    try {
      const result = await apiRequest('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })
      setState({ busy: false, message: result.message, error: '', sandboxLink: result.sandboxLink || '' })
      if (result.sandboxLink) onSandboxLink?.(result.sandboxLink)
    } catch (problem) {
      setState({ busy: false, message: '', error: problem.message, sandboxLink: '' })
    }
  }

  return (
    <div className={`grid gap-2 text-sm ${className}`}>
      <button type="button" onClick={resend} disabled={state.busy || !email} className="w-fit rounded-full border border-rose px-4 py-2 text-xs font-medium text-rose-deep transition hover:bg-rose hover:text-white disabled:opacity-60">
        {state.busy ? 'Sending…' : 'Send a new verification email'}
      </button>
      {state.message && <p role="status" className="text-ink-soft">{state.message}</p>}
      {state.error && <p role="alert" className="text-rose-deep">{state.error}</p>}
      {state.sandboxLink && <SandboxLink href={state.sandboxLink} />}
    </div>
  )
}

export function SandboxLink({ href }) {
  return (
    <p className="rounded-xl bg-pink-soft px-3 py-2 text-xs text-ink-soft">
      <strong>Sandbox mode:</strong> no real email was sent. <a href={href} target="_blank" rel="noreferrer" className="text-rose-deep underline">Open the test email</a>
    </p>
  )
}
