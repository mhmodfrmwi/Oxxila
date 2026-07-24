// src/hooks/useAdminCustomers.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAdminCustomers } from '../api/admin/customers'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminCustomerRow,
  AdminCustomersListParams,
  AdminCustomersSegmentTab,
} from '../types/adminCustomers'
import {
  mapApiCustomerToAdminRow,
  segmentTabToListParams,
} from '../utils/adminCustomersFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const SEARCH_DEBOUNCE_MS = 300

export interface AdminCustomersFilters {
  keyword: string
  segmentTab: AdminCustomersSegmentTab
  page: number
  limit: number
  sort: string
}

interface UseAdminCustomersOptions {
  initialFilters?: Partial<AdminCustomersFilters>
}

interface AsyncListState {
  customers: AdminCustomerRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminCustomersFilters>,
): AdminCustomersFilters {
  return {
    keyword: partial?.keyword ?? '',
    segmentTab: partial?.segmentTab ?? 'all',
    page: partial?.page ?? DEFAULT_PAGE,
    limit: partial?.limit ?? DEFAULT_LIMIT,
    sort: partial?.sort ?? DEFAULT_SORT,
  }
}

export function useAdminCustomers(options?: UseAdminCustomersOptions) {
  const [filters, setFilters] = useState<AdminCustomersFilters>(() =>
    normalizeFilters(options?.initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncListState>({
    customers: [],
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

  const queryParams = useMemo<AdminCustomersListParams>(() => {
    const segment = segmentTabToListParams(filters.segmentTab)
    return {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      ...segment,
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
    }
  }, [
    debouncedKeyword,
    filters.limit,
    filters.page,
    filters.segmentTab,
    filters.sort,
  ])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getAdminCustomers(queryParams, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const customers = (response.data ?? []).map(mapApiCustomerToAdminRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (filters.page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState({
          customers,
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
              : 'Unable to load customers.',
          ...(previous.customers.length === 0
            ? { customers: [], pagination: null }
            : {}),
        }))
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [filters.limit, filters.page, queryParams, reloadToken])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((previous) => ({ ...previous, keyword, page: 1 }))
  }, [])

  const setSegmentTab = useCallback((segmentTab: AdminCustomersSegmentTab) => {
    setFilters((previous) => ({ ...previous, segmentTab, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      keyword: '',
      segmentTab: 'all',
      page: 1,
    }))
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const hasActiveFilters = Boolean(
    debouncedKeyword || filters.segmentTab !== 'all',
  )

  return {
    ...state,
    filters,
    debouncedKeyword,
    hasActiveFilters,
    setKeyword,
    setSegmentTab,
    setPage,
    clearFilters,
    reload,
  }
}
