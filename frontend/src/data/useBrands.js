import { useEffect, useState } from 'react'
import { apiRequest } from '../api.js'

/* Brands for "Brands we carry", loaded from the backend (GET /api/brands).
   Brand names, descriptions and logo paths all come from MongoDB. */
export function useBrands() {
  const [brands, setBrands] = useState([])
  useEffect(() => {
    let cancelled = false
    apiRequest('/brands')
      .then((list) => {
        if (cancelled) return
        setBrands(list.map((item) => ({ brand: item.name, description: item.description || 'Shop products from this brand', logo: item.logo || '' })))
      })
      .catch(() => { if (!cancelled) setBrands([]) })
    return () => { cancelled = true }
  }, [])
  return brands
}
