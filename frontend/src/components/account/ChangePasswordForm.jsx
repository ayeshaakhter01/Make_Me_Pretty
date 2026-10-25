import { useState } from 'react'
import { apiRequest } from '../../api.js'
import PasswordField from '../ui/PasswordField.jsx'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

/* One change-password form for ALL roles (customer, admin, delivery partner).
   The messages appear right under the button, so they can never be missed. */
export default function ChangePasswordForm({ className = '' }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    // Checks we can do before asking the server
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters.')
    if (form.newPassword !== form.confirmPassword) return setError('New password and confirmation do not match.')
    if (form.newPassword === form.currentPassword) return setError('Choose a new password that is different from the current one.')

    setSaving(true)
    try {
      await apiRequest('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })
      setForm(EMPTY)
      setSuccess('Password changed. Use your new password the next time you sign in.')
    } catch (problem) {
      // "Failed to fetch" means the browser could not reach the backend at all.
      setError(
        problem instanceof TypeError
          ? 'Could not reach the server. Check that the backend is running.'
          : problem.message,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className={`grid gap-4 ${className}`}>
      <div>
        <h3 className="font-serif text-xl">Change password</h3>
        <p className="text-sm text-ink-soft">Enter your current password, then choose a new one.</p>
      </div>

      <PasswordField label="Current password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} disabled={saving} />
      <PasswordField label="New password (8+ characters)" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} disabled={saving} />
      <PasswordField label="Confirm new password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} disabled={saving} />

      {error && <p role="alert" className="rounded-xl bg-lowstock-bg px-4 py-2.5 text-sm text-lowstock-text">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-pink-soft px-4 py-2.5 text-sm text-rose-deep">{success}</p>}

      <button type="submit" disabled={saving} className="w-fit rounded-full bg-rose px-5 py-2 text-sm text-white transition hover:bg-rose-deep disabled:opacity-60">
        {saving ? 'Saving…' : 'Change password'}
      </button>
    </form>
  )
}
