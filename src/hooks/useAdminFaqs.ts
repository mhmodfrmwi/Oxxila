// src/hooks/useAdminFaqs.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteAdminFaq,
  getAdminProductFaqs,
  setAdminFaqActive,
} from '../api/admin/faqs'
import { getAdminProducts } from '../api/admin/products'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type {
  AdminFaqProductOption,
  AdminFaqRow,
} from '../types/adminFaqs'
import { mapApiFaqToAdminRow } from '../utils/adminFaqsFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const KEYWORD_DEBOUNCE_MS = 300

interface AsyncState {
  /** Full product FAQ set from the server (no pagination / keyword). */
  allRows: AdminFaqRow[]
  loading: boolean
  error: string | null
}

function resolveFaqMutationError(
  error: unknown,
  t: (key: string) => string,
  prefix: 'delete' | 'toggle',
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t(`admin.faqs.${prefix}.errors.badRequest`)
      case 401:
        return t(`admin.faqs.${prefix}.errors.unauthorized`)
      case 403:
        return t(`admin.faqs.${prefix}.errors.forbidden`)
      case 404:
        return t(`admin.faqs.${prefix}.errors.notFound`)
      case 409:
        return t(`admin.faqs.${prefix}.errors.conflict`)
      case 500:
        return t(`admin.faqs.${prefix}.errors.server`)
      default:
        return t(`admin.faqs.${prefix}.errors.unknown`)
    }
  }

  return t(`admin.faqs.${prefix}.errors.unknown`)
}

function matchesKeyword(row: AdminFaqRow, keyword: string): boolean {
  if (!keyword) return true
  const haystack = `${row.question} ${row.answer}`.toLowerCase()
  return haystack.includes(keyword.toLowerCase())
}

export function useAdminFaqs() {
  const { t } = useTranslation()
  const toast = useToast()
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [productFilter, setProductFilterState] = useState('')
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [state, setState] = useState<AsyncState>({
    allRows: [],
    loading: false,
    error: null,
  })
  const [products, setProducts] = useState<AdminFaqProductOption[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null)
  const [togglingFaqId, setTogglingFaqId] = useState<string | null>(null)
  const deletingFaqIdRef = useRef<string | null>(null)
  const togglingFaqIdRef = useRef<string | null>(null)
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
    setPageState(DEFAULT_PAGE)
  }, [])

  const setProductFilter = useCallback((value: string) => {
    setProductFilterState(value)
    setPageState(DEFAULT_PAGE)
  }, [])

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next))
  }, [])

  const clearFilters = useCallback(() => {
    setKeywordState('')
    setDebouncedKeyword('')
    setProductFilterState('')
    setPageState(DEFAULT_PAGE)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setProductsLoading(true)
    void (async () => {
      try {
        const response = await getAdminProducts(
          { limit: 100, sort: 'name' },
          { signal: controller.signal },
        )
        if (controller.signal.aborted) return
        setProducts(
          (response.data ?? []).map((product) => ({
            id: String(product._id),
            name: product.name ?? '',
          })),
        )
      } catch (error) {
        if (isAbortError(error)) return
        setProducts([])
      } finally {
        if (!controller.signal.aborted) setProductsLoading(false)
      }
    })()
    return () => {
      controller.abort()
    }
  }, [])

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productFilter) ?? null,
    [productFilter, products],
  )

  useEffect(() => {
    if (!productFilter) {
      setState({ allRows: [], loading: false, error: null })
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminProductFaqs(productFilter, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const fallback = {
          id: productFilter,
          name: selectedProduct?.name ?? null,
        }

        setState({
          allRows: (response.data ?? []).map((faq) =>
            mapApiFaqToAdminRow(faq, fallback),
          ),
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
              : t('admin.faqs.loadErrorDescription'),
          ...(previous.allRows.length === 0 ? { allRows: [] } : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [productFilter, reloadToken, selectedProduct?.name, t])

  const filteredRows = useMemo(
    () => state.allRows.filter((row) => matchesKeyword(row, debouncedKeyword)),
    [debouncedKeyword, state.allRows],
  )

  const totalCount = filteredRows.length
  const totalPages = Math.max(Math.ceil(totalCount / DEFAULT_LIMIT) || 1, 1)

  useEffect(() => {
    if (page > totalPages) setPageState(totalPages)
  }, [page, totalPages])

  const faqs = useMemo(() => {
    const start = (page - 1) * DEFAULT_LIMIT
    return filteredRows.slice(start, start + DEFAULT_LIMIT)
  }, [filteredRows, page])

  const upsertFaq = useCallback((faq: AdminFaqRow) => {
    setState((previous) => {
      if (!faq.isActive) {
        return {
          ...previous,
          allRows: previous.allRows.filter((row) => row.id !== faq.id),
        }
      }

      const index = previous.allRows.findIndex((row) => row.id === faq.id)
      if (index === -1) {
        return {
          ...previous,
          allRows: [faq, ...previous.allRows],
        }
      }
      const next = [...previous.allRows]
      next[index] = faq
      return { ...previous, allRows: next }
    })
  }, [])

  const deleteFaq = useCallback(
    async (faqId: string) => {
      if (deletingFaqIdRef.current) return

      deletingFaqIdRef.current = faqId
      setDeletingFaqId(faqId)

      try {
        await deleteAdminFaq(faqId)
        setState((previous) => ({
          ...previous,
          allRows: previous.allRows.filter((item) => item.id !== faqId),
        }))
        reload()
        toast.success(t('admin.faqs.delete.success'))
      } finally {
        deletingFaqIdRef.current = null
        setDeletingFaqId(null)
      }
    },
    [reload, t, toast],
  )

  const toggleActive = useCallback(
    async (faqId: string) => {
      if (togglingFaqIdRef.current === faqId) return

      const previousRow = state.allRows.find((row) => row.id === faqId)
      if (!previousRow) return

      const nextValue = !previousRow.isActive
      togglingFaqIdRef.current = faqId
      setTogglingFaqId(faqId)

      setState((previous) => ({
        ...previous,
        allRows: nextValue
          ? previous.allRows.map((row) =>
              row.id === faqId ? { ...row, isActive: true } : row,
            )
          : previous.allRows.filter((row) => row.id !== faqId),
      }))

      try {
        const response = await setAdminFaqActive(faqId, nextValue)
        const confirmed =
          typeof response.data?.isActive === 'boolean'
            ? response.data.isActive
            : nextValue

        if (response.data) {
          upsertFaq(
            mapApiFaqToAdminRow(response.data, {
              id: previousRow.productId,
              name: previousRow.productName,
            }),
          )
        } else if (!confirmed) {
          setState((previous) => ({
            ...previous,
            allRows: previous.allRows.filter((row) => row.id !== faqId),
          }))
        }

        toast.success(
          confirmed
            ? t('admin.faqs.toggle.onSuccess')
            : t('admin.faqs.toggle.offSuccess'),
        )
      } catch (error) {
        setState((previous) => {
          const exists = previous.allRows.some((row) => row.id === faqId)
          if (exists) {
            return {
              ...previous,
              allRows: previous.allRows.map((row) =>
                row.id === faqId
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
        toast.error(resolveFaqMutationError(error, t, 'toggle'))
      } finally {
        if (togglingFaqIdRef.current === faqId) {
          togglingFaqIdRef.current = null
          setTogglingFaqId(null)
        }
      }
    },
    [state.allRows, t, toast, upsertFaq],
  )

  const hasActiveFilters = Boolean(debouncedKeyword || productFilter)
  const needsProduct = !productFilter

  return {
    faqs,
    allCount: state.allRows.length,
    filteredCount: totalCount,
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
      product: productFilter,
      page,
      limit: DEFAULT_LIMIT,
    },
    products,
    productsLoading,
    selectedProduct,
    needsProduct,
    hasActiveFilters,
    deletingFaqId,
    togglingFaqId,
    setKeyword,
    setProductFilter,
    setPage,
    clearFilters,
    reload,
    upsertFaq,
    deleteFaq,
    toggleActive,
  }
}
