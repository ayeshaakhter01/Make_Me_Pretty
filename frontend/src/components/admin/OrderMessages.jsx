import { useEffect, useRef, useState } from 'react'
import { cx, roseButton, timeLabel } from './adminHelpers.js'

/* =============================================================================
   CHAT about ONE order between the admin and the delivery partner.
   `me` says who is looking:  { from: 'admin' | 'partner', name: '...' }
   Every message is saved as { id, orderId, from, name, kind, text, at }.
   kind = 'message' (normal), 'issue' (a reported problem) or 'location' (a map link)
============================================================================= */
export default function OrderMessages({ order, messages, setMessages, me }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const thread = messages.filter((message) => message.orderId === order.id)

  /* scroll to the newest message */
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [thread.length])

  function send(event) {
    event.preventDefault()
    if (!text.trim()) return
    setMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, orderId: order.id, from: me.from, name: me.name, kind: 'message', text: text.trim(), at: new Date().toISOString() },
    ])
    setText('')
  }

  return (
    <div>
      <div className="mb-3 max-h-72 min-h-[140px] overflow-y-auto rounded-2xl border border-line bg-cream p-3">
        {thread.length === 0 && <p className="py-8 text-center text-sm text-ink-soft">No messages yet. Say hello.</p>}
        {thread.map((message) => {
          const mine = message.from === me.from
          return (
            <div key={message.id} className={cx('mb-2 flex flex-col', mine ? 'items-end' : 'items-start')}>
              <div className={cx('max-w-[85%] rounded-2xl px-3.5 py-2 text-sm', mine ? 'bg-rose text-white' : 'bg-pink-soft text-ink')}>
                {message.kind === 'issue' && <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] opacity-80">Problem reported</div>}
                {message.text}
                {message.kind === 'location' && (
                  <a href={message.link} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline">Open location in Maps ↗</a>
                )}
              </div>
              <div className="mt-0.5 text-[10px] text-ink-soft">{message.name} · {timeLabel(message.at)}</div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder={me.from === 'admin' ? 'Reply to the delivery partner...' : 'Message the admin...'} />
        <button type="submit" className={`${roseButton} shrink-0`}>Send</button>
      </form>
    </div>
  )
}
