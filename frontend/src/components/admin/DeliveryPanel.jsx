import { useState } from 'react'
import { DELIVERED, card, ghostButton, roseButton, td, th } from './adminHelpers.js'

/* DELIVERY: the list of delivery partners, how many orders each has, and a form to add one.
   Assigning an order to a partner is done in the Orders tab. */
export default function DeliveryPanel({ partners, setPartners, orders }) {
  const [form, setForm] = useState({ name: '', phone: '', area: '' })
  const [error, setError] = useState('')
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  function add(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return setError('Please enter a name and a phone number.')
    setPartners((current) => [...current, { id: `p-${Date.now()}`, name: form.name.trim(), phone: form.phone.trim(), area: form.area.trim() }])
    setForm({ name: '', phone: '', area: '' })
    setError('')
  }

  const remove = (partner) => {
    if (window.confirm(`Remove ${partner.name}?`)) setPartners((current) => current.filter((p) => p.id !== partner.id))
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {['Partner', 'Phone', 'Area', 'Assigned', 'Delivered', ''].map((heading) => <th key={heading} className={th}>{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => {
              const mine = orders.filter((o) => o.partner === partner.name)
              return (
                <tr key={partner.id}>
                  <td className={`${td} font-semibold`}>{partner.name}</td>
                  <td className={`${td} text-ink-soft`}>{partner.phone}</td>
                  <td className={`${td} text-ink-soft`}>{partner.area || '—'}</td>
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
        <input value={form.phone} onChange={set('phone')} placeholder="Phone" />
        <input value={form.area} onChange={set('area')} placeholder="Area (optional)" />
        {error && <p className="text-[13px] text-lowstock-text">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className={roseButton}>Add partner</button>
          <button type="button" onClick={() => { setForm({ name: '', phone: '', area: '' }); setError('') }} className={ghostButton}>Clear</button>
        </div>
      </form>
    </div>
  )
}
