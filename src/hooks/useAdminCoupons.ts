// src/hooks/useAdminCoupons.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAdminCoupons } from '../api/admin/coupons'
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
  const { i18n } = useTranslation()
  const locale = i18n.language
  const [page, setPageState] = useState(DEFAULT_PAGE)
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

  return {
    coupons: state.coupons,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    page,
    setPage,
    reload,
    upsertCoupon,
  }
}
