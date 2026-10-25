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
    // The API returns at most 60 products per page, so load every page (otherwise older products and whole categories go missing).
    const loadAllProducts = async () => {
      const first = await apiRequest('/products?limit=60&page=1')
      const rest = await Promise.all(Array.from({ length: Math.max(0, (first.pages || 1) - 1) }, (_, index) => apiRequest(`/products?limit=60&page=${index + 2}`)))
      return [first, ...rest].flatMap((page) => page.data)
    }
    Promise.all([loadAllProducts(), apiRequest('/categories')])
      .then(([allProducts, categoryNames]) => {
        if (!current) return
        const loadedProducts = allProducts.map(formatProduct)
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
