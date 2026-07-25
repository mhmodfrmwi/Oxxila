// src/hooks/useAdminBrands.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteAdminBrand,
  getAdminBrands,
  setAdminBrandActive,
} from '../api/admin/brands'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminBrandRow,
  AdminBrandsListParams,
} from '../types/adminBrands'
import { mapApiBrandToAdminRow } from '../utils/adminBrandsFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const KEYWORD_DEBOUNCE_MS = 300

interface AsyncState {
  brands: AdminBrandRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function resolveBrandMutationError(
  error: unknown,
  t: (key: string) => string,
  prefix: 'delete' | 'toggle',
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t(`admin.brands.${prefix}.errors.badRequest`)
      case 401:
        return t(`admin.brands.${prefix}.errors.unauthorized`)
      case 403:
        return t(`admin.brands.${prefix}.errors.forbidden`)
      case 404:
        return t(`admin.brands.${prefix}.errors.notFound`)
      case 409:
        return t(`admin.brands.${prefix}.errors.conflict`)
      case 500:
        return t(`admin.brands.${prefix}.errors.server`)
      default:
        return t(`admin.brands.${prefix}.errors.unknown`)
    }
  }

  return t(`admin.brands.${prefix}.errors.unknown`)
}

export function useAdminBrands() {
  const { t } = useTranslation()
  const toast = useToast()
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [state, setState] = useState<AsyncState>({
    brands: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null)
  const [togglingBrandId, setTogglingBrandId] = useState<string | null>(null)
  const deletingBrandIdRef = useRef<string | null>(null)
  const togglingBrandIdRef = useRef<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, KEYWORD_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  const query = useMemo<AdminBrandsListParams>(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
      keyword: debouncedKeyword || undefined,
    }),
    [debouncedKeyword, page],
  )

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setKeyword = useCallback((value: string) => {
    setKeywordState(value)
    setPageState(DEFAULT_PAGE)
  }, [])

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next))
  }, [])

  const clearFilters = useCallback(() => {
    setKeywordState('')
    setDebouncedKeyword('')
    setPageState(DEFAULT_PAGE)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminBrands(query, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const brands = (response.data ?? []).map(mapApiBrandToAdminRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setPageState(totalPages)
          return
        }

        setState({
          brands,
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
              : t('admin.brands.loadErrorDescription'),
          ...(previous.brands.length === 0
            ? { brands: [], pagination: null }
            : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [page, query, reloadToken, t])

  const upsertBrand = useCallback((brand: AdminBrandRow) => {
    setState((previous) => {
      // Inactive brands disappear from the public list endpoint.
      if (!brand.isActive) {
        return {
          ...previous,
          brands: previous.brands.filter((row) => row.id !== brand.id),
        }
      }

      const index = previous.brands.findIndex((row) => row.id === brand.id)
      if (index === -1) {
        return {
          ...previous,
          brands: [brand, ...previous.brands],
        }
      }
      const next = [...previous.brands]
      next[index] = brand
      return { ...previous, brands: next }
    })
  }, [])

  const deleteBrand = useCallback(
    async (brandId: string) => {
      if (deletingBrandIdRef.current) return
      deletingBrandIdRef.current = brandId
      setDeletingBrandId(brandId)

      try {
        await deleteAdminBrand(brandId)
        setState((previous) => ({
          ...previous,
          brands: previous.brands.filter((row) => row.id !== brandId),
        }))
        reload()
        toast.success(t('admin.brands.delete.success'))
      } finally {
        deletingBrandIdRef.current = null
        setDeletingBrandId(null)
      }
    },
    [reload, t, toast],
  )

  const toggleActive = useCallback(
    async (brandId: string) => {
      if (togglingBrandIdRef.current === brandId) return

      const previousRow = state.brands.find((row) => row.id === brandId)
      if (!previousRow) return

      const nextValue = !previousRow.isActive
      togglingBrandIdRef.current = brandId
      setTogglingBrandId(brandId)

      setState((previous) => ({
        ...previous,
        brands: nextValue
          ? previous.brands.map((row) =>
              row.id === brandId ? { ...row, isActive: true } : row,
            )
          : previous.brands.filter((row) => row.id !== brandId),
      }))

      try {
        const response = await setAdminBrandActive(brandId, nextValue)
        const confirmed =
          typeof response.data?.isActive === 'boolean'
            ? response.data.isActive
            : nextValue

        if (response.data) {
          upsertBrand(mapApiBrandToAdminRow(response.data))
        } else if (!confirmed) {
          setState((previous) => ({
            ...previous,
            brands: previous.brands.filter((row) => row.id !== brandId),
          }))
        }

        toast.success(
          confirmed
            ? t('admin.brands.toggle.onSuccess')
            : t('admin.brands.toggle.offSuccess'),
        )

        if (!confirmed) reload()
      } catch (error) {
        setState((previous) => {
          const exists = previous.brands.some((row) => row.id === brandId)
          if (exists) {
            return {
              ...previous,
              brands: previous.brands.map((row) =>
                row.id === brandId
                  ? { ...row, isActive: previousRow.isActive }
                  : row,
              ),
            }
          }
          return {
            ...previous,
            brands: [previousRow, ...previous.brands],
          }
        })
        toast.error(resolveBrandMutationError(error, t, 'toggle'))
      } finally {
        if (togglingBrandIdRef.current === brandId) {
          togglingBrandIdRef.current = null
          setTogglingBrandId(null)
        }
      }
    },
    [reload, state.brands, t, toast, upsertBrand],
  )

  const hasActiveFilters = Boolean(debouncedKeyword)

  return {
    brands: state.brands,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    filters: { keyword, page, limit: DEFAULT_LIMIT },
    debouncedKeyword,
    hasActiveFilters,
    deletingBrandId,
    togglingBrandId,
    setKeyword,
    setPage,
    clearFilters,
    reload,
    upsertBrand,
    deleteBrand,
    toggleActive,
  }
}
