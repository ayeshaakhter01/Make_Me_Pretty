import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext.js'
import { apiRequest, loadAuthSession } from '../api.js'

const cartKey = (userId) => `make-me-pretty-cart:${userId || 'guest'}`
const wishlistKey = (userId) => `make-me-pretty-wishlist:${userId || 'guest'}`
const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}
const productId = (product) => String(product?._id || product?.id || '')
const isDatabaseId = (id) => /^[\da-f]{24}$/i.test(id)
const withUiFields = (product) => ({ ...product, id: String(product._id), old: product.compareAt, ingredients: product.ingredients || [] })
const signedIn = () => Boolean(loadAuthSession()?.token)

export function CartProvider({ children }) {
  const [identity, setIdentity] = useState(() => loadAuthSession()?.user?.id || loadAuthSession()?.user?._id || null)
  const [items, setItems] = useState(() => readList(cartKey(null)))
  const [wishlist, setWishlist] = useState(() => readList(wishlistKey(null)))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const reloadFromServer = useCallback(async () => {
    const session = loadAuthSession()
    const userId = session?.user?.id || session?.user?._id || null
    setIdentity(userId)
    if (!session?.token || !userId) {
      setItems(readList(cartKey(null)))
      setWishlist(readList(wishlistKey(null)))
      return
    }

    const guestCart = readList(cartKey(null))
    const guestWishlist = readList(wishlistKey(null))
    try {
      const [savedCart, savedWishlist] = await Promise.all([apiRequest('/cart'), apiRequest('/wishlist')])
      const serverCartIds = new Set((savedCart.items || []).map((row) => String(row.product?._id || '')))
      for (const row of guestCart) {
        const id = productId(row.product)
        if (isDatabaseId(id) && !serverCartIds.has(id)) await apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId: id, quantity: row.quantity }) }).catch(() => undefined)
      }
      const serverWishlistIds = new Set((savedWishlist.products || []).map((product) => String(product._id)))
      for (const product of guestWishlist) {
        const id = productId(product)
        if (isDatabaseId(id) && !serverWishlistIds.has(id)) await apiRequest('/wishlist/items', { method: 'POST', body: JSON.stringify({ productId: id }) }).catch(() => undefined)
      }
      localStorage.removeItem(cartKey(null))
      localStorage.removeItem(wishlistKey(null))
      const [mergedCart, mergedWishlist] = await Promise.all([apiRequest('/cart'), apiRequest('/wishlist')])
      setItems((mergedCart.items || []).filter((row) => row.product).map((row) => ({ product: withUiFields(row.product), quantity: row.quantity })))
      setWishlist((mergedWishlist.products || []).map(withUiFields))
    } catch {
      // The server could not be reached. Keep what is on screen instead of emptying the cart.
    }
  }, [])

  useEffect(() => {
    reloadFromServer()
    window.addEventListener('mmp-auth-change', reloadFromServer)
    return () => window.removeEventListener('mmp-auth-change', reloadFromServer)
  }, [reloadFromServer])

  // Anonymous browsing has no account to own a cart, so keep a temporary guest
  // cart locally and merge it into the signed-in account at login. Signed-in
  // cart and wishlist state is owned by the API/database only.
  useEffect(() => { if (!identity) localStorage.setItem(cartKey(null), JSON.stringify(items)) }, [identity, items])
  useEffect(() => { if (!identity) localStorage.setItem(wishlistKey(null), JSON.stringify(wishlist)) }, [identity, wishlist])

  const value = useMemo(() => ({
    items, wishlist, drawerOpen,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    // For a signed-in customer the server answers FIRST. If it says no (for
    // example "not enough stock"), we show the message and leave the screen unchanged.
    async addItem(product, quantity = 1) {
      const id = productId(product)
      if (isDatabaseId(id) && signedIn()) {
        try {
          await apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId: id, quantity }) })
        } catch (error) {
          window.alert(error.message || 'Could not add this item to your cart.')
          return
        }
      }
      setItems((current) => {
        const existing = current.find((item) => productId(item.product) === id)
        return existing ? current.map((item) => productId(item.product) === id ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { product, quantity }]
      })
      setDrawerOpen(true)
    },
    openDrawer() { setDrawerOpen(true) },
    closeDrawer() { setDrawerOpen(false) },
    async setQuantity(id, quantity) {
      if (isDatabaseId(id) && signedIn()) {
        try {
          await (quantity < 1
            ? apiRequest(`/cart/items/${id}`, { method: 'DELETE' })
            : apiRequest(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }))
        } catch (error) {
          window.alert(error.message || 'Could not update your cart.')
          return
        }
      }
      setItems((current) => quantity < 1 ? current.filter((item) => productId(item.product) !== id) : current.map((item) => productId(item.product) === id ? { ...item, quantity } : item))
    },
    async removeItem(id) {
      if (isDatabaseId(id) && signedIn()) {
        try {
          await apiRequest(`/cart/items/${id}`, { method: 'DELETE' })
        } catch (error) {
          window.alert(error.message || 'Could not remove this item.')
          return
        }
      }
      setItems((current) => current.filter((item) => productId(item.product) !== id))
    },
    clearCart() {
      setItems([])
      if (signedIn()) apiRequest('/cart', { method: 'DELETE' }).catch(() => undefined)
    },
    async toggleWishlist(product) {
      const id = productId(product)
      const exists = wishlist.some((item) => productId(item) === id)
      if (isDatabaseId(id) && signedIn()) {
        try {
          await (exists
            ? apiRequest(`/wishlist/items/${id}`, { method: 'DELETE' })
            : apiRequest('/wishlist/items', { method: 'POST', body: JSON.stringify({ productId: id }) }))
        } catch (error) {
          window.alert(error.message || 'Could not update your wishlist.')
          return
        }
      }
      setWishlist((current) => current.some((item) => productId(item) === id) ? current.filter((item) => productId(item) !== id) : [...current, product])
    },
    isWishlisted(id) { return wishlist.some((product) => productId(product) === id) },
  }), [drawerOpen, identity, items, wishlist])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
