// src/hooks/useAdminSingleProductSalesReport.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSingleProductSalesReport } from '../api/admin/reports'
import { ApiError } from '../lib/api'
import type {
  ReportInterval,
  ReportPeriodPreset,
  SingleProductSalesParams,
  SingleProductSalesReportData,
} from '../types/adminReports'
import { endOfDayIso, startOfDayIso } from '../utils/adminOrdersFormat'

const DEFAULT_PERIOD: ReportPeriodPreset = 30

export interface AdminSingleProductSalesFilters {
  period: ReportPeriodPreset | null
  dateFrom: string
  dateTo: string
  interval: ReportInterval
}

interface AsyncDetailState {
  data: SingleProductSalesReportData | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminSingleProductSalesFilters>,
): AdminSingleProductSalesFilters {
  return {
    period: partial?.period ?? DEFAULT_PERIOD,
    dateFrom: partial?.dateFrom ?? '',
    dateTo: partial?.dateTo ?? '',
    interval: partial?.interval ?? 'daily',
  }
}

export function useAdminSingleProductSalesReport(
  productId: string | undefined,
  initialFilters?: Partial<AdminSingleProductSalesFilters>,
) {
  const [filters, setFilters] = useState<AdminSingleProductSalesFilters>(() =>
    normalizeFilters(initialFilters),
  )
  const [state, setState] = useState<AsyncDetailState>({
    data: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const queryParams = useMemo<SingleProductSalesParams>(() => {
    const useCustomRange = Boolean(filters.dateFrom || filters.dateTo)
    return {
      interval: filters.interval,
      ...(useCustomRange
        ? {
            ...(filters.dateFrom
              ? { startDate: startOfDayIso(filters.dateFrom)?.slice(0, 10) }
              : {}),
            ...(filters.dateTo
              ? { endDate: endOfDayIso(filters.dateTo)?.slice(0, 10) }
              : {}),
          }
        : { period: filters.period ?? DEFAULT_PERIOD }),
    }
  }, [filters.dateFrom, filters.dateTo, filters.interval, filters.period])

  useEffect(() => {
    if (!productId) {
      setState({ data: null, loading: false, error: null })
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getSingleProductSalesReport(productId!, queryParams, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        setState({
          data: response.data ?? null,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(error)) return
        setState({
          data: null,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load product sales report.',
        })
      }
    }

    void load()
    return () => controller.abort()
  }, [productId, queryParams, reloadToken])

  const setPeriod = useCallback((period: ReportPeriodPreset) => {
    setFilters((previous) => ({
      ...previous,
      period,
      dateFrom: '',
      dateTo: '',
    }))
  }, [])

  const setDateFrom = useCallback((dateFrom: string) => {
    setFilters((previous) => ({
      ...previous,
      dateFrom,
      period: null,
    }))
  }, [])

  const setDateTo = useCallback((dateTo: string) => {
    setFilters((previous) => ({
      ...previous,
      dateTo,
      period: null,
    }))
  }, [])

  const setInterval = useCallback((interval: ReportInterval) => {
    setFilters((previous) => ({ ...previous, interval }))
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  return {
    filters,
    data: state.data,
    summary: state.data?.summary ?? null,
    product: state.data?.product ?? null,
    period: state.data?.period ?? null,
    timeseries: state.data?.timeseries ?? [],
    recentOrders: state.data?.recentOrders ?? [],
    loading: state.loading,
    error: state.error,
    queryParams,
    setPeriod,
    setDateFrom,
    setDateTo,
    setInterval,
    reload,
  }
}
