import { useState } from 'react'
import BlogForm from './BlogForm.jsx'
import { imageSrc } from './imageHelpers.js'
import { card, cx, roseButton } from './adminHelpers.js'

/* BLOG: write, edit, reorder, hide and delete posts.
   The order of this list is the order on the shop's "Our Blog" section,
   and hidden posts are left out there. */
export default function BlogManager({ posts, setPosts }) {
  const [editing, setEditing] = useState(null) // null = closed, 'new' = write a post, or a post

  const shown = posts.filter((post) => post.active).length

  function save(post) {
    setPosts((current) =>
      current.some((p) => p.id === post.id)
        ? current.map((p) => (p.id === post.id ? post : p)) // edit
        : [post, ...current], // new posts go to the top
    )
    setEditing(null)
  }

  const toggle = (id) => setPosts((current) => current.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  const remove = (post) => {
    if (window.confirm(`Delete "${post.title}"?`)) setPosts((current) => current.filter((p) => p.id !== post.id))
  }

  /* swap a post with its neighbour (direction -1 = up, 1 = down) */
  function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= posts.length) return
    setPosts((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-[13px] text-ink-soft">{posts.length} posts · {shown} showing on the shop</p>
        <button type="button" onClick={() => setEditing('new')} className={`${roseButton} sm:ml-auto`}>+ New post</button>
      </div>

      <div className="grid gap-3">
        {posts.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No posts yet. Write your first one!</p>}

        {posts.map((post, index) => (
          <div key={post.id} className={cx(`${card} flex flex-wrap items-center gap-4 p-4`, !post.active && 'opacity-60')}>
            <span className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-pink-soft">
              {post.image && <img src={imageSrc(post.image)} alt="" className="size-full object-cover" />}
            </span>

            <div className="min-w-0 flex-1 basis-56">
              <div className="truncate font-serif text-lg leading-tight">{post.title}</div>
              <div className="text-xs text-rose">{post.tag} · {post.read}</div>
              <div className="truncate text-sm text-ink-soft">{post.excerpt || post.body?.[0] || '—'}</div>
            </div>

            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move "${post.title}" up`} className="size-8 rounded-full border border-line text-xs text-ink-soft transition-colors hover:border-rose hover:text-rose disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === posts.length - 1} aria-label={`Move "${post.title}" down`} className="size-8 rounded-full border border-line text-xs text-ink-soft transition-colors hover:border-rose hover:text-rose disabled:opacity-30">↓</button>
            </div>

            <button type="button" onClick={() => toggle(post.id)} className={cx('rounded-full px-3 py-1 text-[11px] font-medium', post.active ? 'bg-gold-soft text-gold' : 'bg-pink text-rose-deep')}>
              {post.active ? 'Showing' : 'Hidden'}
            </button>
            <div className="flex gap-4 text-xs">
              <button type="button" onClick={() => setEditing(post)} className="text-ink-soft underline hover:text-rose">Edit</button>
              <button type="button" onClick={() => remove(post)} className="text-ink-soft underline hover:text-rose">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && <BlogForm post={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}
