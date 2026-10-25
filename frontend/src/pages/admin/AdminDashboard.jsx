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
import StaffAccountPanel from '../../components/admin/StaffAccountPanel.jsx'
import { CANCELLED, money } from '../../components/admin/adminHelpers.js'
import { SEED_FOOTER } from '../../data/siteContent.js'
import { apiRequest } from '../../api.js'

/* The dashboard loads persistent store records from the API and gives each
   manager the current data needed for its tab. */
export default function AdminDashboard({ session, onSignOut }) {
  const [tab, setTab] = useState('Orders')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [coupons, setCoupons] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [footer, setFooter] = useState(SEED_FOOTER)
  const [logo, setLogo] = useState('')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [partners, setPartners] = useState([])
  const [blogs, setBlogs] = useState([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [blogsError, setBlogsError] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [chatOrderId, setChatOrderId] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiRequest('/site-settings').then((settings) => {
      if (cancelled) return
      setFooter(settings.footer || SEED_FOOTER)
      setLogo(settings.logo || '')
      setSettingsLoaded(true)
      setSettingsError('')
      window.dispatchEvent(new Event('mmp-site-settings-change'))
    }).catch((problem) => { if (!cancelled) setSettingsError(problem.message) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return undefined
    const timer = window.setTimeout(() => {
      apiRequest('/site-settings', { method: 'PATCH', body: JSON.stringify({ footer, logo }) })
        .then(() => { setSettingsError(''); window.dispatchEvent(new Event('mmp-site-settings-change')) })
        .catch((problem) => setSettingsError(`Could not save store settings: ${problem.message}`))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [footer, logo, settingsLoaded])

  useEffect(() => {
    let cancelled = false
    const load = () => Promise.all([apiRequest('/orders/admin/all'), apiRequest('/admin/users')])
      .then(([savedOrders, userResult]) => {
        if (cancelled) return
        setOrders(savedOrders.map((order) => ({
          ...order,
          id: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          name: order.customer?.name || order.address?.recipientName || 'Customer',
          accountEmail: order.customer?.email || '',
          phone: order.address?.phone || order.customer?.phone || '',
          address: [order.address?.addressLine, order.address?.area, order.address?.city].filter(Boolean).join(', '),
          items: order.items.map((item) => `${item.name} × ${item.quantity}`).join(', '),
          lines: order.items.map((item) => ({ name: item.name, qty: item.quantity, price: item.price })),
          pay: order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
          method: order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod,
          status: ['pending', 'confirmed', 'shipped', 'outForDelivery', 'delivered', 'cancelled'].indexOf(order.status),
          partner: order.deliveryPartner?._id || '',
          partnerName: order.deliveryPartner?.name || '',
          messageCount: order.messages?.length || 0,
          unread: order.unreadForAdmin || 0,
          isDemo: Boolean(order.isDemo),
        })))
        setPartners((userResult.users || []).filter((user) => user.role === 'deliveryPartner').map((user) => ({ id: user.id, name: user.name, phone: user.phone || '' })))
        setOrdersError('')
      })
      .catch((problem) => { if (!cancelled) setOrdersError(problem.message) })
    load()
    const timer = window.setInterval(load, 15000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [setOrders, setPartners])

  
  useEffect(() => {
    let cancelled = false

    async function loadBlogs() {
      try {
        const result = await apiRequest('/blogs/admin/all')

        if (!Array.isArray(result)) {
          throw new Error('Unexpected blog API response.')
        }

        if (!cancelled) {
          setBlogs(
            result.map((post) => ({
              ...post,
              id: post._id,
              active: post.status === 'published',
            }))
          )
          setBlogsError('')
        }
      } catch (error) {
        if (!cancelled) {
          setBlogsError(error.message || 'Could not load blog posts.')
        }
      } finally {
        if (!cancelled) setBlogsLoading(false)
      }
    }

    loadBlogs()

    return () => {
      cancelled = true
    }
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
  const withNew = orders.filter((order) => order.unread > 0)

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-6 lg:flex-row">
        <AdminSidebar active={tab} onChange={setTab} onSignOut={onSignOut} />

        <main className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="font-serif text-[30px] font-normal">Store Dashboard</h1>
            <p className="text-sm text-ink-soft">Welcome back, {session.name} — here’s how Make Me Pretty is doing today.</p>
            <button type="button" onClick={() => setAccountOpen((open) => !open)} className="mt-2 text-sm text-rose underline">{accountOpen ? 'Close account settings' : 'My account and password'}</button>
          </div>

          {accountOpen && <StaffAccountPanel />}


          {(issues.length > 0 || withNew.length > 0) && (
            <div className="mb-6 grid gap-2">
              {issues.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-lowstock-bg px-5 py-3 text-sm text-lowstock-text">
                  <span>{issues.length} delivery {issues.length === 1 ? 'problem needs' : 'problems need'} your attention:</span>
                  {issues.map((order) => (
                    <button key={order.id} type="button" onClick={() => { setTab('Orders'); setChatOrderId(order.id) }} className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold underline">{order.orderNumber || order.id}</button>
                  ))}
                </div>
              )}
              {withNew.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-pink-soft px-5 py-3 text-sm text-ink-soft">
                  <span>New messages from delivery partners:</span>
                  {withNew.map((order) => (
                    <button key={order.id} type="button" onClick={() => { setTab('Orders'); setChatOrderId(order.id) }} className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-rose-deep underline">{order.orderNumber || order.id} ({order.unread})</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {ordersError && <p role="alert" className="mb-4 text-sm text-lowstock-text">Could not load live orders and delivery partners: {ordersError}</p>}

          {(tab === 'Orders' || tab === 'Analytics') && (
            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Revenue (paid)" value={money(stats.revenue)} accent="var(--color-rose)" />
              <StatCard label="Orders" value={stats.count} />
              <StatCard label="Avg. order" value={money(stats.average)} accent="var(--color-gold)" />
              <StatCard label="Low-stock alerts" value={stats.low} accent={stats.low ? '#B3543D' : 'var(--color-ink)'} />
            </div>
          )}

          {tab === 'Orders' && <OrdersTable orders={orders} setOrders={setOrders} partners={partners} openChatId={chatOrderId} onChatOpened={() => setChatOrderId(null)} />}
          {tab === 'Inventory' && <InventoryManager products={products} setProducts={setProducts} />}
          {tab === 'Behaviour' && <BehaviourPanel />}
          {tab === 'Analytics' && <AnalyticsPanel orders={orders} />}
          {tab === 'Coupons' && <CouponManager coupons={coupons} setCoupons={setCoupons} />}
          {tab === 'Banners' && <BannersManager slides={heroSlides} setSlides={setHeroSlides} logo={logo} setLogo={setLogo} />}
          {tab === 'Footer' && <><p className="mb-3 text-sm text-ink-soft">{!settingsLoaded ? (settingsError || 'Loading settings from database…') : settingsError || 'Changes save to the database automatically.'}</p><FooterManager footer={footer} setFooter={setFooter} /></>}
          {tab === 'Reviews' && <ReviewsPanel />}
          {tab === 'Blog' && (
            blogsLoading ? (
              <p className="text-sm text-ink-soft">Loading blog posts...</p>
            ) : blogsError ? (
              <p className="text-sm text-lowstock-text">{blogsError}</p>
            ) : (
              <BlogManager posts={blogs} setPosts={setBlogs} />
            )
          )}
          {tab === 'Users' && <UsersPanel />}
          {tab === 'Delivery' && <DeliveryPanel partners={partners} setPartners={setPartners} orders={orders} />}
        </main>
      </div>
    </div>
  )
}
