import { useEffect, useState } from 'react'
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
import ContactMessagesPanel from '../../components/admin/ContactMessagesPanel.jsx'
import BehaviourPanel from '../../components/admin/BehaviourPanel.jsx'
import BlogManager from '../../components/admin/BlogManager.jsx'
import StaffAccountPanel from '../../components/admin/StaffAccountPanel.jsx'
import { money } from '../../components/admin/adminHelpers.js'
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
  const [aboutContent, setAboutContent] = useState([])
  const [contactContent, setContactContent] = useState(null)
  const [logo, setLogo] = useState('')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [partners, setPartners] = useState([])
  const [blogs, setBlogs] = useState([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [blogsError, setBlogsError] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [salesReport, setSalesReport] = useState(null)
  const [salesReportLoading, setSalesReportLoading] = useState(true)
  const [salesReportError, setSalesReportError] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiRequest('/site-settings').then((settings) => {
      if (cancelled) return
      setFooter(settings.footer || SEED_FOOTER)
      setAboutContent(Array.isArray(settings.about) ? settings.about : [])
      setContactContent(settings.contact || {})
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
      apiRequest('/site-settings', { method: 'PATCH', body: JSON.stringify({ footer, logo, about: aboutContent, contact: contactContent }) })
        .then(() => { setSettingsError(''); window.dispatchEvent(new Event('mmp-site-settings-change')) })
        .catch((problem) => setSettingsError(`Could not save store settings: ${problem.message}`))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [footer, logo, aboutContent, contactContent, settingsLoaded])

  useEffect(() => {
    let cancelled = false
    Promise.all([apiRequest('/orders/admin/all'), apiRequest('/admin/users')])
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
          messageCount: order.messageCount || 0,
          isDemo: Boolean(order.isDemo),
        })))
        setPartners((userResult.users || []).filter((user) => user.role === 'deliveryPartner').map((user) => ({ id: user.id, name: user.name, phone: user.phone || '' })))
        setOrdersError('')
      })
      .catch((problem) => { if (!cancelled) setOrdersError(problem.message) })
    return () => { cancelled = true }
  }, [setOrders, setPartners])

  useEffect(() => {
    let cancelled = false
    apiRequest('/admin/reports/sales')
      .then((report) => {
        if (cancelled) return
        setSalesReport(report)
        setSalesReportError('')
      })
      .catch((problem) => {
        if (!cancelled) setSalesReportError(problem.message || 'Could not load sales report.')
      })
      .finally(() => {
        if (!cancelled) setSalesReportLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  
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
            <button type="button" onClick={() => setAccountOpen((open) => !open)} className="mt-2 text-sm text-rose underline">{accountOpen ? 'Close account settings' : 'My account and password'}</button>
          </div>

          {accountOpen && <StaffAccountPanel />}


          {issues.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-lowstock-bg px-5 py-3 text-sm text-lowstock-text">
              <span>{issues.length} delivery {issues.length === 1 ? 'problem needs' : 'problems need'} your attention ({issues.map((order) => order.id).join(', ')}).</span>
              <button type="button" onClick={() => setTab('Orders')} className="underline">Open orders</button>
            </div>
          )}

          {ordersError && <p role="alert" className="mb-4 text-sm text-lowstock-text">Could not load live orders and delivery partners: {ordersError}</p>}
          {(tab === 'Orders' || tab === 'Analytics') && (
            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Revenue (received)" value={salesReportLoading ? 'Loading…' : salesReportError ? 'Unavailable' : money(salesReport?.summary?.receivedRevenue || 0)} accent="var(--color-rose)" />
              <StatCard label="Orders" value={salesReportLoading ? 'Loading…' : salesReportError ? 'Unavailable' : salesReport?.summary?.totalOrders ?? 0} />
              <StatCard label="Avg. received order" value={salesReportLoading ? 'Loading…' : salesReportError ? 'Unavailable' : money(salesReport?.summary?.averageReceivedOrderValue || 0)} accent="var(--color-gold)" />
              <StatCard label="Low-stock alerts" value={products.filter((product) => product.stock <= 5).length} accent={products.some((product) => product.stock <= 5) ? '#B3543D' : 'var(--color-ink)'} />
            </div>
          )}

          {tab === 'Orders' && <OrdersTable orders={orders} setOrders={setOrders} partners={partners} />}
          {tab === 'Inventory' && <InventoryManager products={products} setProducts={setProducts} />}
          {tab === 'Behaviour' && <BehaviourPanel />}
          {tab === 'Analytics' && <AnalyticsPanel report={salesReport} loading={salesReportLoading} error={salesReportError} />}
          {tab === 'Coupons' && <CouponManager coupons={coupons} setCoupons={setCoupons} />}
          {tab === 'Banners' && <BannersManager slides={heroSlides} setSlides={setHeroSlides} logo={logo} setLogo={setLogo} />}
          {tab === 'Footer' && <><p className="mb-3 text-sm text-ink-soft">{!settingsLoaded ? (settingsError || 'Loading settings from database…') : settingsError || 'Changes save to the database automatically.'}</p><FooterManager footer={footer} setFooter={setFooter} about={aboutContent} setAbout={setAboutContent} contact={contactContent} setContact={setContactContent} /></>}
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
          {tab === 'Contact' && <ContactMessagesPanel />}
          {tab === 'Delivery' && <DeliveryPanel partners={partners} setPartners={setPartners} orders={orders} />}
        </main>
      </div>
    </div>
  )
}
