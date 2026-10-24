import { Component, lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import SiteLayout from './components/layout/SiteLayout.jsx'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'))
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))
const AboutUsPage = lazy(() => import('./pages/AboutUsPage.jsx'))
const ContentPage = lazy(() => import('./pages/ContentPage.jsx'))
const BrandsPage = lazy(() => import('./pages/BrandsPage.jsx'))
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'))
const ComboPage = lazy(() => import('./pages/ComboPage.jsx'))
const TrackPage = lazy(() => import('./pages/TrackPage.jsx'))
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'))
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'))
const SkinAdvisorPage = lazy(() => import('./pages/SkinAdvisorPage.jsx'))
const CustomerAccountPage = lazy(() =>  import('./pages/CustomerAccountPage.jsx'))

function RouteLoading() {
  return <div className="mx-auto max-w-7xl px-5 py-24 text-center text-muted">Loading your beauty essentials…</div>
}

class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) { return { error } }

  componentDidCatch(error, info) {
    console.error('Page render failed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) return <main role="alert" className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="font-serif text-3xl">This page could not load</h1><p className="mt-4 text-rose-deep">{this.state.error.message}</p></main>
    return this.props.children
  }
}

export default function App() {
  return (
    <RouteErrorBoundary><Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="admin" element={<AdminApp />} />
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="skincare" element={<ShopPage initialCategory="Skincare" />} />
          <Route path="bodycare" element={<ShopPage initialCategory="Body Care" />} />
          <Route path="haircare" element={<ShopPage initialCategory="Hair Care" />} />
          <Route path="makeup" element={<ShopPage initialCategory="Makeup" />} />
          <Route path="offers" element={<ShopPage showOffers />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="product/:productId" element={<ProductPage />} />
          <Route path="p/about-us" element={<AboutUsPage />} />
          <Route path="p/:slug" element={<ContentPage />} />
          <Route path="combo" element={<ComboPage />} />
          <Route path="combo/:comboId" element={<ComboPage />} />
          <Route path="track" element={<TrackPage />} />
          <Route path="skin-advisor" element={<SkinAdvisorPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="account/profile" element={<CustomerAccountPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense></RouteErrorBoundary>
  )
}
