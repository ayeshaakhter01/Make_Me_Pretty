import { useEffect, useState } from 'react'
import ProductForm from './ProductForm.jsx'
import ProductArtwork from '../products/ProductArtwork.jsx'
import { card, cx, money, roseButton, td, th } from './adminHelpers.js'
import { apiRequest, assetUrl } from '../../api.js'

/* The small picture in the product list: the first photo, or the bottle drawing if there are no photos yet. */
function Thumb({ product }) {
  const photo = product.images?.[0]
  return (
    <span className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
      {photo
        ? <img src={assetUrl(photo)} alt={product.name} className="size-full object-cover" />
        : <ProductArtwork product={product} size={0.26} className="size-full" />}
      {product.images?.length > 1 && (
        <span className="absolute bottom-0.5 right-0.5 rounded-full bg-ink/75 px-1.5 text-[9px] font-medium text-ivory">{product.images.length}</span>
      )}
    </span>
  )
}

/* INVENTORY: the product list with search, stock alerts, photos, add / edit / delete. */
export default function InventoryManager({ products, setProducts }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, 'new' = add, or a product
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let current = true
    apiRequest('/products/admin/all')
      .then((result) => { if (current) setProducts(result.map((p) => ({ ...p, id: p._id, old: p.compareAt, desc: p.description, ing: p.ingredients || [] }))) })
      .catch((problem) => { if (current) setError(problem.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [setProducts])
  const text = search.trim().toLowerCase()

  const visible = products.filter((p) =>
    !text || `${p.name} ${p.brand} ${p.category} ${p.type}`.toLowerCase().includes(text)
  )

  async function save(product) {
    const exists = products.some((p) => p.id === product.id && /^[\da-f]{24}$/i.test(String(p.id)))
    const payload = {
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: product.name, brand: product.brand, category: product.category, type: product.type,
      size: product.size || '', sourceUrl: product.sourceUrl || '',
      price: Number(product.price), compareAt: product.old === '' ? null : Number(product.old),
      images: product.images || [], description: product.description || product.desc || product.name,
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : (product.ing || []),
      usage: product.usage || '', skin: product.skin || '', stock: Number(product.stock) || 0,
      badge: product.badge || '', active: product.active !== false,
    }
    try {
      const saved = await apiRequest(exists ? `/products/${product.id}` : '/products', { method: exists ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      const formatted = { ...saved, id: saved._id, old: saved.compareAt, desc: saved.description, ing: saved.ingredients || [] }
      setProducts((current) => exists ? current.map((p) => p.id === product.id ? formatted : p) : [formatted, ...current])
      setEditing(null)
      setError('')
    } catch (problem) { setError(problem.message) }
  }

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    try {
      await apiRequest(`/products/${product.id}`, { method: 'DELETE' })
      setProducts((current) => current.filter((p) => p.id !== product.id))
    } catch (problem) { setError(problem.message) }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, categories..." className="!w-full sm:!w-80" />
        <button type="button" onClick={() => setEditing('new')} className={`${roseButton} sm:ml-auto`}>+ Add product</button>
      </div>
      {loading && <p className="mb-3 text-sm text-ink-soft">Loading products from database…</p>}
      {error && <p role="alert" className="mb-3 text-sm text-lowstock-text">{error}</p>}

      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {['Product', 'Category', 'Brand', 'Price', 'Stock', 'Actions'].map((heading) => <th key={heading} className={th}>{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-soft">No products found.</td></tr>
            ) : visible.map((product) => (
              <tr key={product.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <Thumb product={product} />
                    <div className="min-w-0">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-ink-soft">{product.type}{product.size ? ` · ${product.size}` : ''}{product.badge ? ` · ${product.badge}` : ''}</div>
                      {!product.active && <div className="mt-1 text-[10px] font-semibold uppercase text-gold">Draft · add local price, stock & photo</div>}
                    </div>
                  </div>
                </td>
                <td className={td}>{product.category}</td>
                <td className={`${td} text-ink-soft`}>{product.brand || '—'}</td>
                <td className={td}>{money(product.price)}{product.old ? <span className="ml-1.5 text-xs text-ink-soft line-through">{money(product.old)}</span> : null}</td>
                <td className={td}>
                  <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium', product.stock <= 5 ? 'bg-lowstock-bg text-lowstock-text' : 'bg-gold-soft text-gold')}>
                    {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Low · ${product.stock}` : `${product.stock} in stock`}
                  </span>
                </td>
                <td className={td}>
                  <div className="flex gap-4 whitespace-nowrap text-xs">
                    <button type="button" onClick={() => setEditing(product)} className="text-ink-soft underline hover:text-rose">Edit</button>
                    <button type="button" onClick={() => remove(product)} className="text-ink-soft underline hover:text-rose">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm product={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
