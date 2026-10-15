import { useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import DeliveryDashboard from './DeliveryDashboard.jsx'
import { KEYS } from '../../components/admin/adminHelpers.js'

/* =============================================================================
   ADMIN AREA  ->  /admin
   Decides what to show:
     not signed in      -> the login screen
     signed in as admin -> the admin dashboard
     signed in as rider -> the delivery partner dashboard
   The sign-in is remembered for the browser tab (sessionStorage).
============================================================================= */
export default function AdminApp() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(KEYS.session)) } catch { return null }
  })

  function signIn(user) {
    sessionStorage.setItem(KEYS.session, JSON.stringify(user))
    setSession(user)
  }

  function signOut() {
    sessionStorage.removeItem(KEYS.session)
    setSession(null)
  }

  if (!session) return <AdminLogin onLogin={signIn} />
  if (session.role === 'partner') return <DeliveryDashboard session={session} onSignOut={signOut} />
  return <AdminDashboard session={session} onSignOut={signOut} />
}
