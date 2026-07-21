// src/hooks/useAdminShipping.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAdminCarriers,
  getAdminShippingOrders,
} from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminCarrierRow,
  AdminShippingOrderRow,
  AdminShippingOrdersParams,
  AdminShippingOrdersTab,
} from '../types/adminShipping'
import { isMongoObjectId } from '../utils/adminOrdersFormat'
import {
  filterCarriersByKeyword,
  mapApiCarrierToAdminRow,
  mapApiOrderToShippingRow,
  shippingOrdersTabToOrderStatus,
} from '../utils/adminShippingFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const SEARCH_DEBOUNCE_MS = 300

export interface AdminShippingFilters {
  keyword: string
  ordersTab: AdminShippingOrdersTab
  page: number
  limit: number
  sort: string
}

interface AsyncState {
  carriers: AdminCarrierRow[]
  orders: AdminShippingOrderRow[]
  pagination: ApiPagination | null
  carriersLoading: boolean
  ordersLoading: boolean
  carriersError: string | null
  ordersError: string | null
}

function normalizeFilters(
  partial?: Partial<AdminShippingFilters>,
): AdminShippingFilters {
  return {
    keyword: partial?.keyword ?? '',
    ordersTab: partial?.ordersTab ?? 'all',
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

export function useAdminShipping(options?: {
  initialFilters?: Partial<AdminShippingFilters>
}) {
  const [filters, setFilters] = useState<AdminShippingFilters>(() =>
    normalizeFilters(options?.initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncState>({
    carriers: [],
    orders: [],
    pagination: null,
    carriersLoading: true,
    ordersLoading: true,
    carriersError: null,
    ordersError: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const carriersRequestIdRef = useRef(0)
  const ordersRequestIdRef = useRef(0)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [filters.keyword])

  const ordersQuery = useMemo<AdminShippingOrdersParams>(() => {
    const orderStatus = shippingOrdersTabToOrderStatus(filters.ordersTab)
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
    }
  }, [
    debouncedKeyword,
    filters.limit,
    filters.ordersTab,
    filters.page,
    filters.sort,
  ])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++carriersRequestIdRef.current

    async function loadCarriers() {
      setState((previous) => ({
        ...previous,
        carriersLoading: true,
        carriersError: null,
      }))
      try {
        const response = await getAdminCarriers({ signal: controller.signal })
        if (requestId !== carriersRequestIdRef.current) return
        setState((previous) => ({
          ...previous,
          carriers: (response.data ?? []).map(mapApiCarrierToAdminRow),
          carriersLoading: false,
          carriersError: null,
        }))
      } catch (error) {
        if (controller.signal.aborted || requestId !== carriersRequestIdRef.current)
          return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          carriersLoading: false,
          carriersError:
            error instanceof ApiError
              ? error.message
              : 'Unable to load carriers.',
        }))
      }
    }

    void loadCarriers()
    return () => {
      controller.abort()
    }
  }, [reloadToken])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++ordersRequestIdRef.current

    async function loadOrders() {
      if (debouncedKeyword && !isMongoObjectId(debouncedKeyword)) {
        setState((previous) => ({
          ...previous,
          orders: [],
          pagination: {
            currentPage: 1,
            limit: filters.limit,
            numberOfPages: 1,
            totalDocuments: 0,
            nextPage: null,
            prevPage: null,
          },
          ordersLoading: false,
          ordersError: null,
        }))
        return
      }

      setState((previous) => ({
        ...previous,
        ordersLoading: true,
        ordersError: null,
      }))
      try {
        const response = await getAdminShippingOrders(ordersQuery, {
          signal: controller.signal,
        })
        if (requestId !== ordersRequestIdRef.current) return

        const orders = (response.data ?? []).map(mapApiOrderToShippingRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (filters.page > totalPages) {
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState((previous) => ({
          ...previous,
          orders,
          pagination,
          ordersLoading: false,
          ordersError: null,
        }))
      } catch (error) {
        if (controller.signal.aborted || requestId !== ordersRequestIdRef.current)
          return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          ordersLoading: false,
          ordersError:
            error instanceof ApiError
              ? error.message
              : 'Unable to load shipping orders.',
          ...(previous.orders.length === 0
            ? { orders: [], pagination: null }
            : {}),
        }))
      }
    }

    void loadOrders()
    return () => {
      controller.abort()
    }
  }, [debouncedKeyword, filters.limit, filters.page, ordersQuery, reloadToken])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((previous) => ({ ...previous, keyword, page: 1 }))
  }, [])

  const setOrdersTab = useCallback((ordersTab: AdminShippingOrdersTab) => {
    setFilters((previous) => ({ ...previous, ordersTab, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      keyword: '',
      ordersTab: 'all',
      page: 1,
    }))
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const visibleCarriers = useMemo(() => {
    if (!debouncedKeyword || isMongoObjectId(debouncedKeyword)) {
      return state.carriers
    }
    return filterCarriersByKeyword(state.carriers, debouncedKeyword)
  }, [debouncedKeyword, state.carriers])

  const hasCourierMethod = state.carriers.some(
    (carrier) => carrier.isActive && carrier.type !== 'internal',
  )
  const hasInHouseMethod = state.carriers.some(
    (carrier) => carrier.isActive && carrier.type === 'internal',
  )

  const searchNeedsObjectId =
    Boolean(debouncedKeyword) && !isMongoObjectId(debouncedKeyword)

  const hasActiveFilters = Boolean(
    debouncedKeyword || filters.ordersTab !== 'all',
  )

  return {
    carriers: visibleCarriers,
    allCarriers: state.carriers,
    orders: state.orders,
    pagination: state.pagination,
    carriersLoading: state.carriersLoading,
    ordersLoading: state.ordersLoading,
    carriersError: state.carriersError,
    ordersError: state.ordersError,
    filters,
    debouncedKeyword,
    hasActiveFilters,
    searchNeedsObjectId,
    hasCourierMethod,
    hasInHouseMethod,
    setKeyword,
    setOrdersTab,
    setPage,
    clearFilters,
    reload,
  }
}
