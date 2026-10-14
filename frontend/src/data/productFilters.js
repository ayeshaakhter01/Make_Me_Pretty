const skinTokens = (skin) => String(skin || '').split(/[·,]/).map((token) => token.trim()).filter(Boolean)

export function getProductFacets(products) {
  const count = (map, value) => map.set(value, (map.get(value) || 0) + 1)
  const types = new Map()
  const brands = new Map()
  const skins = new Map()
  let priceMax = 0
  for (const product of products) {
    count(types, product.type)
    count(brands, product.brand || 'Make Me Pretty')
    skinTokens(product.skin).forEach((token) => count(skins, token))
    priceMax = Math.max(priceMax, product.price)
  }
  const sorted = (map) => [...map.entries()].map(([value, total]) => ({ value, count: total })).sort((a, b) => a.value.localeCompare(b.value))
  return { types: sorted(types), brands: sorted(brands), skins: sorted(skins), priceMax }
}

export function matchesProductFilters(product, filters) {
  if (filters.inStock && !filters.outStock && product.stock <= 0) return false
  if (filters.outStock && !filters.inStock && product.stock > 0) return false
  if (filters.priceMin !== '' && product.price < Number(filters.priceMin)) return false
  if (filters.priceMax !== '' && product.price > Number(filters.priceMax)) return false
  if (filters.types.size && !filters.types.has(product.type)) return false
  if (filters.brands.size && !filters.brands.has(product.brand || 'Make Me Pretty')) return false
  if (filters.skins.size) {
    const tokens = skinTokens(product.skin)
    if (!tokens.some((token) => /^all/i.test(token)) && !tokens.some((token) => filters.skins.has(token))) return false
  }
  return true
}
