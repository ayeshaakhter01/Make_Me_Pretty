import { useEffect, useState } from 'react'
import { apiRequest } from '../../api.js'

export default function StaffAccountPanel() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    apiRequest('/users/me').then(({ user }) => setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '' })).catch((problem) => setError(problem.message))
  }, [])

  async function saveProfile(event) {
    event.preventDefault(); setNotice(''); setError('')
    try { const { user } = await apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(profile) }); setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); setNotice('Profile updated.') }
    catch (problem) { setError(problem.message) }
  }
  async function changePassword(event) {
    event.preventDefault(); setNotice(''); setError('')
    try { await apiRequest('/users/me/password', { method: 'PATCH', body: JSON.stringify(password) }); setPassword({ currentPassword: '', newPassword: '' }); setNotice('Password changed.') }
    catch (problem) { setError(problem.message) }
  }

  return <section className="mb-6 grid gap-5 rounded-3xl border border-line bg-cream p-5 md:grid-cols-2">
    <form onSubmit={saveProfile} className="grid content-start gap-3"><h2 className="font-serif text-xl">My profile</h2>
      <label className="grid gap-1 text-xs">Name<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
      <label className="grid gap-1 text-xs">Email<input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
      <label className="grid gap-1 text-xs">Phone<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
      <button className="w-fit rounded-full bg-rose px-4 py-2 text-xs text-white">Save profile</button>
    </form>
    <form onSubmit={changePassword} className="grid content-start gap-3"><h2 className="font-serif text-xl">Change password</h2>
      <label className="grid gap-1 text-xs">Current password<input required type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></label>
      <label className="grid gap-1 text-xs">New password (8+ characters)<input required minLength={8} type="password" autoComplete="new-password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></label>
      <button className="w-fit rounded-full border border-line px-4 py-2 text-xs">Change password</button>
    </form>
    {(notice || error) && <p role="status" className={`text-sm md:col-span-2 ${error ? 'text-lowstock-text' : 'text-ink-soft'}`}>{error || notice}</p>}
  </section>
}
