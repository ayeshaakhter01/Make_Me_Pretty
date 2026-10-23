import { useEffect, useState } from 'react'
import { apiRequest } from '../../api.js'
import { card, td, th } from './adminHelpers.js'

const ROLE_LABELS = {
  customer: 'Customer',
  admin: 'Admin',
  deliveryPartner: 'Delivery Partner',
}

const FILTERS = [
  { value: 'all', label: 'All users' },
  { value: 'customer', label: 'Customers' },
  { value: 'admin', label: 'Admins' },
  { value: 'deliveryPartner', label: 'Delivery Partners' },
]

const EMPTY_STAFF_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'deliveryPartner',
}

const EMPTY_ADDRESS = {
  label: 'Home',
  recipientName: '',
  phone: '',
  addressLine: '',
  area: '',
  city: '',
  isDefault: false,
}

function normalizeUser(user) {
  const rawRole = String(user.role || 'customer').toLowerCase()
  const role =
    rawRole === 'deliverypartner' || rawRole === 'delivery partner'
      ? 'deliveryPartner'
      : rawRole === 'admin'
        ? 'admin'
        : 'customer'

  const addresses = (user.addresses || []).map((address) => ({
    ...address,
    id: String(address.id || address._id),
  }))

  const mainAddress =
    addresses.find((address) => address.isDefault) || addresses[0]

  const address =
    user.address ||
    (mainAddress
      ? [mainAddress.addressLine, mainAddress.area, mainAddress.city]
          .filter(Boolean)
          .join(', ')
      : '—')

  const joinedValue = user.joined || user.createdAt

  return {
    ...user,
    id: String(user.id || user._id),
    role,
    phone: user.phone || '',
    address,
    addresses,
    joined: joinedValue
      ? new Date(joinedValue).toLocaleDateString()
      : '—',
    orders: user.orders ?? user.orderCount ?? '—',
  }
}

function Field({ label, ...inputProps }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </span>
      <input {...inputProps} className="w-full" />
    </label>
  )
}

function AddressFields({ value, onChange }) {
  const fields = [
    ['label', 'Label', 'Home'],
    ['recipientName', 'Recipient name', 'Name'],
    ['phone', 'Phone', 'Phone number'],
    ['addressLine', 'Street address', 'House and street'],
    ['area', 'Area', 'Area'],
    ['city', 'City', 'City'],
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([field, label, placeholder]) => (
        <Field
          key={field}
          label={label}
          required
          placeholder={placeholder}
          value={value[field] || ''}
          onChange={(event) =>
            onChange({ ...value, [field]: event.target.value })
          }
        />
      ))}

      <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
        <input
          type="checkbox"
          checked={Boolean(value.isDefault)}
          onChange={(event) =>
            onChange({ ...value, isDefault: event.target.checked })
          }
        />
        Make this the default address
      </label>
    </div>
  )
}

export default function UsersPanel() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM)
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await apiRequest('/admin/users')
        setUsers((result.users || []).map(normalizeUser))
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  function replaceUser(updatedUser) {
    const normalized = normalizeUser(updatedUser)
    setUsers((current) =>
      current.map((user) =>
        user.id === normalized.id ? normalized : user,
      ),
    )
    setEditingUser(normalized)
  }

  function openEditor(user) {
    setEditingUser(user)
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    })
    setAddressFormOpen(false)
    setError('')
    setMessage('')
  }

  async function addStaff(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const result = await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(staffForm),
      })
      setUsers((current) => [normalizeUser(result.user), ...current])
      setStaffForm(EMPTY_STAFF_FORM)
      setShowStaffPassword(false)
      setShowAddForm(false)
      setMessage('Staff account created successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveDetails(event) {
    event.preventDefault()
    if (!editingUser) return

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const result = await apiRequest(`/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      })
      replaceUser(result.user)
      setMessage('User details updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveAddress(event) {
    event.preventDefault()
    if (!editingUser) return

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const path = editingAddressId
        ? `/admin/users/${editingUser.id}/addresses/${editingAddressId}`
        : `/admin/users/${editingUser.id}/addresses`

      const result = await apiRequest(path, {
        method: editingAddressId ? 'PATCH' : 'POST',
        body: JSON.stringify(addressForm),
      })

      replaceUser(result.user)
      setAddressFormOpen(false)
      setEditingAddressId(null)
      setAddressForm(EMPTY_ADDRESS)
      setMessage(editingAddressId ? 'Address updated.' : 'Address added.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAddress(address) {
    if (
      !editingUser ||
      !window.confirm(`Delete the ${address.label} address?`)
    ) {
      return
    }

    setError('')
    setMessage('')

    try {
      const result = await apiRequest(
        `/admin/users/${editingUser.id}/addresses/${address.id}`,
        { method: 'DELETE' },
      )
      replaceUser(result.user)
      setMessage('Address deleted.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function changeRole(user, role) {
    setError('')
    setMessage('')

    try {
      const result = await apiRequest(`/admin/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      const updated = normalizeUser(result.user)
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updated : item)),
      )
      setMessage(`${user.name}'s role updated.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Remove ${user.name}?`)) return

    setError('')
    setMessage('')

    try {
      await apiRequest(`/admin/users/${user.id}`, { method: 'DELETE' })
      setUsers((current) => current.filter((item) => item.id !== user.id))
      setMessage(`${user.name} was removed.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const text = search.trim().toLowerCase()
  const visibleUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesSearch =
      !text ||
      `${user.name} ${user.email} ${ROLE_LABELS[user.role]}`
        .toLowerCase()
        .includes(text)

    return matchesRole && matchesSearch
  })

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Users</h2>
          <p className="mt-1 text-sm text-ink-soft">
            View accounts, update details, and manage staff access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm((open) => !open)
            setError('')
            setMessage('')
          }}
          className="rounded-full bg-rose px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-deep"
        >
          {showAddForm ? 'Cancel' : '+ Add Staff Account'}
        </button>
      </div>

      {showAddForm && (
        <section className={`mb-6 rounded-3xl p-5 shadow-sm sm:p-6 ${card}`}>
          <div className="mb-5">
            <h3 className="font-serif text-xl">Create a staff account</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Create an Admin or Delivery Partner login.
            </p>
          </div>

          <form
            onSubmit={addStaff}
            autoComplete="off"
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field
              label="Full name"
              name="new-staff-name"
              autoComplete="off"
              required
              placeholder="Staff member’s name"
              value={staffForm.name}
              onChange={(event) =>
                setStaffForm({ ...staffForm, name: event.target.value })
              }
            />

            <Field
              label="Email"
              name="new-staff-email"
              type="email"
              autoComplete="off"
              required
              placeholder="name@example.com"
              value={staffForm.email}
              onChange={(event) =>
                setStaffForm({ ...staffForm, email: event.target.value })
              }
            />

            <Field
              label="Phone (optional)"
              name="new-staff-phone"
              type="tel"
              autoComplete="off"
              placeholder="Phone number"
              value={staffForm.phone}
              onChange={(event) =>
                setStaffForm({ ...staffForm, phone: event.target.value })
              }
            />

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Temporary password
              </span>
              <div className="relative">
                <input
                  name="new-staff-password"
                  type={showStaffPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="At least 8 characters"
                  value={staffForm.password}
                  onChange={(event) =>
                    setStaffForm({
                      ...staffForm,
                      password: event.target.value,
                    })
                  }
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowStaffPassword((visible) => !visible)
                  }
                  aria-label={
                    showStaffPassword ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                >
                  {showStaffPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Staff role
              </span>
              <select
                name="new-staff-role"
                autoComplete="off"
                value={staffForm.role}
                onChange={(event) =>
                  setStaffForm({ ...staffForm, role: event.target.value })
                }
              >
                <option value="admin">Admin</option>
                <option value="deliveryPartner">Delivery Partner</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? 'Creating account…' : 'Create Staff Account'}
              </button>
            </div>
          </form>
        </section>
      )}

      {error && (
        <p role="alert" className="mb-4 text-sm text-rose-deep">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 text-sm text-green-700">
          {message}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setRoleFilter(filter.value)}
            aria-pressed={roleFilter === filter.value}
            className={`rounded-full px-4 py-2.5 text-sm transition ${
              roleFilter === filter.value
                ? 'bg-ink text-ivory'
                : 'border border-line bg-cream text-ink-soft hover:bg-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, email, or role…"
        className="mb-4 !w-full sm:!w-96"
      />

      {loading ? (
        <p className="text-sm text-ink-soft">Loading users…</p>
      ) : (
        <div className={`overflow-x-auto ${card}`}>
          <table className="w-full min-w-[1050px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                {[
                  'Name',
                  'Email',
                  'Phone',
                  'Address',
                  'Role',
                  'Joined',
                  'Orders',
                  'Actions',
                ].map((heading) => (
                  <th key={heading} className={th}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.length === 0 ? (
                <tr>
                  <td className={td} colSpan={8}>
                    No users match this filter.
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td className={`${td} font-semibold`}>{user.name}</td>
                    <td className={`${td} text-ink-soft`}>{user.email}</td>
                    <td className={`${td} text-ink-soft`}>
                      {user.phone || '—'}
                    </td>
                    <td className={`${td} max-w-[220px] text-ink-soft`}>
                      {user.address || '—'}
                    </td>
                    <td className={td}>
                      <select
                        value={user.role}
                        onChange={(event) =>
                          changeRole(user, event.target.value)
                        }
                        className="!w-auto !py-2 text-[13px]"
                        aria-label={`Role for ${user.name}`}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="deliveryPartner">Delivery Partner</option>
                      </select>
                    </td>
                    <td className={`${td} text-ink-soft`}>{user.joined}</td>
                    <td className={td}>{user.orders}</td>
                    <td className={td}>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => openEditor(user)}
                          className="text-xs underline hover:text-rose"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUser(user)}
                          className="text-xs text-ink-soft underline hover:text-rose"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/35 p-4 backdrop-blur-[2px] animate-fadeup"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingUser(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="my-6 max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-cream p-5 shadow-[0_24px_70px_rgba(59,48,44,.2)] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <h3 id="edit-user-title" className="font-serif text-2xl">
                  Edit user
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Update account details and saved delivery addresses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                aria-label="Close edit dialog"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg text-ink-soft transition hover:bg-white hover:text-ink"
              >
                ×
              </button>
            </div>

            {error && (
              <p role="alert" className="mb-4 text-sm text-rose-deep">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="mb-4 text-sm text-green-700">
                {message}
              </p>
            )}

            <form
              onSubmit={saveDetails}
              className="mb-8 grid gap-4 rounded-2xl border border-line bg-white/70 p-4 sm:grid-cols-2 sm:p-5"
            >
              <h4 className="font-medium sm:col-span-2">Account details</h4>

              <Field
                label="Name"
                required
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, name: event.target.value })
                }
              />
              <Field
                label="Email"
                required
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, email: event.target.value })
                }
              />
              <Field
                label="Phone"
                type="tel"
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, phone: event.target.value })
                }
              />

              <div className="flex items-end sm:col-span-2">
                <button
                  disabled={saving}
                  className="w-full rounded-full bg-rose px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-deep disabled:opacity-60 sm:w-auto"
                >
                  {saving ? 'Saving…' : 'Save account details'}
                </button>
              </div>
            </form>

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-xl">Saved addresses</h4>
                  <p className="mt-1 text-sm text-ink-soft">
                    Add, edit, or remove this user’s delivery addresses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null)
                    setAddressForm({ ...EMPTY_ADDRESS })
                    setAddressFormOpen(true)
                  }}
                  className="rounded-full border border-line px-4 py-2.5 text-sm transition hover:bg-white"
                >
                  + Add address
                </button>
              </div>

              {editingUser.addresses.length === 0 && !addressFormOpen && (
                <p className="rounded-2xl border border-dashed border-line bg-white/50 p-5 text-sm text-ink-soft">
                  No saved addresses yet.
                </p>
              )}

              <div className="grid gap-3">
                {editingUser.addresses.map((address) => (
                  <article
                    key={address.id}
                    className="rounded-2xl border border-line bg-white/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {address.label}
                          {address.isDefault && (
                            <span className="ml-2 rounded-full bg-ink px-2.5 py-1 text-xs text-ivory">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="mt-2 text-sm text-ink-soft">
                          {address.recipientName} · {address.phone}
                        </p>
                        <p className="text-sm text-ink-soft">
                          {[address.addressLine, address.area, address.city]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddressId(address.id)
                            setAddressForm({
                              ...EMPTY_ADDRESS,
                              ...address,
                            })
                            setAddressFormOpen(true)
                          }}
                          className="underline hover:text-rose"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAddress(address)}
                          className="text-rose-deep underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {addressFormOpen && (
                <form
                  onSubmit={saveAddress}
                  className="mt-4 grid gap-4 rounded-2xl border border-rose/30 bg-white/70 p-4 sm:p-5"
                >
                  <div>
                    <h5 className="font-medium">
                      {editingAddressId ? 'Edit address' : 'Add address'}
                    </h5>
                    <p className="mt-1 text-sm text-ink-soft">
                      Fill in the delivery details below.
                    </p>
                  </div>

                  <AddressFields
                    value={addressForm}
                    onChange={setAddressForm}
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={saving}
                      className="rounded-full bg-ink px-5 py-2.5 text-sm text-ivory disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressFormOpen(false)}
                      className="rounded-full border border-line px-5 py-2.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>
          </section>
        </div>
      )}
    </div>
  )
}