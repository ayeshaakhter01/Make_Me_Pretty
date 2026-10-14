import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteFooter from './SiteFooter.jsx'
import SiteHeader from './SiteHeader.jsx'
import CartDrawer from '../cart/CartDrawer.jsx'
import LiquidBackground from './LiquidBackground.jsx'
import WelcomePromo from '../home/WelcomePromo.jsx'
import { useCart } from '../../context/useCart.js'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const { openDrawer } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return <div className="relative isolate min-h-screen"><LiquidBackground /><div className="relative z-10"><SiteHeader onOpenCart={openDrawer} /><main><Outlet /></main><SiteFooter /><CartDrawer /><WelcomePromo /></div></div>
}
