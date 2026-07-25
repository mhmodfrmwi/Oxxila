// src/hooks/useAdminCoupons.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteAdminCoupon, getAdminCoupons } from '../api/admin/coupons'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminCouponRow,
  AdminCouponsListParams,
} from '../types/adminCoupons'
import { mapApiCouponToAdminRow } from '../utils/adminCouponsFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'

interface AsyncState {
  coupons: AdminCouponRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

export function useAdminCoupons() {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const locale = i18n.language
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null)
  const deletingCouponIdRef = useRef<string | null>(null)
  const [state, setState] = useState<AsyncState>({
    coupons: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const query = useMemo<AdminCouponsListParams>(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
    }),
    [page],
  )

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next))
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
        const response = await getAdminCoupons(query, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const coupons = (response.data ?? []).map((coupon) =>
          mapApiCouponToAdminRow(coupon, locale),
        )
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setPageState(totalPages)
          return
        }

        setState({
          coupons,
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
              : 'Unable to load coupons.',
          ...(previous.coupons.length === 0
            ? { coupons: [], pagination: null }
            : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [locale, page, query, reloadToken])

  const upsertCoupon = useCallback(
    (coupon: AdminCouponRow) => {
      setState((previous) => {
        const index = previous.coupons.findIndex((row) => row.id === coupon.id)
        if (index === -1) {
          return {
            ...previous,
            coupons: [coupon, ...previous.coupons],
          }
        }
        const next = [...previous.coupons]
        next[index] = coupon
        return { ...previous, coupons: next }
      })
    },
    [],
  )

  /** Rethrows so the confirm dialog can surface a translated message inline. */
  const deleteCoupon = useCallback(
    async (couponId: string) => {
      if (deletingCouponIdRef.current) return
      deletingCouponIdRef.current = couponId
      setDeletingCouponId(couponId)

      try {
        await deleteAdminCoupon(couponId)
        setState((previous) => ({
          ...previous,
          coupons: previous.coupons.filter((row) => row.id !== couponId),
        }))
        // Refetch the current page so pagination totals stay accurate.
        reload()
        toast.success(t('admin.settings.coupons.delete.success'))
      } finally {
        deletingCouponIdRef.current = null
        setDeletingCouponId(null)
      }
    },
    [reload, t, toast],
  )

  return {
    coupons: state.coupons,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    page,
    deletingCouponId,
    setPage,
    reload,
    upsertCoupon,
    deleteCoupon,
  }
}
