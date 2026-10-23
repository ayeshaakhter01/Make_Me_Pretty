import { useEffect, useState } from 'react'
import { card, cx, ghostButton, roseButton, td, th } from './adminHelpers.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path, options) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...options?.headers },
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Coupon request failed.')
  return result
}

const TYPE_LABEL = { percent: '% off', fixed: '৳ off', shipping: 'Free delivery' }

/* COUPONS: list, switch on/off, add and delete promo codes. */
export default function CouponManager({ coupons, setCoupons }) {
  const [form, setForm] = useState({ code: '', type: 'percent', value: 10, note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  useEffect(() => {
    let cancelled = false
    request('/api/coupons/admin/all')
      .then(({ data }) => {
        if (cancelled) return
        setCoupons(data.map((coupon) => ({ ...coupon, id: coupon._id })))
        setError('')
      })
      .catch((problem) => {
        if (cancelled) return
        setCoupons([])
        setError(problem.message)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [setCoupons])

  async function add(event) {
    event.preventDefault()
    const code = form.code.trim().toUpperCase()
    if (!code) return setError('Please enter a coupon code.')
    if (coupons.some((c) => c.code === code)) return setError('That code already exists.')
    setSaving(true)
    try {
      const payload = { code, type: form.type, value: form.type === 'shipping' ? 0 : Number(form.value), active: true, note: form.note.trim() }
      const { data } = await request('/api/coupons', { method: 'POST', body: JSON.stringify(payload) })
      setCoupons((current) => [{ ...data, id: data._id }, ...current])
      setForm({ code: '', type: 'percent', value: 10, note: '' })
      setError('')
    } catch (problem) { setError(problem.message) } finally { setSaving(false) }
  }

  async function toggle(coupon) {
    try {
      const { data } = await request(`/api/coupons/${coupon.id}`, { method: 'PATCH', body: JSON.stringify({ active: !coupon.active }) })
      setCoupons((current) => current.map((c) => (c.id === coupon.id ? { ...data, id: data._id } : c)))
      setError('')
    } catch (problem) { setError(problem.message) }
  }
  async function remove(coupon) {
    try {
      await request(`/api/coupons/${coupon.id}`, { method: 'DELETE' })
      setCoupons((current) => current.filter((c) => c.id !== coupon.id))
      setError('')
    } catch (problem) { setError(problem.message) }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {['Code', 'Discount', 'Note', 'Status', ''].map((heading) => <th key={heading} className={th}>{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className={td} colSpan="5">Loading coupons from database…</td></tr>}
            {!loading && coupons.length === 0 && <tr><td className={td} colSpan="5">No coupons in the database yet.</td></tr>}
            {coupons.map((coupon) => (
              <tr key={coupon.id || coupon.code}>
                <td className={`${td} font-semibold`}>{coupon.code}</td>
                <td className={td}>{coupon.type === 'shipping' ? TYPE_LABEL.shipping : `${coupon.value}${coupon.type === 'percent' ? '%' : ' ৳'} off`}</td>
                <td className={`${td} text-ink-soft`}>{coupon.note || '—'}</td>
                <td className={td}>
                  <button type="button" onClick={() => toggle(coupon)} className={cx('rounded-full px-3 py-1 text-[11px] font-medium transition-colors', coupon.active ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>
                    {coupon.active ? 'Active' : 'Off'}
                  </button>
                </td>
                <td className={td}><button type="button" onClick={() => remove(coupon)} className="text-xs text-ink-soft underline hover:text-rose">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className={`grid content-start gap-3 p-5 ${card}`}>
        <h3 className="font-serif text-lg">New coupon</h3>
        <input value={form.code} onChange={set('code')} placeholder="CODE (e.g. EID15)" />
        <select value={form.type} onChange={set('type')}>
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount off</option>
          <option value="shipping">Free delivery</option>
        </select>
        {form.type !== 'shipping' && <input type="number" min="0" value={form.value} onChange={set('value')} placeholder="Amount" />}
        <input value={form.note} onChange={set('note')} placeholder="Note (optional)" />
        {error && <p role="alert" className="text-[13px] text-lowstock-text">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving || loading} className={roseButton}>{saving ? 'Saving…' : 'Add coupon'}</button>
          <button type="button" onClick={() => { setForm({ code: '', type: 'percent', value: 10, note: '' }); setError('') }} className={ghostButton}>Clear</button>
        </div>
      </form>
    </div>
  )
}
