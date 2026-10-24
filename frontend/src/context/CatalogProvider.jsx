import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES } from '../data/categorySource.js'
import { apiRequest } from '../api.js'
import { CatalogContext } from './catalogContext.js'
function formatProduct(product) {
  return { ...product, id: String(product._id || product.id), old: product.compareAt ?? product.old ?? null, desc: product.description ?? product.desc ?? '', ing: product.ingredients ?? product.ing ?? [], images: product.images ?? [], rating: product.rating ?? 0, reviews: product.reviews ?? 0 }
}
export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let current = true
    Promise.all([apiRequest('/products?limit=60'), apiRequest('/categories')])
      .then(([result, categoryNames]) => {
        if (!current) return
        const loadedProducts = result.data.map(formatProduct)
        setProducts(loadedProducts)
        setCategories(categoryNames.map((name) => ({ name, note: CATEGORIES.find((item) => item.name.toLowerCase() === name.toLowerCase())?.blurb || `Shop ${name.toLowerCase()} essentials`, types: [...new Set(loadedProducts.filter((product) => product.category === name).map((product) => product.type))] })))
      })
      .catch(() => undefined)
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [])
  const value = useMemo(() => ({ products, categories, loading }), [products, categories, loading])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
