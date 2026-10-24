import { useState } from 'react'
import BlogForm from './BlogForm.jsx'
import { imageSrc } from './imageHelpers.js'
import { card, cx, roseButton } from './adminHelpers.js'
import { apiFetch } from '../../api.js'

/* BLOG: write, edit, reorder, hide and delete posts.
   The order of this list is the order on the shop's "Our Blog" section,
   and hidden posts are left out there. */
export default function BlogManager({ posts, setPosts }) {
  const [editing, setEditing] = useState(null) // null = closed, 'new' = write a post, or a post

  const shown = posts.filter((post) => post.active).length

  
  async function save(post) {
    const existing = posts.some((p) => p.id === post.id)

    const payload = {
      title: post.title,
      tag: post.tag,
      read: post.read,
      excerpt: post.excerpt,
      body: post.body,
      image: post.image,
      status: post.active ? 'published' : 'draft',
      order: existing ? (post.order ?? 0) : 0,
    }

    try {
      const response = await apiFetch(
        existing
          ? `/blogs/${post.id}`
          : '/blogs',
        {
          method: existing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Could not save the blog post.'
        )
      }

      const savedPost = {
        ...result.data,
        id: result.data._id,
        active: result.data.status === 'published',
      }

      setPosts((current) =>
        existing
          ? current.map((p) =>
              p.id === post.id ? savedPost : p
            )
          : [savedPost, ...current]
      )

      setEditing(null)
    } catch (error) {
      console.error('Could not save blog post:', error)
      window.alert(error.message || 'Could not save the blog post.')
    }
  }


  
  async function toggle(id) {
    const post = posts.find((p) => p.id === id)
    if (!post) return

    const nextActive = !post.active

    try {
      const response = await apiFetch(`/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextActive ? 'published' : 'draft',
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Could not update visibility.')
      }

      setPosts((current) =>
        current.map((p) =>
          p.id === id
            ? { ...p, ...result.data, id: result.data._id, active: result.data.status === 'published' }
            : p
        )
      )
    } catch (error) {
      window.alert(error.message || 'Could not update blog visibility.')
    }
  }

  
  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return

    try {
      const response = await apiFetch(
        `/blogs/${post.id}`,
        { method: 'DELETE' }
      )

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Could not delete blog post.')
      }

      setPosts((current) => current.filter((p) => p.id !== post.id))
    } catch (error) {
      window.alert(error.message || 'Could not delete blog post.')
    }
  }


  /* swap a post with its neighbour (direction -1 = up, 1 = down) */
  
  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= posts.length) return

    const next = [...posts]
    ;[next[index], next[target]] = [next[target], next[index]]

    const reordered = next.map((post, position) => ({
      ...post,
      order: position,
    }))

    try {
      const responses = await Promise.all(
        reordered.map((post) =>
          apiFetch(`/blogs/${post.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: post.order }),
          })
        )
      )

      const failedResponse = responses.find((response) => !response.ok)

      if (failedResponse) {
        throw new Error('Could not save the new blog order.')
      }

      setPosts(reordered)
    } catch (error) {
      window.alert(error.message || 'Could not reorder blog posts.')
    }
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
