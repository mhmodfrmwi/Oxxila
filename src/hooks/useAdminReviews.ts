// src/hooks/useAdminReviews.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAdminReviews,
  updateAdminReviewFlag,
  updateAdminReviewVisibility,
} from '../api/admin/reviews'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminReviewRow,
  AdminReviewsApiTab,
  AdminReviewsListParams,
} from '../types/adminReviews'
import { mapApiReviewToAdminRow } from '../utils/adminReviewsFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const SEARCH_DEBOUNCE_MS = 300

export interface AdminReviewsFilters {
  keyword: string
  statusTab: AdminReviewsApiTab
  page: number
  limit: number
  sort: string
}

interface UseAdminReviewsOptions {
  initialFilters?: Partial<AdminReviewsFilters>
}

interface AsyncListState {
  reviews: AdminReviewRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminReviewsFilters>,
): AdminReviewsFilters {
  return {
    keyword: partial?.keyword ?? '',
    statusTab: partial?.statusTab ?? 'all',
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

export function useAdminReviews(options?: UseAdminReviewsOptions) {
  const { t } = useTranslation()
  const toast = useToast()
  const [filters, setFilters] = useState<AdminReviewsFilters>(() =>
    normalizeFilters(options?.initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncListState>({
    reviews: [],
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

  const queryParams = useMemo<AdminReviewsListParams>(() => {
    return {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      tab: filters.statusTab,
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
    }
  }, [
    debouncedKeyword,
    filters.limit,
    filters.page,
    filters.sort,
    filters.statusTab,
  ])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getAdminReviews(queryParams, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const ordersLabel = (count: number) =>
          t('admin.reviews.ordersCount', { count })

        const reviews = (response.data ?? []).map((item) =>
          mapApiReviewToAdminRow(item, ordersLabel),
        )
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (filters.page > totalPages) {
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState({
          reviews,
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
              : 'Unable to load reviews.',
          ...(previous.reviews.length === 0
            ? { reviews: [], pagination: null }
            : {}),
        }))
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [filters.page, queryParams, reloadToken, t])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((previous) => ({ ...previous, keyword, page: 1 }))
  }, [])

  const setStatusTab = useCallback((statusTab: AdminReviewsApiTab) => {
    setFilters((previous) => ({ ...previous, statusTab, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      keyword: '',
      statusTab: 'all',
      page: 1,
    }))
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const patchRow = useCallback((id: string, patch: Partial<AdminReviewRow>) => {
    setState((previous) => ({
      ...previous,
      reviews: previous.reviews.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }))
  }, [])

  const patchVisibility = useCallback(
    async (id: string, isVisible: boolean) => {
      const previousRow = state.reviews.find((row) => row.id === id)
      if (!previousRow) return
      patchRow(id, { isVisible })
      try {
        await updateAdminReviewVisibility(id, isVisible)
        toast.success(
          isVisible
            ? t('admin.reviews.visibilityApprovedToast')
            : t('admin.reviews.visibilityHiddenToast'),
        )
      } catch (error) {
        patchRow(id, { isVisible: previousRow.isVisible })
        toast.error(
          error instanceof ApiError
            ? error.message
            : t('admin.reviews.visibilityToggleError'),
        )
      }
    },
    [patchRow, state.reviews, t, toast],
  )

  const patchFlag = useCallback(
    async (id: string, isFlagged: boolean) => {
      const previousRow = state.reviews.find((row) => row.id === id)
      if (!previousRow) return
      patchRow(id, { isFlagged })
      try {
        await updateAdminReviewFlag(id, isFlagged)
        toast.success(
          isFlagged
            ? t('admin.reviews.flagUpdatedToast')
            : t('admin.reviews.unflagUpdatedToast'),
        )
      } catch (error) {
        patchRow(id, { isFlagged: previousRow.isFlagged })
        toast.error(
          error instanceof ApiError
            ? error.message
            : t('admin.reviews.flagToggleError'),
        )
      }
    },
    [patchRow, state.reviews, t, toast],
  )

  const hasActiveFilters = Boolean(
    debouncedKeyword || filters.statusTab !== 'all',
  )

  return {
    ...state,
    filters,
    debouncedKeyword,
    hasActiveFilters,
    setKeyword,
    setStatusTab,
    setPage,
    clearFilters,
    reload,
    patchVisibility,
    patchFlag,
    updateReviewLocally: patchRow,
  }
}
