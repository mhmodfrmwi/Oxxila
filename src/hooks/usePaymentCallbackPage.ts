import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPaymentSessionStatus } from '../api/orders'
import { HOME_PATH, LOGIN_PATH, CHECKOUT_PATH, trackOrderPath } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { ApiOrder } from '../types/order'

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 20
const SUCCESS_REDIRECT_MS = 2000

export type PaymentCallbackStatus = 'loading' | 'success' | 'failed'

function resolveOrderId(order: ApiOrder | string | undefined): string | null {
  if (!order) return null
  if (typeof order === 'string') return order.trim() || null
  return order._id ?? null
}

export function usePaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')?.trim() ?? ''
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { refreshCart } = useCart()

  const [status, setStatus] = useState<PaymentCallbackStatus>(() =>
    sessionId ? 'loading' : 'failed',
  )
  const [orderId, setOrderId] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)

  useEffect(() => {
    if (!sessionId || !isAuthenticated) return

    let cancelled = false
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    async function poll() {
      if (cancelled) return

      attempts += 1

      try {
        const response = await getPaymentSessionStatus(sessionId)
        if (cancelled) return

        const data = response.data
        if (!data) {
          if (attempts >= MAX_ATTEMPTS) {
            setStatus('failed')
            return
          }
          timer = setTimeout(poll, POLL_INTERVAL_MS)
          return
        }

        if (typeof data.totalPrice === 'number') {
          setTotalPrice(data.totalPrice)
        }

        if (data.status === 'completed') {
          const resolvedOrderId = resolveOrderId(data.order)
          if (resolvedOrderId) {
            setOrderId(resolvedOrderId)
            setStatus('success')
            void refreshCart()
            timer = setTimeout(() => {
              if (!cancelled) {
                navigate(trackOrderPath(resolvedOrderId), { replace: true })
              }
            }, SUCCESS_REDIRECT_MS)
            return
          }
        }

        if (data.status === 'failed') {
          setStatus('failed')
          return
        }

        if (attempts >= MAX_ATTEMPTS) {
          setStatus('failed')
          return
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS)
      } catch {
        if (cancelled) return

        if (attempts >= MAX_ATTEMPTS) {
          setStatus('failed')
          return
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId, isAuthenticated, navigate, refreshCart])

  function handleRetry() {
    navigate(CHECKOUT_PATH)
  }

  function handleGoHome() {
    navigate(HOME_PATH, { replace: true })
  }

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    sessionId,
    status,
    orderId,
    totalPrice,
    handleRetry,
    handleGoHome,
  }
}
