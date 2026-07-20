// src/hooks/useAdminDashboard.ts
import { useCallback, useEffect, useState } from 'react'
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
      const response = await getAdminDashboardOverview({ period: periodDays, limit })
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

  const reload = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }))
    try {
      const response = await getAdminDashboardRevenue({ period: periodDays, interval })
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
            : 'Unable to load revenue chart.',
      })
    }
  }, [periodDays, interval])

  useEffect(() => {
    void reload()
  }, [reload])

  return { ...state, reload }
}
