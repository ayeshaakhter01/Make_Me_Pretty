import { useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import OrdersTable from '../../components/admin/OrdersTable.jsx'
import InventoryManager from '../../components/admin/InventoryManager.jsx'
import AnalyticsPanel from '../../components/admin/AnalyticsPanel.jsx'
import CouponManager from '../../components/admin/CouponManager.jsx'
import BannersManager from '../../components/admin/BannersManager.jsx'
import FooterManager from '../../components/admin/FooterManager.jsx'
import ReviewsPanel from '../../components/admin/ReviewsPanel.jsx'
import UsersPanel from '../../components/admin/UsersPanel.jsx'
import DeliveryPanel from '../../components/admin/DeliveryPanel.jsx'
import BehaviourPanel from '../../components/admin/BehaviourPanel.jsx'
import BlogManager from '../../components/admin/BlogManager.jsx'
import { STORAGE_FULL_EVENT, useStoredState } from '../../components/admin/useStoredState.js'
import { CANCELLED, KEYS, money } from '../../components/admin/adminHelpers.js'
import {
  INITIAL_COUPONS, INITIAL_ORDERS, INITIAL_PRODUCTS,
  SEED_ADMIN_REVIEWS, SEED_BLOGS, SEED_CARTS, SEED_PARTNERS, SEED_USERS, SEED_WISHLISTS,
} from '../../data/adminSeed.js'
import { SEED_FOOTER, SEED_HERO_SLIDES } from '../../data/siteContent.js'

/* =============================================================================
   ADMIN DASHBOARD
   This page owns the "memory" of the admin: every list (orders, products,
   coupons...) lives here in useStoredState, so it survives a refresh.
   It hands each list to the tab that needs it. `tab` decides which tab shows.
============================================================================= */
export default function AdminDashboard({ session, onSignOut }) {
  const [tab, setTab] = useState('Orders')
  const [orders, setOrders] = useStoredState(KEYS.orders, INITIAL_ORDERS)
  const [products, setProducts] = useStoredState(KEYS.products, INITIAL_PRODUCTS)
  const [coupons, setCoupons] = useStoredState(KEYS.coupons, INITIAL_COUPONS)
  const [users, setUsers] = useStoredState(KEYS.users, SEED_USERS)
  const [heroSlides, setHeroSlides] = useStoredState(KEYS.heroSlides, SEED_HERO_SLIDES) // the home page carousel
  const [footer, setFooter] = useStoredState(KEYS.footer, SEED_FOOTER) // footer links, social media, payment logos
  const [logo, setLogo] = useStoredState(KEYS.siteLogo, '') // the shop's menu logo
  const [headerImage, setHeaderImage] = useStoredState(KEYS.pageHeader, '') // banner picture on every shop page
  const [reviews, setReviews] = useStoredState(KEYS.reviews, SEED_ADMIN_REVIEWS)
  const [partners, setPartners] = useStoredState(KEYS.partners, SEED_PARTNERS)
  const [messages, setMessages] = useStoredState(KEYS.messages, [])
  const [blogs, setBlogs] = useStoredState(KEYS.blogs, SEED_BLOGS)
  const [carts] = useStoredState(KEYS.carts, SEED_CARTS) // only read here: the shop will fill these once there is a backend
  const [wishlists] = useStoredState(KEYS.wishlists, SEED_WISHLISTS)
  const [storageFull, setStorageFull] = useState(false)

  /* the browser says "no more space" when there are too many photos */
  useEffect(() => {
    const onFull = () => setStorageFull(true)
    window.addEventListener(STORAGE_FULL_EVENT, onFull)
    return () => window.removeEventListener(STORAGE_FULL_EVENT, onFull)
  }, [])

  /* numbers for the boxes at the top */
  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.pay === 'Paid' && o.status !== CANCELLED)
    const revenue = paid.reduce((sum, o) => sum + o.total, 0)
    return {
      revenue,
      count: orders.length,
      average: paid.length ? Math.round(revenue / paid.length) : 0,
      low: products.filter((p) => p.stock <= 5).length,
    }
  }, [orders, products])

  /* orders where a delivery partner reported a problem */
  const issues = orders.filter((order) => order.issue)

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-6 lg:flex-row">
        <AdminSidebar active={tab} onChange={setTab} onSignOut={onSignOut} />

        <main className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="font-serif text-[30px] font-normal">Store Dashboard</h1>
            <p className="text-sm text-ink-soft">Welcome back, {session.name} — here’s how Make Me Pretty is doing today.</p>
          </div>

          {storageFull && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-lowstock-bg px-5 py-3 text-sm text-lowstock-text">
              <span>Browser storage is full, so your last change was not saved and will be gone after a refresh. Remove a few photos (or use smaller ones) and try again.</span>
              <button type="button" onClick={() => setStorageFull(false)} className="underline">Dismiss</button>
            </div>
          )}

          {issues.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-lowstock-bg px-5 py-3 text-sm text-lowstock-text">
              <span>{issues.length} delivery {issues.length === 1 ? 'problem needs' : 'problems need'} your attention ({issues.map((order) => order.id).join(', ')}).</span>
              <button type="button" onClick={() => setTab('Orders')} className="underline">Open orders</button>
            </div>
          )}

          {(tab === 'Orders' || tab === 'Analytics') && (
            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Revenue (paid)" value={money(stats.revenue)} accent="var(--color-rose)" />
              <StatCard label="Orders" value={stats.count} />
              <StatCard label="Avg. order" value={money(stats.average)} accent="var(--color-gold)" />
              <StatCard label="Low-stock alerts" value={stats.low} accent={stats.low ? '#B3543D' : 'var(--color-ink)'} />
            </div>
          )}

          {tab === 'Orders' && <OrdersTable orders={orders} setOrders={setOrders} partners={partners} messages={messages} setMessages={setMessages} />}
          {tab === 'Inventory' && <InventoryManager products={products} setProducts={setProducts} />}
          {tab === 'Behaviour' && <BehaviourPanel users={users} orders={orders} products={products} carts={carts} wishlists={wishlists} />}
          {tab === 'Analytics' && <AnalyticsPanel orders={orders} />}
          {tab === 'Coupons' && <CouponManager coupons={coupons} setCoupons={setCoupons} />}
          {tab === 'Banners' && <BannersManager slides={heroSlides} setSlides={setHeroSlides} logo={logo} setLogo={setLogo} headerImage={headerImage} setHeaderImage={setHeaderImage} />}
          {tab === 'Footer' && <FooterManager footer={footer} setFooter={setFooter} />}
          {tab === 'Reviews' && <ReviewsPanel reviews={reviews} setReviews={setReviews} />}
          {tab === 'Blog' && <BlogManager posts={blogs} setPosts={setBlogs} />}
          {tab === 'Users' && <UsersPanel users={users} setUsers={setUsers} />}
          {tab === 'Delivery' && <DeliveryPanel partners={partners} setPartners={setPartners} orders={orders} />}
        </main>
      </div>
    </div>
  )
}
