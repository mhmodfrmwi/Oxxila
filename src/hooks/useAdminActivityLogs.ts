// src/hooks/useAdminActivityLogs.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAdminActivityLogs } from '../api/admin/activityLogs'
import { ApiError, type ApiPagination } from '../lib/api'
import { isAbortError } from '../lib/isAbortError'
import type { AdminActivityLogRow } from '../types/adminAudit'
import { mapApiActivityLogToRow } from '../utils/adminAuditFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const DEFAULT_SORT = '-createdAt'
const SEARCH_DEBOUNCE_MS = 300

export interface AdminActivityLogsFilters {
  keyword: string
  actor: string
  tab: string
  action: string
  resourceType: string
  dateFrom: string
  dateTo: string
  page: number
  limit: number
  sort: string
}

interface AsyncListState {
  logs: AdminActivityLogRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminActivityLogsFilters>,
): AdminActivityLogsFilters {
  return {
    keyword: partial?.keyword ?? '',
    actor: partial?.actor ?? '',
    tab: partial?.tab ?? '',
    action: partial?.action ?? '',
    resourceType: partial?.resourceType ?? '',
    dateFrom: partial?.dateFrom ?? '',
    dateTo: partial?.dateTo ?? '',
    page: partial?.page ?? DEFAULT_PAGE,
    limit: partial?.limit ?? DEFAULT_LIMIT,
    sort: partial?.sort ?? DEFAULT_SORT,
  }
}

export function useAdminActivityLogs() {
  const [filters, setFilters] = useState<AdminActivityLogsFilters>(() =>
    normalizeFilters(),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncListState>({
    logs: [],
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

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.keyword.trim() ||
          filters.actor ||
          filters.tab ||
          filters.action ||
          filters.resourceType ||
          filters.dateFrom ||
          filters.dateTo,
      ),
    [filters],
  )

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: DEFAULT_PAGE }))
  }, [])

  const setActor = useCallback((actor: string) => {
    setFilters((prev) => ({ ...prev, actor, page: DEFAULT_PAGE }))
  }, [])

  const setTab = useCallback((tab: string) => {
    setFilters((prev) => ({ ...prev, tab, page: DEFAULT_PAGE }))
  }, [])

  const setAction = useCallback((action: string) => {
    setFilters((prev) => ({ ...prev, action, page: DEFAULT_PAGE }))
  }, [])

  const setResourceType = useCallback((resourceType: string) => {
    setFilters((prev) => ({ ...prev, resourceType, page: DEFAULT_PAGE }))
  }, [])

  const setDateFrom = useCallback((dateFrom: string) => {
    setFilters((prev) => ({ ...prev, dateFrom, page: DEFAULT_PAGE }))
  }, [])

  const setDateTo = useCallback((dateTo: string) => {
    setFilters((prev) => ({ ...prev, dateTo, page: DEFAULT_PAGE }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(normalizeFilters())
  }, [])

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await getAdminActivityLogs(
          {
            page: filters.page,
            limit: filters.limit,
            sort: filters.sort,
            keyword: debouncedKeyword || undefined,
            actor: filters.actor || undefined,
            tab: filters.tab || undefined,
            action: filters.action || undefined,
            resourceType: filters.resourceType || undefined,
            from: filters.dateFrom || undefined,
            to: filters.dateTo || undefined,
          },
          { signal: controller.signal },
        )

        if (requestId !== requestIdRef.current) return

        setState({
          logs: (response.data ?? []).map(mapApiActivityLogToRow),
          pagination: response.pagination ?? null,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (isAbortError(error)) return
        if (requestId !== requestIdRef.current) return

        const message =
          error instanceof ApiError
            ? error.message
            : 'Unable to load activity logs'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }))
      }
    }

    void load()
    return () => controller.abort()
  }, [
    debouncedKeyword,
    filters.action,
    filters.actor,
    filters.dateFrom,
    filters.dateTo,
    filters.limit,
    filters.page,
    filters.resourceType,
    filters.sort,
    filters.tab,
    reloadToken,
  ])

  return {
    logs: state.logs,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    filters,
    hasActiveFilters,
    reload,
    setKeyword,
    setActor,
    setTab,
    setAction,
    setResourceType,
    setDateFrom,
    setDateTo,
    setPage,
    clearFilters,
  }
}
