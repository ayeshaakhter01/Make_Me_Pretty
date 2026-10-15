import { Link } from 'react-router-dom'
import { cx } from './adminHelpers.js'

export const ADMIN_TABS = [
  { id: 'Orders', icon: '/icons/admin/orders.png' },
  { id: 'Inventory', icon: '/icons/admin/inventory.png' },
  { id: 'Behaviour', icon: '/icons/admin/behaviour.png' },
  { id: 'Analytics', icon: '/icons/admin/analytics.png' },
  { id: 'Coupons', icon: '/icons/admin/coupons.png' },
  { id: 'Banners', icon: '/icons/admin/banners.png' },
  { id: 'Reviews', icon: '/icons/admin/reviews.png' },
  { id: 'Blog', icon: '/icons/admin/blog.png' },
  { id: 'Users', icon: '/icons/admin/users.png' },
  { id: 'Delivery', icon: '/icons/admin/delivery.png' },
]

/* Vertical menu on desktop, a scrolling row of tabs on phones. */
export default function AdminSidebar({ active, onChange, onSignOut }) {
  return (
    <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-60 lg:flex-shrink-0">
      <div className="flex h-full flex-col rounded-[22px] border border-line bg-cream p-4">
        <div className="mb-6 px-2 pt-2">
          <div className="font-serif text-lg leading-tight tracking-wide">Make Me Pretty</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft">Admin</div>
        </div>

        <nav className="flex gap-2 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cx(
                'flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors',
                active === tab.id ? 'bg-ink text-ivory' : 'text-ink-soft hover:bg-pink-soft hover:text-ink',
              )}
            >
                 <img src={tab.icon} alt="" className={cx('h-[18px] w-[18px]', active === tab.id && 'invert')} />
              {tab.id}
            </button>
          ))}
        </nav>

        <Link to="/" className="mt-4 hidden rounded-xl px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-pink-soft lg:block">← View shop</Link>
        <button type="button" onClick={onSignOut} className="hidden rounded-xl px-4 py-2.5 text-left text-sm text-rose transition-colors hover:bg-pink-soft lg:block">Sign out</button>
      </div>
    </aside>
  )
}
