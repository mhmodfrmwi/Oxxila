// src/hooks/useAccountOrders.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cancelMyOrder, getMyOrders } from '../api/orders'
import {
  getEligibleReturnOrders,
  getMyReturns,
  type ReturnRequest,
} from '../api/returns'
import { useToast } from '../context/ToastContext'
import { ApiError, type ApiPagination } from '../lib/api'
import { isAbortError } from '../lib/isAbortError'
import type { ApiOrder } from '../types/order'
import { getReturnOrderId } from '../utils/returnTracking'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SORT = '-createdAt'

export interface AccountOrderAnnotations {
  /** Most recent return request for this order, if any. */
  returnRequest: ReturnRequest | null
  /** True when the order appears in the eligible-returns list. */
  isReturnEligible: boolean
}

interface AccountOrdersState {
  orders: ApiOrder[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

function buildReturnByOrderId(returns: ReturnRequest[]): Map<string, ReturnRequest> {
  const map = new Map<string, ReturnRequest>()
  for (const entry of returns) {
    const orderId = getReturnOrderId(entry)
    if (!orderId) continue
    const existing = map.get(orderId)
    if (!existing) {
      map.set(orderId, entry)
      continue
    }
    // Keep the newest return when an order has multiple.
    if (new Date(entry.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      map.set(orderId, entry)
    }
  }
  return map
}

export function useAccountOrders() {
  const { t } = useTranslation()
  const toast = useToast()
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [state, setState] = useState<AccountOrdersState>({
    orders: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [returnByOrderId, setReturnByOrderId] = useState<Map<string, ReturnRequest>>(
    () => new Map(),
  )
  const [eligibleOrderIds, setEligibleOrderIds] = useState<Set<string>>(() => new Set())
  const [reloadToken, setReloadToken] = useState(0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))

      try {
        const [ordersResponse, returnsResponse, eligibleResponse] = await Promise.all([
          getMyOrders(
            { page, limit: DEFAULT_LIMIT, sort: DEFAULT_SORT },
            { signal: controller.signal },
          ),
          getMyReturns({ limit: 50 }).catch(() => null),
          getEligibleReturnOrders({ limit: 50 }).catch(() => null),
        ])

        if (requestId !== requestIdRef.current) return

        const pagination = ordersResponse.pagination ?? null
        const totalPages = Math.max(1, pagination?.numberOfPages ?? 1)

        // Clamp out-of-range pages (emptied result sets after cancel, etc.).
        if (page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setPage(totalPages)
          return
        }

        setState({
          orders: ordersResponse.data ?? [],
          pagination,
          loading: false,
          error: null,
        })

        if (returnsResponse?.data) {
          setReturnByOrderId(buildReturnByOrderId(returnsResponse.data))
        } else {
          setReturnByOrderId(new Map())
        }

        if (eligibleResponse?.data) {
          setEligibleOrderIds(
            new Set(eligibleResponse.data.map((order) => order._id)),
          )
        } else {
          setEligibleOrderIds(new Set())
        }
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setState({
          orders: [],
          pagination: null,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : t('profile.orders.loadFailed'),
        })
      }
    }

    void load()

    return () => {
      controller.abort()
    }
  }, [page, reloadToken, t])

  const annotationsByOrderId = useMemo(() => {
    const map = new Map<string, AccountOrderAnnotations>()
    for (const order of state.orders) {
      map.set(order._id, {
        returnRequest: returnByOrderId.get(order._id) ?? null,
        isReturnEligible: eligibleOrderIds.has(order._id),
      })
    }
    return map
  }, [state.orders, returnByOrderId, eligibleOrderIds])

  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      setCancellingId(orderId)
      try {
        await cancelMyOrder(orderId, reason)
        toast.success(t('profile.orders.cancelSuccess'))
        reload()
      } catch (error) {
        toast.error(
          t('profile.orders.cancelError'),
          error instanceof ApiError ? error.message : undefined,
        )
        throw error
      } finally {
        setCancellingId(null)
      }
    },
    [reload, t, toast],
  )

  const totalPages = Math.max(1, state.pagination?.numberOfPages ?? 1)
  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  return {
    orders: state.orders,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    page,
    totalPages,
    canGoPrev,
    canGoNext,
    setPage,
    reload,
    cancellingId,
    cancelOrder,
    annotationsByOrderId,
  }
}
