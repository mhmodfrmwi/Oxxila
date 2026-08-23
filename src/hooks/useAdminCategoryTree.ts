// src/hooks/useAdminCategoryTree.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteAdminCategory,
  getAdminCategories,
  setAdminCategoryActive,
} from '../api/admin/categories'
import {
  deleteAdminSubcategory,
  setAdminSubcategoryActive,
} from '../api/admin/subcategories'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { AdminCategoryRow, AdminCategoryTreeRow } from '../types/adminCategories'
import { mapApiCategoryToTreeRow } from '../utils/adminCategoriesFormat'

const KEYWORD_DEBOUNCE_MS = 300
const TREE_SORT = 'name'

interface AsyncState {
  categories: AdminCategoryTreeRow[]
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

function filterTreeRows(
  rows: AdminCategoryTreeRow[],
  keyword: string,
): AdminCategoryTreeRow[] {
  const query = keyword.trim().toLowerCase()
  if (!query) return rows

  return rows
    .map((category) => {
      const categoryMatches =
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      const matchingSubs = category.subcategories.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.slug.toLowerCase().includes(query),
      )

      if (categoryMatches) return category
      if (matchingSubs.length > 0) {
        return { ...category, subcategories: matchingSubs }
      }
      return null
    })
    .filter((row): row is AdminCategoryTreeRow => row != null)
}

/** Loads the full category tree (including inactive) for the admin tree table. */
export function useAdminCategoryTree() {
  const { t } = useTranslation()
  const toast = useToast()
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [state, setState] = useState<AsyncState>({
    categories: [],
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
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState<
    string | null
  >(null)
  const [togglingSubcategoryId, setTogglingSubcategoryId] = useState<
    string | null
  >(null)
  const deletingCategoryIdRef = useRef<string | null>(null)
  const togglingCategoryIdRef = useRef<string | null>(null)
  const deletingSubcategoryIdRef = useRef<string | null>(null)
  const togglingSubcategoryIdRef = useRef<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, KEYWORD_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setKeyword = useCallback((value: string) => {
    setKeywordState(value)
  }, [])

  const clearFilters = useCallback(() => {
    setKeywordState('')
    setDebouncedKeyword('')
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
        const response = await getAdminCategories(
          { includeInactive: true, sort: TREE_SORT },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return

        setState({
          categories: (response.data ?? []).map(mapApiCategoryToTreeRow),
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
            ? { categories: [] }
            : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken, t])

  const filteredCategories = useMemo(
    () => filterTreeRows(state.categories, debouncedKeyword),
    [debouncedKeyword, state.categories],
  )

  const upsertCategory = useCallback((_category: AdminCategoryRow) => {
    reload()
  }, [reload])

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
        toast.success(t('admin.categories.delete.success'))
      } finally {
        deletingCategoryIdRef.current = null
        setDeletingCategoryId(null)
      }
    },
    [t, toast],
  )

  const toggleCategoryActive = useCallback(
    async (categoryId: string) => {
      if (togglingCategoryIdRef.current === categoryId) return

      const previousRow = state.categories.find((row) => row.id === categoryId)
      if (!previousRow) return

      const nextValue = !previousRow.isActive
      togglingCategoryIdRef.current = categoryId
      setTogglingCategoryId(categoryId)

      setState((previous) => ({
        ...previous,
        categories: previous.categories.map((row) =>
          row.id === categoryId ? { ...row, isActive: nextValue } : row,
        ),
      }))

      try {
        const response = await setAdminCategoryActive(categoryId, nextValue)
        const confirmed =
          typeof response.data?.isActive === 'boolean'
            ? response.data.isActive
            : nextValue

        if (response.data) {
          const mapped = mapApiCategoryToTreeRow(response.data)
          setState((previous) => ({
            ...previous,
            categories: previous.categories.map((row) =>
              row.id === categoryId ? mapped : row,
            ),
          }))
        } else {
          setState((previous) => ({
            ...previous,
            categories: previous.categories.map((row) =>
              row.id === categoryId ? { ...row, isActive: confirmed } : row,
            ),
          }))
        }

        toast.success(
          confirmed
            ? t('admin.categories.toggle.onSuccess')
            : t('admin.categories.toggle.offSuccess'),
        )
      } catch (error) {
        setState((previous) => ({
          ...previous,
          categories: previous.categories.map((row) =>
            row.id === categoryId
              ? { ...row, isActive: previousRow.isActive }
              : row,
          ),
        }))
        toast.error(resolveCategoryMutationError(error, t, 'toggle'))
      } finally {
        if (togglingCategoryIdRef.current === categoryId) {
          togglingCategoryIdRef.current = null
          setTogglingCategoryId(null)
        }
      }
    },
    [state.categories, t, toast],
  )

  const deleteSubcategory = useCallback(
    async (categoryId: string, subcategoryId: string) => {
      if (deletingSubcategoryIdRef.current) return
      deletingSubcategoryIdRef.current = subcategoryId
      setDeletingSubcategoryId(subcategoryId)

      try {
        await deleteAdminSubcategory(categoryId, subcategoryId)
        setState((previous) => ({
          ...previous,
          categories: previous.categories.map((row) =>
            row.id === categoryId
              ? {
                  ...row,
                  subcategories: row.subcategories.filter(
                    (sub) => sub.id !== subcategoryId,
                  ),
                }
              : row,
          ),
        }))
        toast.success(t('admin.subcategories.delete.success'))
      } finally {
        deletingSubcategoryIdRef.current = null
        setDeletingSubcategoryId(null)
      }
    },
    [t, toast],
  )

  const toggleSubcategoryActive = useCallback(
    async (categoryId: string, subcategoryId: string) => {
      if (togglingSubcategoryIdRef.current === subcategoryId) return

      const category = state.categories.find((row) => row.id === categoryId)
      const previousSub = category?.subcategories.find(
        (sub) => sub.id === subcategoryId,
      )
      if (!previousSub) return

      const nextValue = !previousSub.isActive
      togglingSubcategoryIdRef.current = subcategoryId
      setTogglingSubcategoryId(subcategoryId)

      setState((previous) => ({
        ...previous,
        categories: previous.categories.map((row) =>
          row.id === categoryId
            ? {
                ...row,
                subcategories: row.subcategories.map((sub) =>
                  sub.id === subcategoryId
                    ? { ...sub, isActive: nextValue }
                    : sub,
                ),
              }
            : row,
        ),
      }))

      try {
        const response = await setAdminSubcategoryActive(
          categoryId,
          subcategoryId,
          nextValue,
        )
        const confirmed =
          typeof response.data?.isActive === 'boolean'
            ? response.data.isActive
            : nextValue

        setState((previous) => ({
          ...previous,
          categories: previous.categories.map((row) =>
            row.id === categoryId
              ? {
                  ...row,
                  subcategories: row.subcategories.map((sub) =>
                    sub.id === subcategoryId
                      ? { ...sub, isActive: confirmed }
                      : sub,
                  ),
                }
              : row,
          ),
        }))

        toast.success(
          confirmed
            ? t('admin.subcategories.toggle.onSuccess')
            : t('admin.subcategories.toggle.offSuccess'),
        )
      } catch (error) {
        setState((previous) => ({
          ...previous,
          categories: previous.categories.map((row) =>
            row.id === categoryId
              ? {
                  ...row,
                  subcategories: row.subcategories.map((sub) =>
                    sub.id === subcategoryId
                      ? { ...sub, isActive: previousSub.isActive }
                      : sub,
                  ),
                }
              : row,
          ),
        }))
        toast.error(resolveSubcategoryMutationError(error, t, 'toggle'))
      } finally {
        if (togglingSubcategoryIdRef.current === subcategoryId) {
          togglingSubcategoryIdRef.current = null
          setTogglingSubcategoryId(null)
        }
      }
    },
    [state.categories, t, toast],
  )

  const hasActiveFilters = Boolean(debouncedKeyword)

  return {
    categories: filteredCategories,
    totalCount: state.categories.length,
    loading: state.loading,
    error: state.error,
    filters: { keyword },
    debouncedKeyword,
    hasActiveFilters,
    deletingCategoryId,
    togglingCategoryId,
    deletingSubcategoryId,
    togglingSubcategoryId,
    setKeyword,
    clearFilters,
    reload,
    upsertCategory,
    deleteCategory,
    toggleCategoryActive,
    deleteSubcategory,
    toggleSubcategoryActive,
  }
}
