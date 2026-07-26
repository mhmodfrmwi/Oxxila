// src/hooks/usePaymentGateways.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAdminPaymentGateways,
  updateAdminPaymentGateway,
} from '../api/admin/paymentGateways'
import { useToast } from '../context/ToastContext'
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

function resolveToggleError(error: unknown, t: (key: string) => string): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t('admin.settings.payments.toggle.errors.badRequest')
      case 401:
        return t('admin.settings.payments.toggle.errors.unauthorized')
      case 403:
        return t('admin.settings.payments.toggle.errors.forbidden')
      case 404:
        return t('admin.settings.payments.toggle.errors.notFound')
      case 500:
        return t('admin.settings.payments.toggle.errors.server')
      default:
        return t('admin.settings.payments.toggle.errors.unknown')
    }
  }

  return t('admin.settings.payments.toggle.errors.network')
}

interface PaymentGatewaysState {
  gateways: AdminPaymentGatewayRow[]
  loading: boolean
  error: string | null
  mutatingCode: AdminPaymentGatewayCode | null
}

/**
 * Payment gateways list + enable/disable via PATCH /payments/gateways/:code.
 */
export function usePaymentGateways() {
  const { t } = useTranslation()
  const toast = useToast()
  const [state, setState] = useState<PaymentGatewaysState>({
    gateways: [],
    loading: true,
    error: null,
    mutatingCode: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)
  const gatewaysRef = useRef<AdminPaymentGatewayRow[]>([])
  const mutatingCodeRef = useRef<AdminPaymentGatewayCode | null>(null)

  useEffect(() => {
    gatewaysRef.current = state.gateways
  }, [state.gateways])

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

  const setGatewayEnabled = useCallback(
    async (code: AdminPaymentGatewayCode, nextEnabled: boolean) => {
      if (mutatingCodeRef.current) return false
      mutatingCodeRef.current = code

      const snapshot = gatewaysRef.current
      const target = snapshot.find((gateway) => gateway.code === code)

      setState((previous) => ({
        ...previous,
        mutatingCode: code,
        gateways: previous.gateways.map((gateway) =>
          gateway.code === code
            ? { ...gateway, isEnabled: nextEnabled }
            : gateway,
        ),
      }))

      try {
        const response = await updateAdminPaymentGateway(code, nextEnabled)
        const updated = response.data
        setState((previous) => ({
          ...previous,
          mutatingCode: null,
          gateways: previous.gateways.map((gateway) =>
            gateway.code === code
              ? updated
                ? mapGateway(updated)
                : { ...gateway, isEnabled: nextEnabled }
              : gateway,
          ),
        }))
        toast.success(
          t(
            nextEnabled
              ? 'admin.settings.payments.toggle.enabled'
              : 'admin.settings.payments.toggle.disabled',
            { name: target?.name ?? code },
          ),
        )
        return true
      } catch (error) {
        setState((previous) => ({
          ...previous,
          mutatingCode: null,
          gateways: snapshot.length > 0 ? snapshot : previous.gateways,
        }))
        toast.error(
          t('admin.settings.payments.toggle.errorTitle'),
          resolveToggleError(error, t),
        )
        return false
      } finally {
        mutatingCodeRef.current = null
      }
    },
    [t, toast],
  )

  const enableGateway = useCallback(
    (code: AdminPaymentGatewayCode) => setGatewayEnabled(code, true),
    [setGatewayEnabled],
  )

  const disableGateway = useCallback(
    (code: AdminPaymentGatewayCode) => setGatewayEnabled(code, false),
    [setGatewayEnabled],
  )

  return {
    gateways: state.gateways,
    loading: state.loading,
    error: state.error,
    mutatingCode: state.mutatingCode,
    reload,
    enableGateway,
    disableGateway,
  }
}
