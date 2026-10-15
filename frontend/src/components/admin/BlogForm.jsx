import { useState } from 'react'
import Modal from './Modal.jsx'
import ImageField from './ImageField.jsx'
import { ghostButton, roseButton } from './adminHelpers.js'

const TAGS = ['Ingredients', 'Habits', 'Hair Care', 'Skincare 101', 'DIY Skincare', 'Reminder', 'Tutorial', 'Tips']

/* Add / edit a blog post in a pop-up. `post` is empty for "New post", filled for "Edit".
   The body is typed as plain text: a blank line starts a new paragraph. */
export default function BlogForm({ post, onSave, onClose }) {
  const isEdit = Boolean(post)
  const [form, setForm] = useState({
    title: post?.title ?? '',
    tag: post?.tag ?? 'Tips',
    read: post?.read ?? '3 min read',
    excerpt: post?.excerpt ?? '',
    body: Array.isArray(post?.body) ? post.body.join('\n\n') : '',
    images: post?.image ? [post.image] : [],
    active: post?.active ?? true,
  })
  const [error, setError] = useState('')

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  function submit(event) {
    event.preventDefault()
    const paragraphs = form.body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)
    if (!form.title.trim()) return setError('Please enter a title.')
    if (paragraphs.length === 0) return setError('Please write the post text.')
    onSave({
      id: post?.id ?? `blog-${Date.now()}`,
      title: form.title.trim(),
      tag: form.tag.trim() || 'Tips',
      read: form.read.trim() || '3 min read',
      excerpt: form.excerpt.trim(),
      body: paragraphs,
      image: form.images[0] ?? '',
      active: form.active,
    })
  }

  return (
    <Modal title={isEdit ? 'Edit post' : 'New post'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs text-ink-soft sm:col-span-2">
          Title
          <input value={form.title} onChange={set('title')} placeholder="5 steps to a monsoon-proof glow" />
        </label>

        <label className="grid gap-1.5 text-xs text-ink-soft">
          Topic
          <input value={form.tag} onChange={set('tag')} list="blog-topics" placeholder="Pick or type a topic" />
          <datalist id="blog-topics">{TAGS.map((tag) => <option key={tag} value={tag} />)}</datalist>
        </label>

        <label className="grid gap-1.5 text-xs text-ink-soft">
          Read time
          <input value={form.read} onChange={set('read')} placeholder="3 min read" />
        </label>

        <label className="grid gap-1.5 text-xs text-ink-soft sm:col-span-2">
          Short teaser (shown on the card, {form.excerpt.length}/140)
          <input value={form.excerpt} onChange={set('excerpt')} maxLength={140} placeholder="One line that makes people want to read more" />
        </label>

        <label className="grid gap-1.5 text-xs text-ink-soft sm:col-span-2">
          Post text (leave a blank line between paragraphs)
          <textarea rows={10} value={form.body} onChange={set('body')} placeholder="Write the full post here..." />
        </label>

        {/* a <div>, not a <label>: a label around buttons would "click" them when its text is clicked */}
        <div className="grid gap-1.5 text-xs text-ink-soft sm:col-span-2">
          Cover photo
          <ImageField images={form.images} onChange={(images) => setForm((current) => ({ ...current, images }))} max={1} maxSide={900} quality={0.78} />
          <span className="text-[11.5px]">Wide photos look best. Without one, the card shows a soft pink block.</span>
        </div>

        <label className="flex items-center gap-2.5 text-[13px] sm:col-span-2">
          <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
          Show this post on the shop
        </label>

        {error && <p className="text-[13px] text-lowstock-text sm:col-span-2">{error}</p>}
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={roseButton}>{isEdit ? 'Save changes' : 'Publish post'}</button>
          <button type="button" onClick={onClose} className={ghostButton}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}
