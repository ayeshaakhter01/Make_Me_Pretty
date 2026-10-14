import { PRODUCTS } from './catalog.js'
import { CATEGORIES } from './categorySource.js'

export const products = PRODUCTS.map((product) => ({
  ...product,
  compareAt: product.old,
  description: product.desc,
  ingredients: product.ing,
  colors: [product.c1, product.c2],
}))

export const categories = CATEGORIES.map((category) => ({ ...category, note: category.blurb }))

export function getProduct(productId) {
  return products.find((product) => String(product.id) === String(productId))
}
