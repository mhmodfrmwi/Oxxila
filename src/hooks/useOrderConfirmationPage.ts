// src/hooks/useOrderConfirmationPage.ts
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getMe } from '../api/auth'
import { getMyOrder } from '../api/orders'
import { LOGIN_PATH, SHOP_PATH, trackOrderPath } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ApiError } from '../lib/api'
import type { ApiOrder } from '../types/order'

export function useOrderConfirmationPage() {
  const { orderId: routeOrderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { refreshCart } = useCart()

  const orderId = routeOrderId ?? searchParams.get('orderId') ?? ''

  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !orderId) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setError(null)

      try {
        const [orderResponse, profileResponse] = await Promise.all([
          getMyOrder(orderId),
          getMe(),
        ])
        if (cancelled) return

        const loadedOrder = orderResponse.data
        if (!loadedOrder) {
          throw new ApiError('Order not found', 404)
        }

        setOrder(loadedOrder)
        setCustomerName(profileResponse.data?.name ?? '')
        setCustomerEmail(profileResponse.data?.email ?? '')
        void refreshCart()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Unable to load order confirmation.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, orderId, refreshCart])

  function handleContinueShopping() {
    navigate(SHOP_PATH)
  }

  function handleTrackOrder() {
    if (!orderId) return
    navigate(trackOrderPath(orderId))
  }

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    orderId,
    order,
    customerName,
    customerEmail,
    loading,
    error,
    handleContinueShopping,
    handleTrackOrder,
  }
}
