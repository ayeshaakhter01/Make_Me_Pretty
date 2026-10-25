import { useEffect, useState } from 'react'
import { apiRequest } from '../api.js'

/* Brands for "Brands we carry", loaded from the backend (GET /api/brands).
   Returns [{ brand, description, logo }] - an empty list while loading or if the server is down. */
export function useBrands() {
  const [brands, setBrands] = useState([])
  useEffect(() => {
    let cancelled = false
    apiRequest('/brands')
      .then((list) => { if (!cancelled) setBrands(list.map((item) => ({ brand: item.name, description: item.description || 'Shop products from this brand', logo: item.logo || '' }))) })
      .catch(() => { if (!cancelled) setBrands([]) })
    return () => { cancelled = true }
  }, [])
  return brands
}
