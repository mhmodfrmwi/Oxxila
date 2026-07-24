// src/hooks/useAdminReturns.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAdminReturns } from '../api/admin/returns'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminReturnRow,
  AdminReturnsListParams,
  AdminReturnsStatusTab,
} from '../types/adminReturns'
import { mapApiReturnToRow, statusTabToRefundStatus } from '../utils/adminReturnsFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 25
const DEFAULT_SORT = '-createdAt'

export interface AdminReturnsFilters {
  statusTab: AdminReturnsStatusTab
  page: number
  limit: number
  sort: string
}

interface AsyncListState {
  returns: AdminReturnRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

export function useAdminReturns() {
  // Deep-link: `/admin/returns?orderId=<id>` — always read from URL (source of truth).
  const [searchParams, setSearchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')?.trim() || ''

  const [filters, setFilters] = useState<AdminReturnsFilters>({
    statusTab: 'all',
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sort: DEFAULT_SORT,
  })
  const [state, setState] = useState<AsyncListState>({
    returns: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const queryParams = useMemo<AdminReturnsListParams>(() => {
    const refundStatus = statusTabToRefundStatus(filters.statusTab)
    return {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      ...(refundStatus ? { refundStatus } : {}),
      ...(orderId ? { order: orderId } : {}),
    }
  }, [filters.limit, filters.page, filters.sort, filters.statusTab, orderId])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getAdminReturns(queryParams, { signal: controller.signal })
        if (requestId !== requestIdRef.current) return

        const returns = (response.data ?? []).map(mapApiReturnToRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (filters.page > totalPages) {
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState({ returns, pagination, loading: false, error: null })
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof ApiError ? error.message : 'Unable to load return requests.',
          ...(previous.returns.length === 0 ? { returns: [], pagination: null } : {}),
        }))
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [filters.page, queryParams, reloadToken])

  const setStatusTab = useCallback((statusTab: AdminReturnsStatusTab) => {
    setFilters((previous) => ({ ...previous, statusTab, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({ ...previous, statusTab: 'all', page: 1 }))
    if (searchParams.has('orderId')) {
      const next = new URLSearchParams(searchParams)
      next.delete('orderId')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const hasActiveFilters = Boolean(filters.statusTab !== 'all' || orderId)

  return {
    ...state,
    filters: { ...filters, orderId },
    hasActiveFilters,
    setStatusTab,
    setPage,
    clearFilters,
    reload,
  }
}
