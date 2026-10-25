import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../api.js'

const money = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    if (!orderId) return undefined
    let active = true
    let timer
    let checks = 0
    const loadOrder = async () => {
      try {
        const current = await apiRequest(`/orders/${encodeURIComponent(orderId)}`)
        if (!active) return
        setOrder(current)
        setError('')
        checks += 1
        if (current.paymentStatus === 'pending' && checks < 6) timer = window.setTimeout(loadOrder, 1500)
        else setChecking(false)
      } catch (problem) {
        if (!active) return
        setError(problem.message || 'Could not load this order.')
        setChecking(false)
      }
    }
    loadOrder()
    return () => { active = false; window.clearTimeout(timer) }
  }, [orderId, refreshCount])

  function refreshPaymentStatus() {
    setError('')
    setChecking(true)
    setRefreshCount((count) => count + 1)
  }

  async function retryPayment() {
    if (!order?._id || !globalThis.crypto?.randomUUID || retrying) return
    setRetrying(true)
    setError('')
    try {
      const attempt = await apiRequest('/payments/sslcommerz/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId: order._id }),
        headers: { 'Idempotency-Key': globalThis.crypto.randomUUID() },
      })
      window.location.assign(attempt.redirectUrl)
    } catch (problem) { setError(problem.message || 'Could not reopen SSLCommerz checkout.') }
    finally { setRetrying(false) }
  }

  const paid = order?.paymentStatus === 'paid'
  const refunded = order?.paymentStatus === 'refunded'
  const failed = order?.paymentStatus === 'failed'
  const cancelled = order?.paymentStatus === 'cancelled'
  const isChecking = Boolean(orderId) && checking
  const canRetry = ['failed', 'cancelled'].includes(order?.paymentStatus)
    && order?.paymentMethod === 'sslcommerz' && order.status !== 'cancelled'

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-ink/50 px-4 py-8" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="payment-result-title" className="relative w-full max-w-lg rounded-[24px] bg-white px-6 py-8 text-center shadow-2xl sm:px-10">
        <Link to="/account/profile" aria-label="Close payment confirmation" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-line text-lg text-muted hover:bg-cream">×</Link>
        {paid ? (
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-soft text-2xl text-rose-deep">✓</div>
        ) : (
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-cream text-2xl text-rose-deep">{isChecking ? '…' : '!'}</div>
        )}
        <p className="mt-5 text-xs uppercase tracking-[0.18em] text-rose">{paid ? 'Order received' : 'SSLCommerz payment'}</p>
        <h1 id="payment-result-title" className="mt-3 font-display text-3xl sm:text-4xl">
          {paid ? 'Payment confirmed!' : refunded ? 'Payment refunded' : failed ? 'Payment was not completed' : cancelled ? 'Payment cancelled' : isChecking ? 'Confirming your payment…' : order?.paymentStatus === 'pending' ? 'Payment is being verified' : 'Payment status unavailable'}
        </h1>

        {order ? (
          <div className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">
            <p>Your order <strong>{order.orderNumber || order._id}</strong>{paid ? ' is confirmed.' : ' is saved.'}</p>
            <p className="mt-1">Order total: <strong>{money(order.total)}</strong></p>
            <p>Payment status: <strong className="capitalize">{order.paymentStatus}</strong></p>
            {!paid && order.paymentStatus === 'pending' && <p className="mt-2">We’re checking the payment with SSLCommerz. This page uses the verified order status from our server.</p>}
          </div>
        ) : (
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">{error || (isChecking ? 'Loading your order status…' : 'We could not find the order reference. Open My Orders to check the latest status.')}</p>
        )}

        {error && order && <p role="alert" className="mt-3 text-sm text-lowstock-text">{error}</p>}
        {isChecking && order && <p className="mt-3 text-xs text-muted">Refreshing verified status…</p>}
        {!isChecking && (error || order?.paymentStatus === 'pending') && (
          <button type="button" onClick={refreshPaymentStatus} className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-rose-deep">
            {error ? 'Retry status check' : 'Check status again'}
          </button>
        )}
        {canRetry && (
          <button type="button" disabled={retrying} onClick={retryPayment} className="mt-5 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
            {retrying ? 'Opening checkout…' : 'Try payment again'}
          </button>
        )}
        {order && <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
          <Link to={`/track?id=${encodeURIComponent(order.orderNumber || '')}&phone=${encodeURIComponent(order.address?.phone || '')}`} className="text-rose-deep underline">Track order</Link>
          <Link to="/account/profile" className="text-rose-deep underline">My orders</Link>
        </div>}
        {!order && <Link to="/account/profile" className="mt-6 inline-block text-sm text-rose-deep underline">My orders</Link>}
      </section>
    </div>
  )
}
