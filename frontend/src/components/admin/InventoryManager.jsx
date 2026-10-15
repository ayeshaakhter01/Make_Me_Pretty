import { useState } from 'react'
import ProductForm from './ProductForm.jsx'
import ProductArtwork from '../products/ProductArtwork.jsx'
import { card, cx, money, roseButton, td, th } from './adminHelpers.js'

/* The small picture in the product list: the first photo, or the bottle drawing if there are no photos yet. */
function Thumb({ product }) {
  const photo = product.images?.[0]
  return (
    <span className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
      {photo
        ? <img src={photo} alt={product.name} className="size-full object-cover" />
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
  const text = search.trim().toLowerCase()

  const visible = products.filter((p) =>
    !text || `${p.name} ${p.brand} ${p.category} ${p.type}`.toLowerCase().includes(text)
  )

  function save(product) {
    setProducts((current) =>
      current.some((p) => p.id === product.id)
        ? current.map((p) => (p.id === product.id ? product : p)) // edit
        : [product, ...current], // add (new product goes to the top)
    )
    setEditing(null)
  }

  const remove = (product) => {
    if (window.confirm(`Delete "${product.name}"?`)) setProducts((current) => current.filter((p) => p.id !== product.id))
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, categories..." className="!w-full sm:!w-80" />
        <button type="button" onClick={() => setEditing('new')} className={`${roseButton} sm:ml-auto`}>+ Add product</button>
      </div>

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
                      <div className="text-xs text-ink-soft">{product.type}{product.badge ? ` · ${product.badge}` : ''}</div>
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
