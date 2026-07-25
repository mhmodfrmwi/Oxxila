// src/hooks/useAdminCategories.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteAdminCategory,
  getAdminCategories,
  setAdminCategoryActive,
} from '../api/admin/categories'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminCategoriesListParams,
  AdminCategoryRow,
} from '../types/adminCategories'
import { mapApiCategoryToAdminRow } from '../utils/adminCategoriesFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const KEYWORD_DEBOUNCE_MS = 300

interface AsyncState {
  categories: AdminCategoryRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function resolveCategoryMutationError(
  error: unknown,
  t: (key: string) => string,
  prefix: 'delete' | 'toggle',
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t(`admin.categories.${prefix}.errors.badRequest`)
      case 401:
        return t(`admin.categories.${prefix}.errors.unauthorized`)
      case 403:
        return t(`admin.categories.${prefix}.errors.forbidden`)
      case 404:
        return t(`admin.categories.${prefix}.errors.notFound`)
      case 409:
        return t(`admin.categories.${prefix}.errors.conflict`)
      case 500:
        return t(`admin.categories.${prefix}.errors.server`)
      default:
        return t(`admin.categories.${prefix}.errors.unknown`)
    }
  }

  return t(`admin.categories.${prefix}.errors.unknown`)
}

export function useAdminCategories() {
  const { t } = useTranslation()
  const toast = useToast()
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [state, setState] = useState<AsyncState>({
    categories: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  )
  const [togglingCategoryId, setTogglingCategoryId] = useState<string | null>(
    null,
  )
  const deletingCategoryIdRef = useRef<string | null>(null)
  const togglingCategoryIdRef = useRef<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, KEYWORD_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  const query = useMemo<AdminCategoriesListParams>(
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
        const response = await getAdminCategories(query, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const categories = (response.data ?? []).map(mapApiCategoryToAdminRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setPageState(totalPages)
          return
        }

        setState({
          categories,
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
              : t('admin.categories.loadErrorDescription'),
          ...(previous.categories.length === 0
            ? { categories: [], pagination: null }
            : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [page, query, reloadToken, t])

  const upsertCategory = useCallback((category: AdminCategoryRow) => {
    setState((previous) => {
      // Inactive categories disappear from the public list endpoint.
      if (!category.isActive) {
        return {
          ...previous,
          categories: previous.categories.filter(
            (row) => row.id !== category.id,
          ),
        }
      }

      const index = previous.categories.findIndex((row) => row.id === category.id)
      if (index === -1) {
        return {
          ...previous,
          categories: [category, ...previous.categories],
        }
      }
      const next = [...previous.categories]
      next[index] = category
      return { ...previous, categories: next }
    })
  }, [])

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      if (deletingCategoryIdRef.current) return
      deletingCategoryIdRef.current = categoryId
      setDeletingCategoryId(categoryId)

      try {
        await deleteAdminCategory(categoryId)
        setState((previous) => ({
          ...previous,
          categories: previous.categories.filter((row) => row.id !== categoryId),
        }))
        reload()
        toast.success(t('admin.categories.delete.success'))
      } finally {
        deletingCategoryIdRef.current = null
        setDeletingCategoryId(null)
      }
    },
    [reload, t, toast],
  )

  const toggleActive = useCallback(
    async (categoryId: string) => {
      if (togglingCategoryIdRef.current === categoryId) return

      const previousRow = state.categories.find((row) => row.id === categoryId)
      if (!previousRow) return

      const nextValue = !previousRow.isActive
      togglingCategoryIdRef.current = categoryId
      setTogglingCategoryId(categoryId)

      // Optimistic update — deactivating removes the row from the active-only list.
      setState((previous) => ({
        ...previous,
        categories: nextValue
          ? previous.categories.map((row) =>
              row.id === categoryId ? { ...row, isActive: true } : row,
            )
          : previous.categories.filter((row) => row.id !== categoryId),
      }))

      try {
        const response = await setAdminCategoryActive(categoryId, nextValue)
        const confirmed =
          typeof response.data?.isActive === 'boolean'
            ? response.data.isActive
            : nextValue

        if (response.data) {
          upsertCategory(mapApiCategoryToAdminRow(response.data))
        } else if (!confirmed) {
          setState((previous) => ({
            ...previous,
            categories: previous.categories.filter(
              (row) => row.id !== categoryId,
            ),
          }))
        }

        toast.success(
          confirmed
            ? t('admin.categories.toggle.onSuccess')
            : t('admin.categories.toggle.offSuccess'),
        )

        if (!confirmed) reload()
      } catch (error) {
        // Rollback: restore the previous row when deactivate failed after removal.
        setState((previous) => {
          const exists = previous.categories.some((row) => row.id === categoryId)
          if (exists) {
            return {
              ...previous,
              categories: previous.categories.map((row) =>
                row.id === categoryId
                  ? { ...row, isActive: previousRow.isActive }
                  : row,
              ),
            }
          }
          return {
            ...previous,
            categories: [previousRow, ...previous.categories],
          }
        })
        toast.error(resolveCategoryMutationError(error, t, 'toggle'))
      } finally {
        if (togglingCategoryIdRef.current === categoryId) {
          togglingCategoryIdRef.current = null
          setTogglingCategoryId(null)
        }
      }
    },
    [reload, state.categories, t, toast, upsertCategory],
  )

  const hasActiveFilters = Boolean(debouncedKeyword)

  return {
    categories: state.categories,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    filters: { keyword, page, limit: DEFAULT_LIMIT },
    debouncedKeyword,
    hasActiveFilters,
    deletingCategoryId,
    togglingCategoryId,
    setKeyword,
    setPage,
    clearFilters,
    reload,
    upsertCategory,
    deleteCategory,
    toggleActive,
  }
}
