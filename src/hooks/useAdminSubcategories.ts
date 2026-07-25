// src/hooks/useAdminSubcategories.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteAdminSubcategory,
  getAdminSubcategories,
  setAdminSubcategoryActive,
} from '../api/admin/subcategories'
import { getAdminCategories } from '../api/admin/categories'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { AdminCategoryRow } from '../types/adminCategories'
import type {
  AdminSubcategoriesListParams,
  AdminSubcategoryRow,
} from '../types/adminSubcategories'
import { mapApiCategoryToAdminRow } from '../utils/adminCategoriesFormat'
import { mapApiSubcategoryToAdminRow } from '../utils/adminSubcategoriesFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'
const KEYWORD_DEBOUNCE_MS = 300

interface AsyncState {
  /** Full server result set (backend has no pagination). */
  allRows: AdminSubcategoryRow[]
  loading: boolean
  error: string | null
}

function resolveSubcategoryMutationError(
  error: unknown,
  t: (key: string) => string,
  prefix: 'delete' | 'toggle',
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t(`admin.subcategories.${prefix}.errors.badRequest`)
      case 401:
        return t(`admin.subcategories.${prefix}.errors.unauthorized`)
      case 403:
        return t(`admin.subcategories.${prefix}.errors.forbidden`)
      case 404:
        return t(`admin.subcategories.${prefix}.errors.notFound`)
      case 409:
        return t(`admin.subcategories.${prefix}.errors.conflict`)
      case 500:
        return t(`admin.subcategories.${prefix}.errors.server`)
      default:
        return t(`admin.subcategories.${prefix}.errors.unknown`)
    }
  }

  return t(`admin.subcategories.${prefix}.errors.unknown`)
}

export function useAdminSubcategories() {
  const { t } = useTranslation()
  const toast = useToast()
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [categoryFilter, setCategoryFilterState] = useState('')
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [state, setState] = useState<AsyncState>({
    allRows: [],
    loading: true,
    error: null,
  })
  const [categories, setCategories] = useState<AdminCategoryRow[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState<
    string | null
  >(null)
  const [togglingSubcategoryId, setTogglingSubcategoryId] = useState<
    string | null
  >(null)
  const deletingSubcategoryIdRef = useRef<string | null>(null)
  const togglingSubcategoryIdRef = useRef<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, KEYWORD_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  const query = useMemo<AdminSubcategoriesListParams>(
    () => ({
      sort: DEFAULT_SORT,
      keyword: debouncedKeyword || undefined,
      category: categoryFilter || undefined,
    }),
    [categoryFilter, debouncedKeyword],
  )

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setKeyword = useCallback((value: string) => {
    setKeywordState(value)
    setPageState(DEFAULT_PAGE)
  }, [])

  const setCategoryFilter = useCallback((value: string) => {
    setCategoryFilterState(value)
    setPageState(DEFAULT_PAGE)
  }, [])

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next))
  }, [])

  const clearFilters = useCallback(() => {
    setKeywordState('')
    setDebouncedKeyword('')
    setCategoryFilterState('')
    setPageState(DEFAULT_PAGE)
  }, [])

  useEffect(() => {
    let cancelled = false
    setCategoriesLoading(true)
    void (async () => {
      try {
        const response = await getAdminCategories({ limit: 100, sort: 'name' })
        if (cancelled) return
        setCategories((response.data ?? []).map(mapApiCategoryToAdminRow))
      } catch {
        if (!cancelled) setCategories([])
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
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
        const response = await getAdminSubcategories(query, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        setState({
          allRows: (response.data ?? []).map(mapApiSubcategoryToAdminRow),
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
              : t('admin.subcategories.loadErrorDescription'),
          ...(previous.allRows.length === 0 ? { allRows: [] } : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [query, reloadToken, t])

  const totalCount = state.allRows.length
  const totalPages = Math.max(Math.ceil(totalCount / DEFAULT_LIMIT) || 1, 1)

  useEffect(() => {
    if (page > totalPages) setPageState(totalPages)
  }, [page, totalPages])

  const subcategories = useMemo(() => {
    const start = (page - 1) * DEFAULT_LIMIT
    return state.allRows.slice(start, start + DEFAULT_LIMIT)
  }, [page, state.allRows])

  const upsertSubcategory = useCallback((subcategory: AdminSubcategoryRow) => {
    setState((previous) => {
      if (!subcategory.isActive) {
        return {
          ...previous,
          allRows: previous.allRows.filter((row) => row.id !== subcategory.id),
        }
      }

      const index = previous.allRows.findIndex(
        (row) => row.id === subcategory.id,
      )
      if (index === -1) {
        return {
          ...previous,
          allRows: [subcategory, ...previous.allRows],
        }
      }
      const next = [...previous.allRows]
      next[index] = subcategory
      return { ...previous, allRows: next }
    })
  }, [])

  const deleteSubcategory = useCallback(
    async (subcategoryId: string) => {
      if (deletingSubcategoryIdRef.current) return

      const row = state.allRows.find((item) => item.id === subcategoryId)
      if (!row?.categoryId) return

      deletingSubcategoryIdRef.current = subcategoryId
      setDeletingSubcategoryId(subcategoryId)

      try {
        await deleteAdminSubcategory(row.categoryId, subcategoryId)
        setState((previous) => ({
          ...previous,
          allRows: previous.allRows.filter((item) => item.id !== subcategoryId),
        }))
        reload()
        toast.success(t('admin.subcategories.delete.success'))
      } finally {
        deletingSubcategoryIdRef.current = null
        setDeletingSubcategoryId(null)
      }
    },
    [reload, state.allRows, t, toast],
  )

  const toggleActive = useCallback(
    async (subcategoryId: string) => {
      if (togglingSubcategoryIdRef.current === subcategoryId) return

      const previousRow = state.allRows.find((row) => row.id === subcategoryId)
      if (!previousRow?.categoryId) return

      const nextValue = !previousRow.isActive
      togglingSubcategoryIdRef.current = subcategoryId
      setTogglingSubcategoryId(subcategoryId)

      setState((previous) => ({
        ...previous,
        allRows: nextValue
          ? previous.allRows.map((row) =>
              row.id === subcategoryId ? { ...row, isActive: true } : row,
            )
          : previous.allRows.filter((row) => row.id !== subcategoryId),
      }))

      try {
        const response = await setAdminSubcategoryActive(
          previousRow.categoryId,
          subcategoryId,
          nextValue,
        )
        const confirmed =
          typeof response.data?.isActive === 'boolean'
            ? response.data.isActive
            : nextValue

        if (response.data) {
          upsertSubcategory(mapApiSubcategoryToAdminRow(response.data))
        } else if (!confirmed) {
          setState((previous) => ({
            ...previous,
            allRows: previous.allRows.filter(
              (row) => row.id !== subcategoryId,
            ),
          }))
        }

        toast.success(
          confirmed
            ? t('admin.subcategories.toggle.onSuccess')
            : t('admin.subcategories.toggle.offSuccess'),
        )
      } catch (error) {
        setState((previous) => {
          const exists = previous.allRows.some(
            (row) => row.id === subcategoryId,
          )
          if (exists) {
            return {
              ...previous,
              allRows: previous.allRows.map((row) =>
                row.id === subcategoryId
                  ? { ...row, isActive: previousRow.isActive }
                  : row,
              ),
            }
          }
          return {
            ...previous,
            allRows: [previousRow, ...previous.allRows],
          }
        })
        toast.error(resolveSubcategoryMutationError(error, t, 'toggle'))
      } finally {
        if (togglingSubcategoryIdRef.current === subcategoryId) {
          togglingSubcategoryIdRef.current = null
          setTogglingSubcategoryId(null)
        }
      }
    },
    [state.allRows, t, toast, upsertSubcategory],
  )

  const hasActiveFilters = Boolean(debouncedKeyword || categoryFilter)

  return {
    subcategories,
    allCount: totalCount,
    pagination: {
      currentPage: page,
      numberOfPages: totalPages,
      totalDocuments: totalCount,
      limit: DEFAULT_LIMIT,
    },
    loading: state.loading,
    error: state.error,
    filters: {
      keyword,
      category: categoryFilter,
      page,
      limit: DEFAULT_LIMIT,
    },
    categories,
    categoriesLoading,
    hasActiveFilters,
    deletingSubcategoryId,
    togglingSubcategoryId,
    setKeyword,
    setCategoryFilter,
    setPage,
    clearFilters,
    reload,
    upsertSubcategory,
    deleteSubcategory,
    toggleActive,
  }
}
