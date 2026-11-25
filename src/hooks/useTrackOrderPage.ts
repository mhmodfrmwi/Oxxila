// src/hooks/useTrackOrderPage.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { getMe } from '../api/auth'
import { cancelMyOrder, getMyOrder } from '../api/orders'
import { LOGIN_PATH, RETURNS_PATH, SHOP_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import type { ApiOrder } from '../types/order'
import { canCancelOrder, canReturnOrder } from '../utils/orderTracking'

export function useTrackOrderPage() {
  const { t } = useTranslation()
  const { orderId = '' } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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
        const profile = profileResponse.data as { name?: string; phone?: string } | undefined
        setCustomerName(profile?.name ?? '')
        setCustomerPhone(profile?.phone ?? '')
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : t('checkout.track.loadError'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, orderId, t])

  async function handleCancelOrder() {
    if (!order || !canCancelOrder(order)) return

    setActionError(null)
    setCancelling(true)

    try {
      const response = await cancelMyOrder(order._id)
      if (response.data) setOrder(response.data)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t('checkout.track.cancelError'))
    } finally {
      setCancelling(false)
    }
  }

  function handleReturnOrder() {
    navigate(RETURNS_PATH)
  }

  function handleContinueShopping() {
    navigate(SHOP_PATH)
  }

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    orderId,
    order,
    customerName,
    customerPhone,
    loading,
    cancelling,
    error,
    actionError,
    canCancel: order ? canCancelOrder(order) : false,
    canReturn: order ? canReturnOrder(order) : false,
    handleCancelOrder,
    handleReturnOrder,
    handleContinueShopping,
  }
}
