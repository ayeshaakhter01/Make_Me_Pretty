import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api.js'
import { card, cx, ghostButton } from './adminHelpers.js'

const FILTERS = [
  { value: 'all', label: 'All messages' },
  { value: 'new', label: 'New' },
  { value: 'inProgress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
]
const STATUS_LABELS = { new: 'New', inProgress: 'In progress', resolved: 'Resolved', archived: 'Archived' }
const STATUS_TONES = { new: 'bg-pink text-rose-deep', inProgress: 'bg-gold-soft text-gold', resolved: 'bg-emerald-100 text-emerald-800', archived: 'bg-line/50 text-ink-soft' }

function ContactMessageCard({ message, onStatusChange, saving }) {
  const date = new Date(message.createdAt)
  return <article className={`${card} p-5 sm:p-6`}>
    <div className="flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-medium text-ink">{message.name}</h2>
          <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium', STATUS_TONES[message.status])}>{STATUS_LABELS[message.status] || message.status}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          <a href={`mailto:${message.email}`} className="underline underline-offset-2">{message.email}</a>
          {message.phone && <a href={`tel:${message.phone}`} className="underline underline-offset-2">{message.phone}</a>}
          <time dateTime={message.createdAt}>{Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()}</time>
        </div>
      </div>
      <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
        Status
        <select value={message.status} disabled={saving} onChange={(event) => onStatusChange(message._id, event.target.value)} className="!w-auto !min-w-36 !rounded-xl !py-2 !text-xs normal-case tracking-normal">
          {FILTERS.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </div>
    {message.subject && <h3 className="mt-4 font-medium">{message.subject}</h3>}
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft">{message.message}</p>
  </article>
}

export default function ContactMessagesPanel() {
  const [filter, setFilter] = useState('new')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  const loadMessages = useCallback(async ({ showRefresh = false } = {}) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const query = filter === 'all' ? '' : `?status=${encodeURIComponent(filter)}`
      const result = await apiRequest(`/admin/contact-messages${query}`)
      setMessages(Array.isArray(result) ? result : [])
      setError('')
    } catch (problem) {
      setError(problem.message || 'Could not load contact messages.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter])

  useEffect(() => {
    let cancelled = false
    const query = filter === 'all' ? '' : `?status=${encodeURIComponent(filter)}`
    apiRequest(`/admin/contact-messages${query}`)
      .then((result) => { if (!cancelled) { setMessages(Array.isArray(result) ? result : []); setError('') } })
      .catch((problem) => { if (!cancelled) setError(problem.message || 'Could not load contact messages.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filter])

  async function updateStatus(id, status) {
    setSavingId(id)
    try {
      const updated = await apiRequest(`/admin/contact-messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessages((current) => filter === 'all' ? current.map((message) => message._id === id ? updated : message) : current.filter((message) => message._id !== id || updated.status === filter))
      setError('')
    } catch (problem) {
      setError(problem.message || 'Could not update message status.')
    } finally {
      setSavingId('')
    }
  }

  return <section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-serif text-2xl">Contact messages</h1>
        <p className="mt-1 text-sm text-ink-soft">Messages sent through the Contact page are stored here.</p>
      </div>
      <button type="button" onClick={() => loadMessages({ showRefresh: true })} disabled={loading || refreshing} className={ghostButton}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
    </div>
    {error && <p role="alert" className="mb-4 text-sm text-lowstock-text">{error}</p>}
    <div className="mb-4 flex flex-wrap gap-2">
      {FILTERS.map((option) => <button key={option.value} type="button" onClick={() => setFilter(option.value)} className={cx('rounded-full border-[1.5px] px-4 py-2 text-[13px] transition-all', filter === option.value ? 'border-ink bg-ink text-ivory' : 'border-line bg-cream text-ink-soft hover:border-rose hover:text-rose')}>{option.label}</button>)}
    </div>
    {loading ? <p className={`${card} p-6 text-sm text-ink-soft`}>Loading contact messages…</p> : messages.length === 0 ? <p className={`${card} p-6 text-sm text-ink-soft`}>No messages in this view.</p> : <div className="grid gap-3">{messages.map((message) => <ContactMessageCard key={message._id} message={message} onStatusChange={updateStatus} saving={savingId === message._id} />)}</div>}
  </section>
}
