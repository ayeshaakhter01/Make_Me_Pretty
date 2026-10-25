import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../../api.js'

/* POLICIES (inside the Footer tab)
   Every policy is a document in the "policies" collection (API: /api/policies).
   The customer page is /p/<address>; the address is made from the title when the policy is created and then never changes.
   The footer's "Customer policy" links are built automatically from the published policies. */
const inputClass = 'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm'
const buttonClass = 'rounded-full border border-line px-4 py-2 text-sm hover:border-rose'
const primaryClass = 'rounded-full bg-rose px-4 py-2 text-sm text-white disabled:opacity-60'
const EMPTY = { id: null, title: '', content: '', published: true, slug: '' }

export default function PolicyManager() {
  const formRef = useRef(null)
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let current = true
    apiRequest('/policies/admin/all')
      .then((list) => { if (current) setPolicies(list) })
      .catch((problem) => { if (current) setError(problem.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [version])

  const refresh = () => setVersion((value) => value + 1)
  const reset = () => { setForm(EMPTY); setError('') }

  function edit(policy) {
    setForm({ id: policy._id, title: policy.title, content: policy.content || '', published: policy.published !== false, slug: policy.slug })
    setError('')
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  async function save(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim()) { setError('Please fill in the title and the policy content.'); return }
    setSaving(true)
    setError('')
    try {
      const body = JSON.stringify({ title: form.title, content: form.content, published: form.published })
      await apiRequest(form.id ? `/policies/${form.id}` : '/policies', { method: form.id ? 'PATCH' : 'POST', body })
      reset()
      refresh()
    } catch (problem) { setError(problem.message) } finally { setSaving(false) }
  }

  async function remove(policy) {
    if (!window.confirm(`Delete “${policy.title}”? Customers will no longer see this page.`)) return
    try {
      await apiRequest(`/policies/${policy._id}`, { method: 'DELETE' })
      if (form.id === policy._id) reset()
      refresh()
    } catch (problem) { setError(problem.message) }
  }

  return <div className="mb-5 grid gap-5">
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="font-serif text-xl">Policies</h2>
      <p className="mb-4 mt-1 text-sm text-ink-soft">Manage the policy pages shown on your website. They are saved in the database.</p>
      <div className="divide-y divide-line">
        {loading && <p className="py-4 text-sm text-ink-soft">Loading policies from database…</p>}
        {!loading && policies.length === 0 && <p className="py-4 text-sm text-ink-soft">No policies yet. Use the form below to add one, or run <code>node scripts/seedPolicies.js</code> in the backend.</p>}
        {policies.map((policy) => <div key={policy._id} className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="font-medium">{policy.title}</p>
            {policy.published === false && <p className="text-xs text-ink-soft">Draft · hidden from customers</p>}
          </div>
          <div className="flex shrink-0 gap-3">
            <button type="button" onClick={() => edit(policy)} className="text-sm underline">Edit</button>
            <button type="button" onClick={() => remove(policy)} className="text-sm underline">Delete</button>
          </div>
        </div>)}
      </div>
    </section>
    <section ref={formRef} className="scroll-mt-5 rounded-2xl border border-line bg-white p-5">
      <h2 className="font-serif text-xl">{form.id ? 'Edit Policy' : 'Add New Policy'}</h2>
      <p className="mb-4 mt-1 text-sm text-ink-soft">{form.id ? `Changes are saved to the database. Page address: /p/${form.slug}` : 'The page address is made from the title.'}</p>
      <form onSubmit={save} className="grid gap-3">
        <label className="grid gap-1 text-sm">Policy Title<input className={inputClass} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Shipping Policy" maxLength={120} /></label>
        <label className="grid gap-1 text-sm">Policy Content<textarea className={inputClass} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Write the complete policy here..." rows={18} />
          <span className="text-xs text-ink-soft">Format: start a heading with ## , a bullet with - , a numbered step with 1. , and write a link as [text](/p/page). Leave a blank line between blocks.</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} />Published — visible to customers</label>
        {error && <p role="alert" className="text-sm text-lowstock-text">{error}</p>}
        <div className="flex gap-2"><button className={primaryClass} type="submit" disabled={saving}>{saving ? 'Saving…' : form.id ? 'Save Changes' : 'Save Policy'}</button><button className={buttonClass} type="button" onClick={reset}>Clear Form</button></div>
      </form>
    </section>
  </div>
}
