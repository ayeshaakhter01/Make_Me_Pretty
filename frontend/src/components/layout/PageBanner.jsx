import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiRequest, assetUrl } from '../../api.js'

/* The banner picture under the menu on every shop page.
   The admin adds or removes it in the Banners tab. No picture saved = nothing is shown. */
export default function PageBanner() {
  const { pathname, search } = useLocation()
  const params = new URLSearchParams(search)
  const categoryAliases = { '/skincare': 'Skincare', '/bodycare': 'Body Care', '/haircare': 'Hair Care', '/makeup': 'Makeup' }
  const category = params.get('category') || categoryAliases[pathname]
  // The storefront's category navigation uses /shop?category=..., so those
  // category selections need distinct banner keys from the general shop page.
  const pageKey = category && (pathname === '/shop' || categoryAliases[pathname])
    ? `/shop?category=${encodeURIComponent(category)}`
    : pathname
  const [image, setImage] = useState('')
  useEffect(() => {
    let current = true
    setImage('')
    apiRequest(`/banners?placement=pageHeader&page=${encodeURIComponent(pageKey)}`)
      .then((banners) => { if (current) setImage(banners[0]?.src || '') })
      .catch(() => { if (current) setImage('') })
    return () => { current = false }
  }, [pageKey])
  if (!image) return null

  return <img src={assetUrl(image)} alt="" aria-hidden="true" className="block h-auto w-full" />
}
