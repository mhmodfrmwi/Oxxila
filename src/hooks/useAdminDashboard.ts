// src/hooks/useAdminDashboard.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAdminDashboardOverview,
  getAdminDashboardRevenue,
} from '../api/admin/dashboard'
import { getAdminPaymentSummary } from '../api/admin/payments'
import { ApiError } from '../lib/api'
import type {
  DashboardOverviewData,
  DashboardPaymentSummary,
  DashboardRevenueChartData,
  RevenueInterval,
} from '../types/adminDashboard'

const DEFAULT_PERIOD_DAYS = 30
const DEFAULT_LIST_LIMIT = 5

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function resolvePaymentSummaryError(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t('admin.dashboard.paymentSummary.errors.badRequest')
      case 401:
        return t('admin.dashboard.paymentSummary.errors.unauthorized')
      case 403:
        return t('admin.dashboard.paymentSummary.errors.forbidden')
      case 404:
        return t('admin.dashboard.paymentSummary.errors.notFound')
      case 409:
        return t('admin.dashboard.paymentSummary.errors.conflict')
      case 500:
        return t('admin.dashboard.paymentSummary.errors.server')
      default:
        return t('admin.dashboard.paymentSummary.errors.unknown')
    }
  }

  return t('admin.dashboard.paymentSummary.errors.unknown')
}

export function useAdminDashboardOverview(options?: {
  periodDays?: number
  limit?: number
  lowStockThreshold?: number
}) {
  const periodDays = options?.periodDays ?? DEFAULT_PERIOD_DAYS
  const limit = options?.limit ?? DEFAULT_LIST_LIMIT
  const lowStockThreshold = options?.lowStockThreshold
  const [state, setState] = useState<AsyncState<DashboardOverviewData>>({
    data: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({ ...previous, loading: true, error: null }))

    void (async () => {
      try {
        const response = await getAdminDashboardOverview(
          {
            period: periodDays,
            limit,
            ...(typeof lowStockThreshold === 'number'
              ? { lowStockThreshold }
              : {}),
          },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        setState({
          data: response.data ?? null,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (requestId !== requestIdRef.current) return
        if (controller.signal.aborted || isAbortError(error)) return
        setState({
          data: null,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load dashboard overview.',
        })
      }
    })()

    return () => {
      requestIdRef.current += 1
      controller.abort()
    }
  }, [periodDays, limit, lowStockThreshold, reloadToken])

  return { ...state, reload }
}

export function useAdminDashboardRevenue(options?: {
  periodDays?: number
  interval?: RevenueInterval
}) {
  const periodDays = options?.periodDays ?? DEFAULT_PERIOD_DAYS
  const interval = options?.interval ?? 'daily'
  const [state, setState] = useState<AsyncState<DashboardRevenueChartData>>({
    data: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({ ...previous, loading: true, error: null }))

    void (async () => {
      try {
        const response = await getAdminDashboardRevenue(
          { period: periodDays, interval },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        setState({
          data: response.data ?? null,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (requestId !== requestIdRef.current) return
        if (controller.signal.aborted || isAbortError(error)) return
        setState({
          data: null,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load revenue chart.',
        })
      }
    })()

    return () => {
      // Invalidate before abort so a late non-throwing response cannot apply.
      requestIdRef.current += 1
      controller.abort()
    }
  }, [periodDays, interval, reloadToken])

  return { ...state, reload }
}

/** GET /payments/summary — same period + abort/reload pattern as revenue. */
export function useAdminDashboardPaymentSummary(options?: {
  periodDays?: number
}) {
  const { t } = useTranslation()
  const periodDays = options?.periodDays ?? DEFAULT_PERIOD_DAYS
  const [state, setState] = useState<AsyncState<DashboardPaymentSummary>>({
    data: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({ ...previous, loading: true, error: null }))

    void (async () => {
      try {
        const response = await getAdminPaymentSummary(
          { period: periodDays },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        setState({
          data: response.data ?? null,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (requestId !== requestIdRef.current) return
        if (controller.signal.aborted || isAbortError(error)) return
        setState({
          data: null,
          loading: false,
          error: resolvePaymentSummaryError(error, t),
        })
      }
    })()

    return () => {
      requestIdRef.current += 1
      controller.abort()
    }
  }, [periodDays, reloadToken, t])

  return { ...state, reload }
}
