import { useEffect, useState } from 'react'
import { apiRequest } from '../../api.js'
import ChangePasswordForm from '../account/ChangePasswordForm.jsx'

/* "My account" panel for staff: used by BOTH the admin dashboard and the
   delivery-partner dashboard. Profile on the left, password on the right. */
export default function StaffAccountPanel() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/users/me')
      .then(({ user }) => setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '' }))
      .catch((problem) => setError(problem.message))
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    setNotice('')
    setError('')
    try {
      const { user } = await apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(profile) })
      setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
      setNotice('Profile updated.')
    } catch (problem) {
      setError(problem.message)
    }
  }

  return (
    <section className="mb-6 grid gap-6 rounded-3xl border border-line bg-cream p-5 md:grid-cols-2">
      <form onSubmit={saveProfile} className="grid content-start gap-3">
        <h2 className="font-serif text-xl">My profile</h2>
        <label className="grid gap-1 text-xs">Name<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
        <label className="grid gap-1 text-xs">Email<input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
        <label className="grid gap-1 text-xs">Phone<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
        <button className="w-fit rounded-full bg-rose px-4 py-2 text-xs text-white">Save profile</button>
        {error && <p role="alert" className="rounded-xl bg-lowstock-bg px-4 py-2.5 text-sm text-lowstock-text">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-pink-soft px-4 py-2.5 text-sm text-rose-deep">{notice}</p>}
      </form>

      <ChangePasswordForm className="content-start" />
    </section>
  )
}
