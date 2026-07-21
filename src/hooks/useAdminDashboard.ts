// src/hooks/useAdminDashboard.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminDashboardOverview,
  getAdminDashboardRevenue,
} from '../api/admin/dashboard'
import { ApiError } from '../lib/api'
import type {
  DashboardOverviewData,
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

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useAdminDashboardOverview(options?: {
  periodDays?: number
  limit?: number
}) {
  const periodDays = options?.periodDays ?? DEFAULT_PERIOD_DAYS
  const limit = options?.limit ?? DEFAULT_LIST_LIMIT
  const [state, setState] = useState<AsyncState<DashboardOverviewData>>({
    data: null,
    loading: true,
    error: null,
  })

  const reload = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }))
    try {
      const response = await getAdminDashboardOverview({
        period: periodDays,
        limit,
      })
      setState({
        data: response.data ?? null,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error instanceof ApiError
            ? error.message
            : 'Unable to load dashboard overview.',
      })
    }
  }, [periodDays, limit])

  useEffect(() => {
    void reload()
  }, [reload])

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
