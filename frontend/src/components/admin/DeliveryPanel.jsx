import { useState } from 'react'
import { DELIVERED, card, ghostButton, roseButton, td, th } from './adminHelpers.js'
import { apiRequest } from '../../api.js'

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' }

/* DELIVERY: the list of delivery partners, how many orders each has, and a form to add one.
   Partners are real accounts (users with the deliveryPartner role) saved in the database.
   Assigning an order to a partner is done in the Orders tab. */
export default function DeliveryPanel({ partners, setPartners, orders }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  async function add(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return setError('Please enter a name, an email and a phone number.')
    if (form.password.length < 8) return setError('The password needs at least 8 characters.')
    setSaving(true)
    try {
      const result = await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password, role: 'deliveryPartner' }),
      })
      setPartners((current) => [...current, { id: result.user.id, name: result.user.name, phone: result.user.phone || '' }])
      setForm(EMPTY_FORM)
      setError('')
    } catch (problem) {
      setError(problem.message || 'Could not add this delivery partner.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(partner) {
    if (!window.confirm(`Remove ${partner.name}? Their account will be deleted.`)) return
    try {
      await apiRequest(`/admin/users/${partner.id}`, { method: 'DELETE' })
      setPartners((current) => current.filter((p) => p.id !== partner.id))
    } catch (problem) {
      window.alert(problem.message || 'Could not remove this delivery partner.')
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {['Partner', 'Phone', 'Assigned', 'Delivered', ''].map((heading) => <th key={heading} className={th}>{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => {
              const mine = orders.filter((o) => o.partner === partner.id)
              return (
                <tr key={partner.id}>
                  <td className={`${td} font-semibold`}>{partner.name}</td>
                  <td className={`${td} text-ink-soft`}>{partner.phone || '—'}</td>
                  <td className={td}>{mine.length}</td>
                  <td className={td}>{mine.filter((o) => o.status === DELIVERED).length}</td>
                  <td className={td}><button type="button" onClick={() => remove(partner)} className="text-xs text-ink-soft underline hover:text-rose">Remove</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className={`grid content-start gap-3 p-5 ${card}`}>
        <h3 className="font-serif text-lg">New delivery partner</h3>
        <input value={form.name} onChange={set('name')} placeholder="Full name" />
        <input type="email" value={form.email} onChange={set('email')} placeholder="Email (used to sign in)" />
        <input value={form.phone} onChange={set('phone')} placeholder="Phone" />
        <input type="password" value={form.password} onChange={set('password')} placeholder="Password (8+ characters)" />
        {error && <p className="text-[13px] text-lowstock-text">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={roseButton}>{saving ? 'Adding…' : 'Add partner'}</button>
          <button type="button" onClick={() => { setForm(EMPTY_FORM); setError('') }} className={ghostButton}>Clear</button>
        </div>
      </form>
    </div>
  )
}
