// src/hooks/useOrderDetailsDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminOrder } from '../api/admin/orders'
import { getAdminCustomer } from '../api/admin/customers'
import { ApiError } from '../lib/api'
import type { AdminOrderDetail } from '../types/adminOrders'
import { mapApiOrderToAdminDetail } from '../utils/adminOrdersFormat'

interface UseOrderDetailsDrawerOptions {
  open: boolean
  orderId: string | null
}

interface OrderDetailsState {
  order: AdminOrderDetail | null
  loading: boolean
  error: string | null
}

export function useOrderDetailsDrawer({ open, orderId }: UseOrderDetailsDrawerOptions) {
  const [state, setState] = useState<OrderDetailsState>({
    order: null,
    loading: false,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const loadCustomerOrdersCount = useCallback(async (customerId: string, requestId: number) => {
    try {
      const response = await getAdminCustomer(customerId)
      if (requestId !== requestIdRef.current) return
      const ordersCount = response.data?.orders
      if (typeof ordersCount !== 'number') return
      setState((prev) =>
        prev.order
          ? { ...prev, order: { ...prev.order, userOrdersCount: ordersCount } }
          : prev,
      )
    } catch {
      // Best-effort only — the drawer works fine without this count.
    }
  }, [])

  useEffect(() => {
    if (!open || !orderId) {
      setState({ order: null, loading: false, error: null })
      return
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    setState((prev) => ({
      order: prev.order?.id === orderId ? prev.order : null,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminOrder(orderId, { signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setState({
            order: null,
            loading: false,
            error: response.message || 'Order not found',
          })
          return
        }
        const detail = mapApiOrderToAdminDetail(data)
        setState({
          order: detail,
          loading: false,
          error: null,
        })

        // Nice-to-have: customer orders count from GET /users/:id — best-effort, never blocks the drawer.
        if (detail.customerId) {
          void loadCustomerOrdersCount(detail.customerId, requestId)
        }
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to load order'
        setState({ order: null, loading: false, error: message })
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, orderId, reloadToken, loadCustomerOrdersCount])

  return {
    order: state.order,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
