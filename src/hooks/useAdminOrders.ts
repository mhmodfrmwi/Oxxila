// src/hooks/useAdminOrders.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAdminOrders } from '../api/admin/orders'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminOrderRow,
  AdminOrdersListParams,
  AdminOrdersStatusTab,
} from '../types/adminOrders'
import {
  endOfDayIso,
  isMongoObjectId,
  mapApiOrderToAdminRow,
  startOfDayIso,
  statusTabToOrderStatus,
} from '../utils/adminOrdersFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const SEARCH_DEBOUNCE_MS = 300

export interface AdminOrdersFilters {
  keyword: string
  statusTab: AdminOrdersStatusTab
  dateFrom: string
  dateTo: string
  page: number
  limit: number
  sort: string
}

interface UseAdminOrdersOptions {
  initialFilters?: Partial<AdminOrdersFilters>
}

interface AsyncListState {
  orders: AdminOrderRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminOrdersFilters>,
): AdminOrdersFilters {
  return {
    keyword: partial?.keyword ?? '',
    statusTab: partial?.statusTab ?? 'all',
    dateFrom: partial?.dateFrom ?? '',
    dateTo: partial?.dateTo ?? '',
    page: partial?.page ?? DEFAULT_PAGE,
    limit: partial?.limit ?? DEFAULT_LIMIT,
    sort: partial?.sort ?? DEFAULT_SORT,
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useAdminOrders(options?: UseAdminOrdersOptions) {
  const [filters, setFilters] = useState<AdminOrdersFilters>(() =>
    normalizeFilters(options?.initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncListState>({
    orders: [],
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

  const queryParams = useMemo<AdminOrdersListParams>(() => {
    const orderStatus = statusTabToOrderStatus(filters.statusTab)
    const objectId =
      debouncedKeyword && isMongoObjectId(debouncedKeyword)
        ? debouncedKeyword
        : undefined

    return {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      ...(orderStatus ? { orderStatus } : {}),
      ...(objectId ? { _id: objectId } : {}),
      ...(filters.dateFrom
        ? { createdAtGte: startOfDayIso(filters.dateFrom) }
        : {}),
      ...(filters.dateTo ? { createdAtLte: endOfDayIso(filters.dateTo) } : {}),
    }
  }, [
    debouncedKeyword,
    filters.dateFrom,
    filters.dateTo,
    filters.limit,
    filters.page,
    filters.sort,
    filters.statusTab,
  ])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      // BE list does not support keyword/customer search — only exact `_id`.
      if (debouncedKeyword && !isMongoObjectId(debouncedKeyword)) {
        setState({
          orders: [],
          pagination: {
            currentPage: 1,
            limit: filters.limit,
            numberOfPages: 1,
            totalDocuments: 0,
            nextPage: null,
            prevPage: null,
          },
          loading: false,
          error: null,
        })
        return
      }

      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getAdminOrders(queryParams, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const orders = (response.data ?? []).map(mapApiOrderToAdminRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (filters.page > totalPages) {
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState({
          orders,
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
              : 'Unable to load orders.',
          ...(previous.orders.length === 0
            ? { orders: [], pagination: null }
            : {}),
        }))
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [debouncedKeyword, filters.limit, filters.page, queryParams, reloadToken])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((previous) => ({ ...previous, keyword, page: 1 }))
  }, [])

  const setStatusTab = useCallback((statusTab: AdminOrdersStatusTab) => {
    setFilters((previous) => ({ ...previous, statusTab, page: 1 }))
  }, [])

  const setDateFrom = useCallback((dateFrom: string) => {
    setFilters((previous) => ({ ...previous, dateFrom, page: 1 }))
  }, [])

  const setDateTo = useCallback((dateTo: string) => {
    setFilters((previous) => ({ ...previous, dateTo, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      keyword: '',
      statusTab: 'all',
      dateFrom: '',
      dateTo: '',
      page: 1,
    }))
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const hasActiveFilters = Boolean(
    debouncedKeyword ||
      filters.statusTab !== 'all' ||
      filters.dateFrom ||
      filters.dateTo,
  )

  const searchNeedsObjectId =
    Boolean(debouncedKeyword) && !isMongoObjectId(debouncedKeyword)

  return {
    ...state,
    filters,
    debouncedKeyword,
    hasActiveFilters,
    searchNeedsObjectId,
    setKeyword,
    setStatusTab,
    setDateFrom,
    setDateTo,
    setPage,
    clearFilters,
    reload,
  }
}
