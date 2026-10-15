/* Small helpers shared by the admin screens */
export const money = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`
export const cx = (...classes) => classes.filter(Boolean).join(' ')
export const timeLabel = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/* "5m ago", "3h ago", "2d ago" */
export function timeAgo(iso) {
  if (!iso) return '—'
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

/* order stages (the number saved on each order is the position in this list) */
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']
export const DELIVERED = 4
export const CANCELLED = 5

/* the keys under which each list is saved in the browser */
export const KEYS = {
  orders: 'mmp-admin-orders',
  products: 'mmp-admin-products',
  coupons: 'mmp-admin-coupons',
  users: 'mmp-admin-users',
  banners: 'mmp-admin-banners',
  reviews: 'mmp-admin-reviews',
  partners: 'mmp-admin-partners',
  messages: 'mmp-admin-messages', // chat between admin and delivery partners
  blogs: 'mmp-admin-blogs', // blog posts (the shop's home page reads this list too)
  carts: 'mmp-admin-carts', // saved carts, for the Behaviour tab
  wishlists: 'mmp-admin-wishlists', // saved wishlists, for the Behaviour tab
  session: 'mmp-admin-session',
}

/* shared look for table cells and form labels */
export const th = 'border-b border-line px-4 py-3.5 font-semibold'
export const td = 'border-b border-line px-4 py-3'
export const card = 'rounded-[22px] border border-line bg-cream'
export const roseButton = 'rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep'
export const ghostButton = 'rounded-full border-[1.5px] border-line px-5 py-2.5 text-[13px] text-ink-soft transition-colors hover:border-rose hover:text-rose'
