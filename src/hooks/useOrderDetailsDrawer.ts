// src/hooks/useOrderDetailsDrawer.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminOrder } from '../api/admin/orders'
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

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
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
        setState({
          order: mapApiOrderToAdminDetail(data),
          loading: false,
          error: null,
        })
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
  }, [open, orderId, reloadToken])

  return {
    order: state.order,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
