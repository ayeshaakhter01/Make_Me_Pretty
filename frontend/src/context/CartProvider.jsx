import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext.js'

const STORAGE_KEY = 'make-me-pretty-cart'
const WISHLIST_KEY = 'make-me-pretty-wishlist'

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function readSavedWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readSavedCart)
  const [wishlist, setWishlist] = useState(readSavedWishlist)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const value = useMemo(() => ({
    items,
    wishlist,
    drawerOpen,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    addItem(product, quantity = 1) {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id)
        return existing
          ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
          : [...current, { product, quantity } ]
      })
      setDrawerOpen(true)
    },
    openDrawer() { setDrawerOpen(true) },
    closeDrawer() { setDrawerOpen(false) },
    setQuantity(productId, quantity) {
      setItems((current) => quantity < 1
        ? current.filter((item) => item.product.id !== productId)
        : current.map((item) => item.product.id === productId ? { ...item, quantity } : item))
    },
    removeItem(productId) {
      setItems((current) => current.filter((item) => item.product.id !== productId))
    },
    clearCart() {
      setItems([])
    },
    toggleWishlist(product) {
      setWishlist((current) => current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product])
    },
    isWishlisted(productId) {
      return wishlist.some((product) => product.id === productId)
    },
  }), [drawerOpen, items, wishlist])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
