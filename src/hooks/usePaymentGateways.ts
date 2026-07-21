// src/hooks/usePaymentGateways.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminPaymentGateways,
  updateAdminPaymentGateway,
} from '../api/admin/paymentGateways'
import { ApiError } from '../lib/api'
import type {
  AdminPaymentGatewayCode,
  AdminPaymentGatewayRow,
  ApiAdminPaymentGateway,
} from '../types/adminPaymentGateways'

function mapGateway(gateway: ApiAdminPaymentGateway): AdminPaymentGatewayRow {
  return {
    id: String(gateway._id),
    code: gateway.code,
    name: gateway.name?.trim() || gateway.code,
    isEnabled: Boolean(gateway.isEnabled),
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

interface PaymentGatewaysState {
  gateways: AdminPaymentGatewayRow[]
  loading: boolean
  error: string | null
  enablingCode: AdminPaymentGatewayCode | null
}

export function usePaymentGateways() {
  const [state, setState] = useState<PaymentGatewaysState>({
    gateways: [],
    loading: true,
    error: null,
    enablingCode: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminPaymentGateways({
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        setState((previous) => ({
          ...previous,
          gateways: (response.data ?? []).map(mapGateway),
          loading: false,
          error: null,
        }))
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current)
          return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load payment gateways.',
          ...(previous.gateways.length === 0 ? { gateways: [] } : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken])

  const enableGateway = useCallback(async (code: AdminPaymentGatewayCode) => {
    setState((previous) => ({ ...previous, enablingCode: code }))
    try {
      const response = await updateAdminPaymentGateway(code, true)
      const updated = response.data
      if (!updated) {
        throw new ApiError(response.message || 'Unable to enable gateway.')
      }
      const row = mapGateway(updated)
      setState((previous) => ({
        ...previous,
        enablingCode: null,
        gateways: previous.gateways.map((gateway) =>
          gateway.code === code ? row : gateway,
        ),
      }))
    } catch (error) {
      setState((previous) => ({
        ...previous,
        enablingCode: null,
        error:
          error instanceof ApiError
            ? error.message
            : 'Unable to enable payment gateway.',
      }))
    }
  }, [])

  return {
    gateways: state.gateways,
    loading: state.loading,
    error: state.error,
    enablingCode: state.enablingCode,
    reload,
    enableGateway,
  }
}
