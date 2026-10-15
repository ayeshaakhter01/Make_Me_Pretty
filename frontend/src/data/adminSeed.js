/* =============================================================================
   ADMIN SAMPLE DATA (no backend yet)
   The admin screens start from these lists. After that, every change you make
   in the admin is saved in the browser (localStorage), not on a server.
   Orders, coupons and products reuse the lists the shop already has.
============================================================================= */
import { SEED_ORDERS, SEED_COUPONS } from './ordersSource.js'
import { products } from './products.js'
import { BLOG_POSTS } from './blogSource.js'

/* demo logins shown on the login screen */
export const DEMO_LOGINS = {
  admin: { email: 'admin@makemepretty.com', password: 'admin123', name: 'Store Admin' },
  partner: { email: 'rider@makemepretty.com', password: 'rider123', name: 'Rafiq Ahmed' },
}

export const SEED_PARTNERS = [
  { id: 'p1', name: 'Rafiq Ahmed', phone: '01711000111', area: 'Dhaka North' },
  { id: 'p2', name: 'Sumi Akter', phone: '01822000222', area: 'Dhaka South' },
  { id: 'p3', name: 'Hasan Ali', phone: '01933000333', area: 'Chattogram' },
]

/* which delivery partner already has which order */
const ASSIGNED = { 'AR-1042': 'Sumi Akter', 'AR-1041': 'Rafiq Ahmed', 'AR-1040': 'Rafiq Ahmed' }
const ADDRESSES = {
  'AR-1042': 'House 12, Road 5, Dhanmondi, Dhaka',
  'AR-1041': 'Flat 4B, Green Road, Dhaka',
  'AR-1040': 'House 7, Agrabad, Chattogram',
  'AR-1039': 'Road 3, Zindabazar, Sylhet',
}

export const INITIAL_ORDERS = SEED_ORDERS.map((order) => ({
  ...order,
  partner: ASSIGNED[order.id] ?? '',
  address: ADDRESSES[order.id] ?? 'Address given at checkout',
}))

export const INITIAL_PRODUCTS = products.map((p) => ({
  id: String(p.id),
  name: p.name,
  category: p.category,
  type: p.type,
  brand: p.brand ?? '',
  price: p.price,
  old: p.old ?? '',
  stock: p.stock ?? 0,
  badge: p.badge ?? '',
  description: p.description ?? '',
  shape: p.shape, // bottle drawing + tints, used for the picture when a product has no photos yet
  c1: p.c1,
  c2: p.c2,
  images: [], // product photos added in the admin (first one = main picture)
}))

export const INITIAL_COUPONS = SEED_COUPONS.map((c) => ({ ...c }))

export const SEED_USERS = [
  { id: 'u1', name: 'Nusrat J.', email: 'nusrat@example.com', phone: '01711223344', address: 'House 12, Road 5, Dhanmondi, Dhaka', role: 'Customer', joined: 'Jun 12', orders: 2 },
  { id: 'u2', name: 'Farhana R.', email: 'farhana@example.com', phone: '01822334455', address: 'Flat 4B, Green Road, Dhaka', role: 'Customer', joined: 'Jun 18', orders: 1 },
  { id: 'u3', name: 'Tasnim A.', email: 'tasnim@example.com', phone: '01933445566', address: 'House 7, Agrabad, Chattogram', role: 'Customer', joined: 'Jun 25', orders: 3 },
  { id: 'u4', name: 'Maliha K.', email: 'maliha@example.com', phone: '01644556677', address: 'Road 3, Zindabazar, Sylhet', role: 'Customer', joined: 'Jun 30', orders: 1 },
  { id: 'u5', name: 'Store Admin', email: 'admin@makemepretty.com', phone: '', address: '', role: 'Admin', joined: 'May 1', orders: 0 },
  { id: 'u6', name: 'Rafiq Ahmed', email: 'rider@makemepretty.com', phone: '01711000111', address: '', role: 'Delivery Partner', joined: 'May 20', orders: 0 },
]

export const SEED_BANNERS = [
  { id: 'b1', title: 'Monsoon Glow Sale', text: 'All serums at special prices', link: '/offers', active: true },
  { id: 'b2', title: 'Free delivery over ৳3,000', text: 'Nationwide, every order', link: '/shop', active: true },
  { id: 'b3', title: 'New in Makeup', text: 'Colour for every mood', link: '/makeup', active: false },
]

export const SEED_ADMIN_REVIEWS = [
  { id: 'r1', name: 'Sadia M.', product: 'Silk Barrier Moisturizer', rating: 5, text: 'Absolutely lives up to the hype. My skin drinks it up.', status: 'Approved', image: '/images/reviews/review1.jpg' },
  { id: 'r2', name: 'Rimi H.', product: 'SPF 50 Silk Shield', rating: 4, text: 'Light texture, no white cast. Wish the bottle was bigger.', status: 'Pending', image: '/images/reviews/review2.jpg' },
  { id: 'r3', name: 'Tania B.', product: 'Niacinamide 10% Serum', rating: 5, text: 'My pores look smaller after three weeks.', status: 'Pending', image: '' },
  { id: 'r4', name: 'Anika S.', product: 'Hydra Mist Toner', rating: 2, text: 'Not for me, felt sticky.', status: 'Rejected', image: '' },
]

/* Blog posts: start from the posts the shop already shows on the home page.
   `active: false` hides a post from the shop. The order of this list is the order on the shop. */
export const SEED_BLOGS = BLOG_POSTS.map((post) => ({ ...post, active: true }))

/* ---------------------------------------------------------------------------
   BEHAVIOUR DATA (demo)
   The shop does not save per-customer carts or wishlists anywhere yet (that needs the backend),
   so the Behaviour tab starts from these sample ones. Each cart / wishlist belongs to a user id
   from SEED_USERS above. Products are looked up by id, so names and prices stay up to date.
--------------------------------------------------------------------------- */
const hoursAgo = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString()

export const SEED_CARTS = [
  { userId: 'u1', updatedAt: hoursAgo(3), items: [{ id: '4', qty: 1 }, { id: '9', qty: 2 }] },
  { userId: 'u2', updatedAt: hoursAgo(26), items: [{ id: '8', qty: 1 }, { id: '1', qty: 1 }] },
  { userId: 'u3', updatedAt: hoursAgo(70), items: [] },
  { userId: 'u4', updatedAt: hoursAgo(52), items: [{ id: '20', qty: 1 }, { id: '18', qty: 2 }, { id: '19', qty: 1 }] },
  { userId: 'guest-1', updatedAt: hoursAgo(0.7), items: [{ id: '4', qty: 1 }] }, // a visitor who is not signed in
]

export const SEED_WISHLISTS = [
  { userId: 'u1', productIds: ['3', '4', '7', '13'] },
  { userId: 'u2', productIds: ['2', '4', '17'] },
  { userId: 'u3', productIds: ['4', '8', '9', '19', '20'] },
  { userId: 'u4', productIds: ['4', '5', '18'] },
]
