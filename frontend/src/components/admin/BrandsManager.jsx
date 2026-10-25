import { useEffect, useState } from 'react'
import ImageField from './ImageField.jsx'
import { card, cx, ghostButton, roseButton } from './adminHelpers.js'
import { apiRequest, assetUrl } from '../../api.js'

/* BRAND LOGOS (inside the Banners tab)
   The brands shown in "Brands we carry" on the home page and on /brands.
   Everything is saved in the database (Brand collection) through /api/brands.
   The name must match the brand written on the products - renaming a brand renames it on its products too. */
const EMPTY = { name: '', description: '', logo: '', order: 0, active: true }

export default function BrandsManager() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // null = closed, no id = new brand, with id = editing
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let current = true
    apiRequest('/brands/admin/all')
      .then((list) => { if (current) { setBrands(list); setError('') } })
      .catch((problem) => { if (current) setError(problem.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [version])

  const refresh = () => setVersion((value) => value + 1)
  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function save(event) {
    event.preventDefault()
    if (!form.name.trim()) { setError('Brand name is required.'); return }
    setSaving(true)
    const body = JSON.stringify({ name: form.name, description: form.description, logo: form.logo, order: Number(form.order) || 0, active: form.active })
    try {
      await apiRequest(form.id ? `/brands/${form.id}` : '/brands', { method: form.id ? 'PATCH' : 'POST', body })
      setForm(null)
      setError('')
      refresh()
    } catch (problem) { setError(problem.message) } finally { setSaving(false) }
  }

  async function toggle(brand) {
    try {
      await apiRequest(`/brands/${brand.id}`, { method: 'PATCH', body: JSON.stringify({ active: !brand.active }) })
      refresh()
    } catch (problem) { setError(problem.message) }
  }

  async function remove(brand) {
    if (!window.confirm(`Delete the "${brand.name}" brand card? Its products stay in the shop.`)) return
    try {
      await apiRequest(`/brands/${brand.id}`, { method: 'DELETE' })
      refresh()
    } catch (problem) { setError(problem.message) }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-ink-soft">Logo, short description and order of each brand on the home page. A brand shows only while it is switched on and has products.</p>
        <button type="button" onClick={() => setForm({ ...EMPTY, order: brands.length })} className={`${roseButton} sm:ml-auto`}>+ Add brand</button>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-pink-soft px-4 py-3 text-sm text-rose-deep">{error}</p>}

      {form && (
        <form onSubmit={save} className={`${card} grid gap-4 p-5`}>
          <h3 className="font-serif text-lg">{form.id ? 'Edit brand' : 'New brand'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Brand name<input value={form.name} onChange={field('name')} maxLength={80} placeholder="e.g. CeraVe" /></label>
            <label className="grid gap-1 text-sm">Short description<input value={form.description} onChange={field('description')} maxLength={160} placeholder="e.g. Dermatologist barrier care" /></label>
            <label className="grid gap-1 text-sm">Order (small number shows first)<input type="number" value={form.order} onChange={field('order')} /></label>
            <label className="flex items-center gap-2 text-sm sm:mt-6"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} className="!w-auto" />Show on the shop</label>
          </div>
          <div>
            <p className="mb-2 text-sm">Logo</p>
            <ImageField images={form.logo ? [form.logo] : []} onChange={(list) => setForm((current) => ({ ...current, logo: list[0] || '' }))} max={1} maxSide={600} format="image/png" previewClass="h-24 w-24" fit="contain" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className={roseButton}>{saving ? 'Saving…' : 'Save brand'}</button>
            <button type="button" onClick={() => setForm(null)} className={ghostButton}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <p className={`${card} p-6 text-sm text-ink-soft`}>Loading brands from database…</p>}
      {!loading && brands.length === 0 && <p className={`${card} p-6 text-sm text-ink-soft`}>No brands in the database yet. Run <code>npm run seed:brands</code> in the backend, or add one above.</p>}
      <div className="grid gap-3">
        {brands.map((brand) => (
          <div key={brand.id} className={cx(`${card} flex flex-wrap items-center gap-4 p-4`, !brand.active && 'opacity-60')}>
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              {brand.logo ? <img src={assetUrl(brand.logo)} alt={brand.name} className="size-full object-contain" /> : <span className="px-1 text-center text-[11px] text-ink-soft">No logo</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base">{brand.name}</p>
              <p className="truncate text-xs text-ink-soft">{brand.description || 'No description'} · {brand.productCount} product{brand.productCount === 1 ? '' : 's'} · order {brand.order}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" onClick={() => toggle(brand)} className="underline hover:text-rose">{brand.active ? 'Hide' : 'Show'}</button>
              <button type="button" onClick={() => setForm({ ...brand })} className="underline hover:text-rose">Edit</button>
              <button type="button" onClick={() => remove(brand)} className="text-ink-soft underline hover:text-rose">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
