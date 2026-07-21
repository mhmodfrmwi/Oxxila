// src/hooks/useShipmentDetailsDrawer.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminShipment } from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import type { AdminShipmentDetail } from '../types/adminShipping'
import { mapApiShipmentDetailToAdmin } from '../utils/adminShippingFormat'

interface UseShipmentDetailsDrawerOptions {
  open: boolean
  /** Order id from the Orders Shipping table. */
  orderId: string | null
}

interface ShipmentDetailsState {
  shipment: AdminShipmentDetail | null
  loading: boolean
  error: string | null
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useShipmentDetailsDrawer({
  open,
  orderId,
}: UseShipmentDetailsDrawerOptions) {
  const [state, setState] = useState<ShipmentDetailsState>({
    shipment: null,
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
      setState({ shipment: null, loading: false, error: null })
      return
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    setState((prev) => ({
      shipment: prev.shipment?.id === orderId ? prev.shipment : null,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminShipment(orderId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data?.order) {
          setState({
            shipment: null,
            loading: false,
            error: response.message || 'Shipment not found',
          })
          return
        }
        setState({
          shipment: mapApiShipmentDetailToAdmin(data),
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
              : 'Unable to load shipment'
        setState({ shipment: null, loading: false, error: message })
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, orderId, reloadToken])

  return {
    shipment: state.shipment,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
