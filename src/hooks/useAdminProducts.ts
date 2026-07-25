// src/hooks/useAdminProducts.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCategories } from '../api/catalog'
import {
  getAdminProducts,
  toggleAdminProductBestSeller,
} from '../api/admin/products'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type { ApiCategory } from '../types/catalog'
import type { AdminProductRow, AdminProductsListParams } from '../types/adminProducts'
import { mapApiProductToAdminRow } from '../utils/adminProductsFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const SEARCH_DEBOUNCE_MS = 300

export interface AdminProductsFilters {
  keyword: string
  category: string
  page: number
  limit: number
  sort: string
}

interface UseAdminProductsOptions {
  initialFilters?: Partial<AdminProductsFilters>
}

interface AsyncListState {
  products: AdminProductRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function normalizeFilters(
  partial?: Partial<AdminProductsFilters>,
): AdminProductsFilters {
  return {
    keyword: partial?.keyword ?? '',
    category: partial?.category ?? '',
    page: partial?.page ?? DEFAULT_PAGE,
    limit: partial?.limit ?? DEFAULT_LIMIT,
    sort: partial?.sort ?? DEFAULT_SORT,
  }
}

function resolveBestSellerError(error: unknown, t: (key: string) => string): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t('admin.products.bestSeller.errors.badRequest')
      case 401:
        return t('admin.products.bestSeller.errors.unauthorized')
      case 403:
        return t('admin.products.bestSeller.errors.forbidden')
      case 404:
        return t('admin.products.bestSeller.errors.notFound')
      case 409:
        return t('admin.products.bestSeller.errors.conflict')
      case 500:
        return t('admin.products.bestSeller.errors.server')
      default:
        return t('admin.products.bestSeller.errors.unknown')
    }
  }

  return t('admin.products.bestSeller.errors.unknown')
}

export function useAdminProducts(options?: UseAdminProductsOptions) {
  const { t } = useTranslation()
  const toast = useToast()
  const [filters, setFilters] = useState<AdminProductsFilters>(() =>
    normalizeFilters(options?.initialFilters),
  )
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim())
  const [state, setState] = useState<AsyncListState>({
    products: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [togglingBestSellerId, setTogglingBestSellerId] = useState<string | null>(
    null,
  )
  const requestIdRef = useRef(0)
  const togglingBestSellerIdRef = useRef<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [filters.keyword])

  useEffect(() => {
    let cancelled = false
    async function loadCategories() {
      setCategoriesLoading(true)
      try {
        const response = await getCategories({ limit: 100 })
        if (cancelled) return
        setCategories(response.data ?? [])
      } catch {
        if (cancelled) return
        setCategories([])
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    }
    void loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

  const queryParams = useMemo<AdminProductsListParams>(
    () => ({
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    }),
    [debouncedKeyword, filters.category, filters.limit, filters.page, filters.sort],
  )

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const response = await getAdminProducts(queryParams, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const products = (response.data ?? []).map(mapApiProductToAdminRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        // Clamp out-of-range pages (stale links, emptied result sets).
        if (filters.page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setFilters((previous) => ({ ...previous, page: totalPages }))
          return
        }

        setState({
          products,
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
              : 'Unable to load products catalog.',
          ...(previous.products.length === 0
            ? { products: [], pagination: null }
            : {}),
        }))
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [filters.page, queryParams, reloadToken])

  const setKeyword = useCallback((keyword: string) => {
    setFilters((previous) => ({ ...previous, keyword, page: 1 }))
  }, [])

  const setCategory = useCallback((category: string) => {
    setFilters((previous) => ({ ...previous, category, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((previous) => ({ ...previous, page: Math.max(1, page) }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      keyword: '',
      category: '',
      page: 1,
    }))
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const patchRow = useCallback((id: string, patch: Partial<AdminProductRow>) => {
    setState((previous) => ({
      ...previous,
      products: previous.products.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }))
  }, [])

  const toggleBestSeller = useCallback(
    async (id: string) => {
      if (togglingBestSellerIdRef.current === id) return

      const previousRow = state.products.find((row) => row.id === id)
      if (!previousRow) return

      const nextValue = !previousRow.isBestSeller
      togglingBestSellerIdRef.current = id
      setTogglingBestSellerId(id)
      patchRow(id, { isBestSeller: nextValue })

      try {
        const response = await toggleAdminProductBestSeller(id)
        const confirmed =
          typeof response.data?.isBestSeller === 'boolean'
            ? response.data.isBestSeller
            : nextValue
        patchRow(id, { isBestSeller: confirmed })
        toast.success(
          confirmed
            ? t('admin.products.bestSeller.onSuccess')
            : t('admin.products.bestSeller.offSuccess'),
        )
      } catch (error) {
        patchRow(id, { isBestSeller: previousRow.isBestSeller })
        toast.error(resolveBestSellerError(error, t))
      } finally {
        if (togglingBestSellerIdRef.current === id) {
          togglingBestSellerIdRef.current = null
          setTogglingBestSellerId(null)
        }
      }
    },
    [patchRow, state.products, t, toast],
  )

  const hasActiveFilters = Boolean(debouncedKeyword || filters.category)

  return {
    ...state,
    filters,
    debouncedKeyword,
    categories,
    categoriesLoading,
    hasActiveFilters,
    togglingBestSellerId,
    setKeyword,
    setCategory,
    setPage,
    clearFilters,
    reload,
    toggleBestSeller,
  }
}
