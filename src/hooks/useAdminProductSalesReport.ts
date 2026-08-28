// src/hooks/useAdminProductSalesReport.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getProductSalesReport } from '../api/admin/reports'
import { ApiError, type ApiPagination } from '../lib/api'
import type {
  ProductSalesListParams,
  ProductSalesReportData,
  ProductSalesRow,
  ProductSalesSort,
  ReportPeriodPreset,
} from '../types/adminReports'
import { endOfDayIso, startOfDayIso } from '../utils/adminOrdersFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const DEFAULT_SORT: ProductSalesSort = '-grossRevenue'
const DEFAULT_PERIOD: ReportPeriodPreset = 30
const SEARCH_DEBOUNCE_MS = 300

export interface AdminProductSalesFilters {
  keyword: string
  period: ReportPeriodPreset | null
  dateFrom: string
  dateTo: string
  page: number
  limit: number
  sort: ProductSalesSort
}

interface AsyncReportState {
  data: ProductSalesReportData | null
  rows: ProductSalesRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminProductSalesFilters>,
): AdminProductSalesFilters {
  return {
    keyword: partial?.keyword ?? '',
    period: partial?.period ?? DEFAULT_PERIOD,
    dateFrom: partial?.dateFrom ?? '',
    dateTo: partial?.dateTo ?? '',
    page: partial?.page ?? DEFAULT_PAGE,
    limit: partial?.limit ?? DEFAULT_LIMIT,
    sort: partial?.sort ?? DEFAULT_SORT,
  }
}

export function useAdminProductSalesReport(
  initialFilters?: Partial<AdminProductSalesFilters>,
) {
  const [filters, setFilters] = useState<AdminProductSalesFilters>(() =>
    normalizeFilters(initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncReportState>({
    data: null,
    rows: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [filters.keyword])

  const queryParams = useMemo<ProductSalesListParams>(() => {
    const useCustomRange = Boolean(filters.dateFrom || filters.dateTo)
    return {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      ...(debouncedKeyword ? { search: debouncedKeyword } : {}),
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
  }, [
    debouncedKeyword,
    filters.dateFrom,
    filters.dateTo,
    filters.limit,
    filters.page,
    filters.period,
    filters.sort,
  ])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getProductSalesReport(queryParams, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const data = response.data ?? null
        const rows = data?.rows ?? []
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (filters.page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState({
          data,
          rows,
          pagination,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load product sales report.',
          ...(previous.rows.length === 0
            ? { data: null, rows: [], pagination: null }
            : {}),
        }))
      }
    }

    void load()
    return () => controller.abort()
  }, [filters.page, queryParams, reloadToken])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((previous) => ({ ...previous, keyword, page: 1 }))
  }, [])

  const setPeriod = useCallback((period: ReportPeriodPreset) => {
    setFilters((previous) => ({
      ...previous,
      period,
      dateFrom: '',
      dateTo: '',
      page: 1,
    }))
  }, [])

  const setDateFrom = useCallback((dateFrom: string) => {
    setFilters((previous) => ({
      ...previous,
      dateFrom,
      period: null,
      page: 1,
    }))
  }, [])

  const setDateTo = useCallback((dateTo: string) => {
    setFilters((previous) => ({
      ...previous,
      dateTo,
      period: null,
      page: 1,
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const setSort = useCallback((sort: ProductSalesSort) => {
    setFilters((previous) => ({ ...previous, sort, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(normalizeFilters())
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const hasActiveFilters = Boolean(
    filters.keyword.trim() ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.period !== DEFAULT_PERIOD,
  )

  return {
    filters,
    rows: state.rows,
    summary: state.data?.summary ?? null,
    period: state.data?.period ?? null,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    hasActiveFilters,
    queryParams,
    setKeyword,
    setPeriod,
    setDateFrom,
    setDateTo,
    setPage,
    setSort,
    clearFilters,
    reload,
  }
}
