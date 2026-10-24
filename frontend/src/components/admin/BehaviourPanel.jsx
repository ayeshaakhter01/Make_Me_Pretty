import { useEffect, useMemo, useState } from 'react'
import StatCard from './StatCard.jsx'
import { CANCELLED, card, cx, money, td, th, timeAgo } from './adminHelpers.js'
import { apiRequest } from '../../api.js'

/* One horizontal bar in the "most wishlisted / most added to cart" lists. */
function RankBar({ label, note, value, max, unit }) {
  const width = max > 0 ? Math.max(6, (value / max) * 100) : 0
  return (
    <div className="py-2">
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate">{label}</span>
        <span className="whitespace-nowrap text-ink-soft">{value} {unit}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-2">
        <div className="h-full rounded-full bg-gradient-to-r from-pink to-rose" style={{ width: `${width}%` }} />
      </div>
      {note && <div className="mt-0.5 text-[11px] text-ink-soft">{note}</div>}
    </div>
  )
}

/* One of the three big boxes. Clicking it switches the section underneath. */
function SummaryBox({ active, onClick, label, value, accent, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx('rounded-[22px] border-[1.5px] p-5 text-left transition-all', active ? 'border-rose bg-pink-soft' : 'border-line bg-cream hover:border-rose/50')}
    >
      <div className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{label}</div>
      <div className="mt-1.5 font-serif text-[28px]" style={{ color: accent }}>{value}</div>
      <div className={cx('mt-1 text-[12px]', active ? 'text-rose' : 'text-ink-soft')}>{hint}</div>
    </button>
  )
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

/* BEHAVIOUR: how customers use the shop.
   - Per customer: orders, money spent, what is in their cart and wishlist, contact details.
   - Averages across all customers.
   - Abandoned carts (items left in a cart) and the products added to carts most.
   - Wishlist saves and the most wishlisted products.
   Everything is worked out from the lists the dashboard already holds. */
export default function BehaviourPanel() {
  const [source, setSource] = useState({ users: [], orders: [], products: [], carts: [], wishlists: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('customers') // customers | carts | wishlist
  const [open, setOpen] = useState(null) // id of the customer row that is expanded
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    apiRequest('/admin/reports/behaviour').then((data) => { if (!cancelled) setSource(data) })
      .catch((problem) => { if (!cancelled) setError(problem.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const { users, orders, products, carts, wishlists } = source

  const data = useMemo(() => {
    const productById = new Map(products.map((p) => [String(p.id), p]))
    const userById = new Map(users.map((u) => [u.id, u]))
    const nameOf = (id) => productById.get(String(id))?.name ?? 'Removed product'

    /* wishlist: how many customers saved each product */
    const wishCount = new Map()
    wishlists.forEach((list) => list.productIds.forEach((id) => wishCount.set(String(id), (wishCount.get(String(id)) ?? 0) + 1)))
    const mostWishlisted = [...wishCount.entries()]
      .map(([id, count]) => ({ id, name: nameOf(id), type: productById.get(id)?.type ?? '', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    const wishlistSaves = [...wishCount.values()].reduce((sum, n) => sum + n, 0)

    /* carts: price every line with the product's current price */
    const pricedCarts = carts
      .filter((cart) => cart.items.length > 0)
      .map((cart) => {
        const user = userById.get(cart.userId)
        const lines = cart.items.map((item) => ({ ...item, name: nameOf(item.id), price: productById.get(String(item.id))?.price ?? 0 }))
        return {
          userId: cart.userId,
          name: user?.name ?? 'Guest visitor',
          email: user?.email ?? 'not signed in',
          updatedAt: cart.updatedAt,
          lines,
          units: lines.reduce((sum, l) => sum + l.qty, 0),
          total: lines.reduce((sum, l) => sum + l.price * l.qty, 0),
        }
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    const cartAgg = new Map() // product id -> { qty, carts }
    pricedCarts.forEach((cart) => cart.lines.forEach((l) => {
      const now = cartAgg.get(String(l.id)) ?? { qty: 0, carts: 0 }
      cartAgg.set(String(l.id), { qty: now.qty + l.qty, carts: now.carts + 1 })
    }))
    const mostCarted = [...cartAgg.entries()]
      .map(([id, v]) => ({ id, name: nameOf(id), ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)

    /* one row per customer account.
       Orders are matched by name for now; once the backend gives every order a user id, match on that. */
    const customers = users
      .filter((u) => u.role?.toLowerCase() === 'customer')
      .map((u) => {
        const placed = orders.filter((o) => o.customerId === u.id && o.status !== CANCELLED)
        const bought = new Map()
        placed.forEach((o) => (o.lines ?? []).forEach((l) => bought.set(l.name, (bought.get(l.name) ?? 0) + l.qty)))
        const cart = pricedCarts.find((c) => c.userId === u.id)
        const wished = wishlists.find((w) => w.userId === u.id)?.productIds ?? []
        return {
          ...u,
          orderCount: placed.length,
          spent: placed.reduce((sum, o) => sum + o.total, 0),
          bought: [...bought.entries()].map(([name, qty]) => ({ name, qty })),
          cart,
          wishlist: wished.map(nameOf),
        }
      })
      .sort((a, b) => b.spent - a.spent)

    /* averages across all customers */
    const count = customers.length || 1 // avoids dividing by zero
    const abandonedValue = pricedCarts.reduce((sum, c) => sum + c.total, 0)
    const averages = {
      orders: customers.reduce((sum, c) => sum + c.orderCount, 0) / count,
      spent: Math.round(customers.reduce((sum, c) => sum + c.spent, 0) / count),
      cart: pricedCarts.length ? Math.round(abandonedValue / pricedCarts.length) : 0,
      wishlist: customers.reduce((sum, c) => sum + c.wishlist.length, 0) / count,
    }

    return { customers, pricedCarts, abandonedValue, mostCarted, mostWishlisted, wishlistSaves, averages }
  }, [users, orders, products, carts, wishlists])

  const { customers, pricedCarts, abandonedValue, mostCarted, mostWishlisted, wishlistSaves, averages } = data
  const text = search.trim().toLowerCase()
  const shownCustomers = customers.filter((c) => !text || `${c.name} ${c.email}`.toLowerCase().includes(text))

  return (
    <div className="grid gap-6">
      {loading && <p className={`${card} p-5 text-sm text-ink-soft`}>Loading account, order, cart and wishlist activity from MongoDB…</p>}
      {error && <p role="alert" className="text-sm text-lowstock-text">{error}</p>}
      {/* averages */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Avg. orders / customer" value={averages.orders.toFixed(1)} />
        <StatCard label="Avg. spend / customer" value={money(averages.spent)} accent="var(--color-rose)" />
        <StatCard label="Avg. abandoned cart" value={money(averages.cart)} accent="#B3543D" />
        <StatCard label="Avg. wishlist size" value={averages.wishlist.toFixed(1)} accent="var(--color-gold)" />
      </div>

      {/* the three boxes */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryBox active={view === 'customers'} onClick={() => setView('customers')} label="Signed-up customers" value={customers.length} accent="var(--color-ink)" hint="See each customer’s activity →" />
        <SummaryBox active={view === 'carts'} onClick={() => setView('carts')} label="Abandoned carts" value={pricedCarts.length} accent="#B3543D" hint={`${money(abandonedValue)} waiting in carts →`} />
        <SummaryBox active={view === 'wishlist'} onClick={() => setView('wishlist')} label="Total wishlist saves" value={wishlistSaves} accent="var(--color-gold)" hint="Most wishlisted products →" />
      </div>

      {/* ---------- per customer ---------- */}
      {view === 'customers' && (
        <div className={`${card} p-6`}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg">Per-customer activity</h3>
              <p className="text-[13px] text-ink-soft">Orders and spend (cancelled orders left out), cart, wishlist and contact details.</p>
            </div>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers..." className="!w-full sm:!w-60" />
          </div>

          {shownCustomers.length === 0 ? (
            <p className="text-sm text-ink-soft">No customers found.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line">
              {shownCustomers.map((customer, index) => {
                const isOpen = open === customer.id
                return (
                  <div key={customer.id} className={index > 0 ? 'border-t border-line' : ''}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : customer.id)}
                      aria-expanded={isOpen}
                      className={cx('flex w-full items-center gap-3 px-4 py-3 text-left transition-colors', isOpen ? 'bg-pink-soft' : 'bg-ivory hover:bg-pink-soft/50')}
                    >
                      <span className={cx('text-rose transition-transform', isOpen && 'rotate-90')}>▸</span>
                      <span className="grid size-8 flex-shrink-0 place-items-center rounded-full bg-pink text-[13px] font-semibold uppercase text-rose-deep">{customer.name[0]}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{customer.name}</span>
                        <span className="block truncate text-[11px] text-ink-soft">{customer.email}</span>
                      </span>
                      <span className="whitespace-nowrap text-right text-[13px]">
                        <span className="block font-semibold">{plural(customer.orderCount, 'order')}</span>
                        <span className="block text-[11px] text-ink-soft">{money(customer.spent)}</span>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="grid gap-1.5 bg-ivory px-4 pb-4 pt-1 text-[13px]">
                        <div>
                          <span className="text-ink-soft">Ordered: </span>
                          {customer.bought.length ? customer.bought.map((p) => `${p.name} ×${p.qty}`).join(', ') : 'nothing yet'}
                        </div>
                        <div>
                          <span className="text-ink-soft">Cart: </span>
                          {customer.cart ? `${customer.cart.lines.map((l) => `${l.name} ×${l.qty}`).join(', ')} (${money(customer.cart.total)})` : 'empty'}
                        </div>
                        <div>
                          <span className="text-ink-soft">Wishlist: </span>
                          {customer.wishlist.length ? customer.wishlist.join(', ') : 'empty'}
                        </div>
                        <div className="mt-2 grid gap-1 border-t border-line pt-2">
                          <div><span className="text-ink-soft">Phone: </span>{customer.phone || '—'}</div>
                          <div><span className="text-ink-soft">Email: </span>{customer.email}</div>
                          <div><span className="text-ink-soft">Address: </span>{customer.address || 'No saved address'}</div>
                          <div><span className="text-ink-soft">Joined: </span>{customer.joined}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------- carts ---------- */}
      {view === 'carts' && (
        <div className="grid gap-4">
          <div className={`${card} p-6`}>
            <h3 className="mb-3 font-serif text-lg">Most added to cart</h3>
            {mostCarted.length === 0 ? (
              <p className="text-sm text-ink-soft">No cart activity yet.</p>
            ) : mostCarted.map((p) => (
              <RankBar key={p.id} label={p.name} note={plural(p.carts, 'cart')} value={p.qty} max={mostCarted[0].qty} unit={p.qty === 1 ? 'unit' : 'units'} />
            ))}
          </div>

          <div className={`${card} p-6`}>
            <h3 className="mb-1 font-serif text-lg">Abandoned carts</h3>
            <p className="mb-4 text-[13px] text-ink-soft">People who left items in their cart. A good moment for a reminder or a coupon.</p>
            {pricedCarts.length === 0 ? (
              <p className="text-sm text-ink-soft">No abandoned carts. Nice!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                      {['Customer', 'Items', 'Cart value', 'Last active'].map((heading) => <th key={heading} className={th}>{heading}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pricedCarts.map((cart) => (
                      <tr key={cart.userId}>
                        <td className={td}>
                          <div className="font-medium">{cart.name}</div>
                          <div className="text-xs text-ink-soft">{cart.email}</div>
                        </td>
                        <td className={td}>
                          <div>{plural(cart.units, 'unit')}</div>
                          <div className="text-xs text-ink-soft">{cart.lines.map((l) => `${l.name} ×${l.qty}`).join(', ')}</div>
                        </td>
                        <td className={`${td} font-semibold`}>{money(cart.total)}</td>
                        <td className={`${td} text-ink-soft`}>{timeAgo(cart.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- wishlist ---------- */}
      {view === 'wishlist' && (
        <div className={`${card} p-6`}>
          <h3 className="mb-3 font-serif text-lg">Most wishlisted products</h3>
          {mostWishlisted.length === 0 ? (
            <p className="text-sm text-ink-soft">No wishlist activity yet.</p>
          ) : mostWishlisted.map((p) => (
            <RankBar key={p.id} label={p.name} note={p.type} value={p.count} max={mostWishlisted[0].count} unit={p.count === 1 ? 'save' : 'saves'} />
          ))}
        </div>
      )}
    </div>
  )
}
