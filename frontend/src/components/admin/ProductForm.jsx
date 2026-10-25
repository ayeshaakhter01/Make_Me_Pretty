import { useState } from 'react'
import Modal from './Modal.jsx'
import ImageField from './ImageField.jsx'
import { ghostButton, roseButton } from './adminHelpers.js'

const CATEGORIES = ['Skincare', 'Body Care', 'Hair Care', 'Makeup']
const BADGES = ['', 'Featured', 'New', 'Bestseller']
const MAX_PHOTOS = 5

/* Add / edit form in a pop-up. `product` is empty for "Add", filled for "Edit".
   onSave(product) gives the finished product back to InventoryManager. */
export default function ProductForm({ product, onSave, onClose }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(
    // `images: []` first so products saved before photos existed still open fine
    { images: [], ...(product ?? { name: '', category: 'Skincare', type: '', brand: '', size: '', sourceUrl: '', price: '', old: '', stock: 0, badge: '', description: '', active: true }) },
  )
  const [error, setError] = useState('')

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim()) return setError('Please enter the product name.')
    if (form.active && !form.description?.trim() && !form.desc?.trim()) return setError('Add the product description from its packaging or manufacturer.')
    if (form.active && !form.usage?.trim()) return setError('Add the manufacturer’s directions for use.')
    const ingredientList = Array.isArray(form.ingredients) ? form.ingredients : String(form.ingredients || form.ing || '').split(',').map((item) => item.trim()).filter(Boolean)
    if (form.active && (!Number(form.price) || Number(form.price) <= 0)) return setError('Please enter a price above 0.')
    Promise.resolve(onSave({
      ...form,
      id: form.id ?? `p-${Date.now()}`,
      name: form.name.trim(),
      price: Number(form.price) || 0,
      old: form.old === '' ? '' : Number(form.old),
      stock: Number(form.stock) || 0,
      active: Boolean(form.active),
      ingredients: ingredientList,
    })).catch((problem) => setError(problem.message || 'Could not save the product.'))
  }

  return (
    <Modal title={isEdit ? 'Edit product' : 'Add product'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" wide><input value={form.name} onChange={set('name')} placeholder="e.g. Rose Dew Cleanser" /></Field>
        <Field label="Category">
          <select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="Type"><input value={form.type} onChange={set('type')} placeholder="Cleanser, Serum, Lip..." /></Field>
        <Field label="Brand"><input value={form.brand} onChange={set('brand')} placeholder="CeraVe" /></Field>
        <Field label="Pack size"><input value={form.size || ''} onChange={set('size')} placeholder="e.g. 237 ml" /></Field>
        <Field label="Official product source"><input type="url" value={form.sourceUrl || ''} onChange={set('sourceUrl')} placeholder="https://brand.example/product" /></Field>
        <Field label="Badge">
          <select value={form.badge} onChange={set('badge')}>{BADGES.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}</select>
        </Field>
        <Field label="Price (৳)"><input type="number" min="0" value={form.price} onChange={set('price')} /></Field>
        <Field label="Old price (৳, optional)"><input type="number" min="0" value={form.old} onChange={set('old')} /></Field>
        <Field label="Stock"><input type="number" min="0" value={form.stock} onChange={set('stock')} /></Field>
        <Field label="Description" wide><textarea rows={3} value={form.description || form.desc || ''} onChange={set('description')} /></Field>
        <Field label="Ingredients / key ingredients (comma separated)" wide><textarea rows={2} value={Array.isArray(form.ingredients || form.ing) ? (form.ingredients || form.ing).join(', ') : (form.ingredients || form.ing || '')} onChange={set('ingredients')} /></Field>
        <Field label="How to use (one step per line)" wide><textarea rows={4} value={form.usage || ''} onChange={set('usage')} /></Field>
        <Field label="Suitable skin / hair type" wide><input value={form.skin || ''} onChange={set('skin')} placeholder="e.g. Sensitive skin" /></Field>

        {/* a <div>, not a <Field>: a label around buttons would "click" them when its text is clicked */}
        <div className="grid gap-1.5 text-xs text-ink-soft sm:col-span-2">
          Photos
          <ImageField images={form.images} onChange={(images) => setForm((current) => ({ ...current, images }))} max={MAX_PHOTOS} />
          <span className="text-[11.5px]">The first photo is the main picture. Images are compressed and uploaded to the backend.</span>
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /> Publish on the storefront</label>
        <p className="text-xs text-ink-soft sm:col-span-2">Coursework demo prices and stock are illustrative. Add verified package photos and label details before using a listing for real sales.</p>

        {error && <p className="text-[13px] text-lowstock-text sm:col-span-2">{error}</p>}
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={roseButton}>{isEdit ? 'Save changes' : 'Add product'}</button>
          <button type="button" onClick={onClose} className={ghostButton}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, wide = false, children }) {
  return (
    <label className={`grid gap-1.5 text-xs text-ink-soft ${wide ? 'sm:col-span-2' : ''}`}>
      {label}
      {children}
    </label>
  )
}
