// src/hooks/useAdminCustomers.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  activateAdminCustomer,
  deactivateAdminCustomer,
  deleteAdminCustomer,
  getAdminCustomers,
} from '../api/admin/customers'
import { useToast } from '../context/ToastContext'
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

function resolveMutationError(
  error: unknown,
  t: (key: string) => string,
  prefix: 'delete' | 'activate' | 'deactivate',
): string {
  const statusCode = error instanceof ApiError ? error.statusCode : undefined
  switch (statusCode) {
    case 400:
      return t(`admin.customers.${prefix}.errors.badRequest`)
    case 401:
      return t(`admin.customers.${prefix}.errors.unauthorized`)
    case 403:
      return t(`admin.customers.${prefix}.errors.forbidden`)
    case 404:
      return t(`admin.customers.${prefix}.errors.notFound`)
    case 409:
      return t(`admin.customers.${prefix}.errors.conflict`)
    case 500:
      return t(`admin.customers.${prefix}.errors.server`)
    default:
      return statusCode && statusCode >= 500
        ? t(`admin.customers.${prefix}.errors.server`)
        : t(`admin.customers.${prefix}.errors.unknown`)
  }
}

export function useAdminCustomers(options?: UseAdminCustomersOptions) {
  const { t } = useTranslation()
  const toast = useToast()
  const [filters, setFilters] = useState<AdminCustomersFilters>(() =>
    normalizeFilters(options?.initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(
    filters.keyword.trim(),
  )
  const [state, setState] = useState<AsyncListState>({
    customers: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(
    null,
  )
  const [togglingCustomerId, setTogglingCustomerId] = useState<string | null>(
    null,
  )
  const deletingRef = useRef<string | null>(null)
  const togglingRef = useRef<string | null>(null)
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
        if (controller.signal.aborted || requestId !== requestIdRef.current)
          return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : t('admin.customers.loadErrorDescription'),
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
  }, [filters.limit, filters.page, queryParams, reloadToken, t])

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

  const upsertCustomer = useCallback((customer: AdminCustomerRow) => {
    setState((previous) => {
      const index = previous.customers.findIndex((row) => row.id === customer.id)
      if (index === -1) {
        return {
          ...previous,
          customers: [customer, ...previous.customers],
        }
      }
      const next = [...previous.customers]
      next[index] = customer
      return { ...previous, customers: next }
    })
  }, [])

  const deleteCustomer = useCallback(
    async (customerId: string) => {
      if (deletingRef.current) return
      deletingRef.current = customerId
      setDeletingCustomerId(customerId)
      try {
        await deleteAdminCustomer(customerId)
        setState((previous) => ({
          ...previous,
          customers: previous.customers.filter((row) => row.id !== customerId),
        }))
        reload()
        toast.success(t('admin.customers.delete.success'))
      } finally {
        deletingRef.current = null
        setDeletingCustomerId(null)
      }
    },
    [reload, t, toast],
  )

  const setCustomerActive = useCallback(
    async (
      customerId: string,
      active: boolean,
      seed?: AdminCustomerRow | null,
    ) => {
      if (togglingRef.current === customerId) return
      const previousRow =
        state.customers.find((row) => row.id === customerId) ?? seed ?? null
      if (!previousRow) return

      togglingRef.current = customerId
      setTogglingCustomerId(customerId)

      setState((previous) => ({
        ...previous,
        customers: previous.customers.map((row) =>
          row.id === customerId ? { ...row, active } : row,
        ),
      }))

      try {
        const response = active
          ? await activateAdminCustomer(customerId)
          : await deactivateAdminCustomer(customerId)

        if (response.data) {
          upsertCustomer(
            mapApiCustomerToAdminRow({
              ...response.data,
              orders: previousRow.ordersCount ?? response.data.orders,
              totalPaid: previousRow.totalSpend ?? response.data.totalPaid,
              totalSpend: previousRow.totalSpend ?? response.data.totalSpend,
              lastOrder: previousRow.lastOrderAt ?? response.data.lastOrder,
            }),
          )
        }

        // Inactive tab should drop activated users; all tab keeps both.
        if (filters.segmentTab === 'inactive' && active) {
          setState((previous) => ({
            ...previous,
            customers: previous.customers.filter(
              (row) => row.id !== customerId,
            ),
          }))
        }

        toast.success(
          active
            ? t('admin.customers.activate.success')
            : t('admin.customers.deactivate.success'),
        )
        reload()
      } catch (error) {
        setState((previous) => ({
          ...previous,
          customers: previous.customers.map((row) =>
            row.id === customerId
              ? { ...row, active: previousRow.active }
              : row,
          ),
        }))
        toast.error(
          resolveMutationError(
            error,
            t,
            active ? 'activate' : 'deactivate',
          ),
        )
      } finally {
        if (togglingRef.current === customerId) {
          togglingRef.current = null
          setTogglingCustomerId(null)
        }
      }
    },
    [filters.segmentTab, reload, state.customers, t, toast, upsertCustomer],
  )

  const hasActiveFilters = Boolean(
    debouncedKeyword || filters.segmentTab !== 'all',
  )

  return {
    ...state,
    filters,
    debouncedKeyword,
    hasActiveFilters,
    deletingCustomerId,
    togglingCustomerId,
    setKeyword,
    setSegmentTab,
    setPage,
    clearFilters,
    reload,
    upsertCustomer,
    deleteCustomer,
    setCustomerActive,
  }
}
