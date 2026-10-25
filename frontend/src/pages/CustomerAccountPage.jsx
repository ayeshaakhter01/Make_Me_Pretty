import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import {
  apiRequest,
  clearAuthSession,
  loadAuthSession,
} from '../api.js'

const blankAddress = {
  label: 'Home',
  recipientName: '',
  phone: '',
  addressLine: '',
  area: '',
  city: '',
  isDefault: false,
}

export default function CustomerAccountPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [message, setMessage] = useState('')

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })

  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState(blankAddress)

  const [orderId, setOrderId] = useState('')

  function trackFromProfile(event) {
    event.preventDefault()
    setPageError('')
    const entered = orderId.trim().toUpperCase()
    const order = orders.find((item) => item.orderNumber?.toUpperCase() === entered || String(item._id).toUpperCase() === entered)
    if (!order) {
      setPageError('That order is not in your account history. Check the order number and try again.')
      return
    }
    navigate(`/track?id=${encodeURIComponent(order.orderNumber || order._id)}`)
  }

  async function cancelOrder(order) {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return
    setPageError('')
    setMessage('')
    try {
      const updated = await apiRequest(`/orders/${order._id}/cancel`, { method: 'POST' })
      setOrders((current) => current.map((item) => (item._id === updated._id ? { ...item, status: updated.status } : item)))
      setMessage('Order cancelled.')
    } catch (error) {
      setPageError(error.message)
    }
  }

  useEffect(() => {
    const session = loadAuthSession()
    
    if (!session?.token) {
        navigate('/account', { replace: true })
        return
    }
    
    if (session.user?.role !== 'customer') {
        navigate('/admin', { replace: true })
        return
    }

    async function loadAccount() {
      try {
        const [profileResult, addressResult, orderResult] = await Promise.all([
          apiRequest('/users/me'),
          apiRequest('/users/me/addresses'),
          apiRequest('/orders/my'),
        ])

        const loadedUser = profileResult.user
        setUser(loadedUser)
        setProfileForm({
          name: loadedUser.name || '',
          phone: loadedUser.phone || '',
          email: loadedUser.email || '',
        })
        setAddresses(addressResult.addresses || [])
        setOrders(Array.isArray(orderResult) ? orderResult : [])
      } catch (error) {
        setPageError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [navigate])

  function signOut() {
    clearAuthSession()
    navigate('/account')
  }

  async function saveProfile(event) {
    event.preventDefault()
    setMessage('')
    setPageError('')

    try {
      const result = await apiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      })
      setUser(result.user)
      setProfileForm({ name: result.user.name || '', phone: result.user.phone || '', email: result.user.email || '' })
      setEditingProfile(false)
      setMessage('Profile updated.')
    } catch (error) {
      setPageError(error.message)
    }
  }

  async function changePassword(event) {
    event.preventDefault()
    setMessage('')
    setPageError('')
    try {
      await apiRequest('/users/me/password', { method: 'PATCH', body: JSON.stringify(passwordForm) })
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setMessage('Password changed successfully.')
    } catch (error) {
      setPageError(error.message)
    }
  }

  function startAddingAddress() {
    setEditingAddressId(null)
    setAddressForm({ ...blankAddress })
    setAddressFormOpen(true)
    setMessage('')
  }

  function startEditingAddress(address) {
    setEditingAddressId(address._id)
    setAddressForm({ ...address })
    setAddressFormOpen(true)
    setMessage('')
  }

  async function saveAddress(event) {
    event.preventDefault()
    setMessage('')
    setPageError('')

    try {
      const result = await apiRequest(
        editingAddressId
          ? `/users/me/addresses/${editingAddressId}`
          : '/users/me/addresses',
        {
          method: editingAddressId ? 'PATCH' : 'POST',
          body: JSON.stringify(addressForm),
        },
      )

      setAddresses(result.addresses || [])
      setAddressFormOpen(false)
      setEditingAddressId(null)
      setMessage(editingAddressId ? 'Address updated.' : 'Address added.')
    } catch (error) {
      setPageError(error.message)
    }
  }

  async function deleteAddress(addressId) {
    if (!window.confirm('Delete this saved address?')) return

    setMessage('')
    setPageError('')

    try {
      const result = await apiRequest(`/users/me/addresses/${addressId}`, {
        method: 'DELETE',
      })
      setAddresses(result.addresses || [])
      setMessage('Address deleted.')
    } catch (error) {
      setPageError(error.message)
    }
  }

  if (loading) {
    return (
      <PageContainer className="py-14 text-center text-ink-soft">
        Loading your account…
      </PageContainer>
    )
  }

  const tabs = [
    ['profile', 'My Profile'],
    ['addresses', 'My Addresses'],
    ['orders', 'Order History'],
    ['track', 'Track an Order'],
  ]

  return (
    <PageContainer className="animate-fadeup py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose/10 text-2xl font-medium text-rose-deep">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-3xl">{user?.name}</h1>
              <p className="text-sm text-ink-soft">{user?.email}</p>
            </div>
          </div>

          {activeTab === 'profile' && !editingProfile && (
            <button
              type="button"
              onClick={() => setEditingProfile(true)}
              className="rounded-full border border-line px-5 py-2 text-sm hover:bg-cream"
            >
              Edit Profile
            </button>
          )}
        </header>

        {(pageError || message) && (
          <p
            role="status"
            className={`mb-5 text-sm ${pageError ? 'text-rose-deep' : 'text-green-700'}`}
          >
            {pageError || message}
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-[230px_1fr]">
          <nav className="h-fit rounded-3xl border border-line bg-cream p-3">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setActiveTab(value)
                  setMessage('')
                  setPageError('')
                }}
                className={`mb-1 block w-full rounded-2xl px-4 py-3 text-left text-sm ${
                  activeTab === value
                    ? 'bg-rose/10 font-medium text-rose-deep'
                    : 'text-ink hover:bg-white/70'
                }`}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              onClick={signOut}
              className="mt-2 w-full border-t border-line px-4 pt-4 text-left text-sm text-rose-deep"
            >
              Sign Out
            </button>
          </nav>

          <main>
            {activeTab === 'profile' && (
              <section>
                <h2 className="font-serif text-3xl">My Profile</h2>
                <p className="mb-6 text-sm text-ink-soft">
                  Your personal information.
                </p>

                <div className="rounded-3xl border border-line bg-cream p-6">
                  {editingProfile ? (
                    <form onSubmit={saveProfile} className="grid gap-4">
                      <label>
                        <span className="field-label">Full name</span>
                        <input
                          required
                          value={profileForm.name}
                          onChange={(event) =>
                            setProfileForm({
                              ...profileForm,
                              name: event.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        <span className="field-label">Phone</span>
                        <input
                          value={profileForm.phone}
                          onChange={(event) =>
                            setProfileForm({
                              ...profileForm,
                              phone: event.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        <span className="field-label">Email</span>
                        <input type="email" required value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} />
                      </label>

                      <div className="flex gap-3">
                        <button className="rounded-full bg-rose px-5 py-2 text-sm text-white">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="rounded-full border border-line px-5 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="field-label">Full name</p>
                        <p>{user?.name}</p>
                      </div>
                      <div>
                        <p className="field-label">Phone</p>
                        <p>{user?.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="field-label">Email</p>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={changePassword} className="mt-5 grid gap-4 rounded-3xl border border-line bg-cream p-6">
                  <div><h3 className="font-serif text-xl">Change password</h3><p className="text-sm text-ink-soft">Enter your current password and choose a new one.</p></div>
                  <label><span className="field-label">Current password</span><input type="password" autoComplete="current-password" required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
                  <label><span className="field-label">New password</span><input type="password" autoComplete="new-password" minLength={8} required value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
                  <button className="w-fit rounded-full bg-rose px-5 py-2 text-sm text-white">Change Password</button>
                </form>
              </section>
            )}

            {activeTab === 'addresses' && (
              <section>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-3xl">My Addresses</h2>
                    <p className="text-sm text-ink-soft">
                      Saved locations for faster checkout.
                    </p>
                  </div>
                  {!addressFormOpen && (
                    <button
                      type="button"
                      onClick={startAddingAddress}
                      className="rounded-full bg-rose px-5 py-3 text-sm font-medium text-white"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {addressFormOpen && (
                  <form
                    onSubmit={saveAddress}
                    className="mb-6 grid gap-4 rounded-3xl border border-line bg-cream p-6 sm:grid-cols-2"
                  >
                    <label>
                      <span className="field-label">Label</span>
                      <input
                        required
                        value={addressForm.label}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            label: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="field-label">Recipient name</span>
                      <input
                        required
                        value={addressForm.recipientName}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            recipientName: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="field-label">Phone</span>
                      <input
                        required
                        value={addressForm.phone}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            phone: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="field-label">Address</span>
                      <input
                        required
                        value={addressForm.addressLine}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            addressLine: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="field-label">Area</span>
                      <input
                        required
                        value={addressForm.area}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            area: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="field-label">City</span>
                      <input
                        required
                        value={addressForm.city}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            city: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={Boolean(addressForm.isDefault)}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            isDefault: event.target.checked,
                          })
                        }
                      />
                      Make this my default address
                    </label>

                    <div className="flex gap-3 sm:col-span-2">
                      <button className="rounded-full bg-rose px-5 py-2 text-sm text-white">
                        {editingAddressId ? 'Save Address' : 'Add Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressFormOpen(false)}
                        className="rounded-full border border-line px-5 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="rounded-3xl border border-line bg-cream p-8 text-center text-ink-soft">
                    No saved addresses yet.
                  </div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {addresses.map((address) => (
                      <article
                        key={address._id}
                        className="rounded-3xl border border-rose/50 bg-cream p-6"
                      >
                        <div className="mb-4 flex gap-2">
                          <span className="rounded-full bg-rose/10 px-3 py-1 text-xs font-medium text-rose-deep">
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm">
                          {address.recipientName} · {address.phone}
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {address.addressLine}, {address.area}, {address.city}
                        </p>
                        <div className="mt-5 flex gap-4 border-t border-line pt-4 text-sm">
                          <button
                            type="button"
                            onClick={() => startEditingAddress(address)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(address._id)}
                            className="text-rose-deep"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'orders' && (
              <section>
                <h2 className="font-serif text-3xl">Order History</h2>
                <p className="text-sm text-ink-soft">Every order you’ve placed.</p>
                {orders.length === 0 ? <div className="py-20 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-rose/10 text-4xl">
                    📦
                  </div>
                  <h3 className="font-serif text-2xl">No orders yet</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                    When you place an order, it’ll appear here so you can track
                    it anytime.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-6 inline-block rounded-full bg-rose px-5 py-3 text-sm font-medium text-white"
                  >
                    Start shopping
                  </Link>
                </div> : <div className="mt-6 grid gap-4">{orders.map((order) => <article key={order._id} className="rounded-3xl border border-line bg-cream p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-ink-soft">Order number</p><h3 className="font-serif text-xl">{order.orderNumber || order._id}</h3><p className="mt-1 text-xs text-ink-soft">{new Date(order.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-rose/10 px-3 py-1 text-xs font-medium capitalize text-rose-deep">{order.status}</span></div>
                  <p className="mt-4 text-sm">{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                  <div className="flex flex-wrap gap-2"><button type="button" hidden={order.status !== 'pending'} onClick={() => cancelOrder(order)} className="rounded-full border border-line px-4 py-2 text-xs hover:border-rose">Cancel order</button><Link to={`/track?id=${encodeURIComponent(order.orderNumber || '')}`} className="rounded-full bg-rose px-4 py-2 text-xs font-medium text-white">Track order</Link></div>
                </article>)}</div>}
              </section>
            )}

            {activeTab === 'track' && (
              <section className="py-8 text-center">
                <h2 className="font-serif text-3xl">Track your order</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Enter your order number from Order History.
                </p>
                <form
                  onSubmit={trackFromProfile}
                  className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-3"
                >
                  <input
                    required
                    value={orderId}
                    onChange={(event) => setOrderId(event.target.value)}
                  placeholder="e.g. MMP-261024-AB12CD"
                    className="min-w-0 flex-1"
                  />
                  <button type="submit" className="rounded-full bg-rose px-6 py-3 text-sm font-medium text-white">
                    Track
                  </button>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  )
}
