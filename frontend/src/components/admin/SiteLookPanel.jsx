import { useMemo, useState } from 'react'
import ImageField from './ImageField.jsx'
import { card } from './adminHelpers.js'
import { apiRequest, assetUrl, uploadImage } from '../../api.js'

/* SHOP LOOK: two pictures that change how the whole shop looks.
   logo        = the logo in the shop's top menu (empty = the original logo)
   headerImage = a banner picture shown under the menu on every shop page (empty = no picture) */
const PAGES = [
  ['/', 'Home'], ['/shop', 'Shop'],
  ['/shop?category=Skincare', 'Skincare'], ['/shop?category=Body%20Care', 'Body care'],
  ['/shop?category=Hair%20Care', 'Hair care'], ['/shop?category=Makeup', 'Makeup'],
  ['/offers', 'Offers'], ['/combo', 'Combo sets'],
  ['/brands', 'Brands'], ['/wishlist', 'Wishlist'], ['/cart', 'Cart'], ['/account', 'Account'],
]

export default function SiteLookPanel({ logo, setLogo, headerBanners = [], onHeaderChange }) {
  const [page, setPage] = useState('/shop')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const current = headerBanners.find((banner) => banner.pagePath === page && banner.active)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  async function saveHeader() {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const src = await uploadImage(file)
      const existing = headerBanners.find((banner) => banner.pagePath === page)
      const payload = { title: '', subtitle: '', type: 'image', placement: 'pageHeader', pagePath: page, src, href: page, active: true, order: 0 }
      const saved = await apiRequest(existing ? `/banners/${existing.id || existing._id}` : '/banners', { method: existing ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      onHeaderChange((items) => [...items.filter((item) => item.pagePath !== page), { ...saved, id: saved._id }])
      setFile(null)
    } catch (problem) { setError(problem.message) } finally { setBusy(false) }
  }

  async function removeHeader() {
    if (!current) return
    try {
      await apiRequest(`/banners/${current.id || current._id}`, { method: 'DELETE' })
      onHeaderChange((items) => items.filter((item) => item.pagePath !== page))
    } catch (problem) { setError(problem.message) }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Menu logo</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">
          Shown at the left of the shop’s top menu. A PNG with a see-through background looks best.
          Remove the picture to go back to the original logo.
        </p>
        <ImageField
          images={logo ? [logo] : []}
          onChange={(list) => setLogo(list[0] ?? '')}
          max={1}
          maxSide={400}
          format="image/png"
          previewClass="h-16 w-40"
          fit="contain"
        />
      </section>

      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Page header pictures</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">
          Choose a separate full-width header for each page. The image appears edge to edge below the menu.
        </p>
        <div className="grid gap-3">
          <select value={page} onChange={(event) => { setPage(event.target.value); setFile(null); setError('') }}>
            {PAGES.map(([path, label]) => <option key={path} value={path}>{label}</option>)}
          </select>
          {(preview || current) && <img src={preview || assetUrl(current.src)} alt={`${page} header preview`} className="h-32 w-full rounded-xl object-cover" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <div className="flex gap-3">
            <button type="button" onClick={saveHeader} disabled={!file || busy} className="rounded-full bg-rose px-4 py-2 text-xs text-white disabled:opacity-50">{busy ? 'Uploading…' : current ? 'Replace this page image' : 'Save page image'}</button>
            {current && <button type="button" onClick={removeHeader} className="rounded-full border border-line px-4 py-2 text-xs">Remove</button>}
          </div>
          {error && <p role="alert" className="text-xs text-lowstock-text">{error}</p>}
        </div>
      </section>
    </div>
  )
}
