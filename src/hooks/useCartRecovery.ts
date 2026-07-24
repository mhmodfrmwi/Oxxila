// src/hooks/useCartRecovery.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getCartRecoveryMetrics } from '../api/admin/cartRecovery'
import { ApiError } from '../lib/api'
import type { CartRecoveryMetrics } from '../types/adminCartRecovery'
import { EMPTY_CART_RECOVERY_METRICS } from '../types/adminCartRecovery'

interface AsyncState {
  metrics: CartRecoveryMetrics
  /** True when an API returned real metric values. */
  hasData: boolean
  loading: boolean
  error: string | null
}

/**
 * Cart Recovery — GET /payments/cart-recovery?period=30.
 * Falls back to placeholder metrics on error so the UI stays stable.
 */
export function useCartRecovery() {
  const [state, setState] = useState<AsyncState>({
    metrics: EMPTY_CART_RECOVERY_METRICS,
    hasData: false,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
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
        const data = await getCartRecoveryMetrics({
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        if (!data) {
          setState({
            metrics: EMPTY_CART_RECOVERY_METRICS,
            hasData: false,
            loading: false,
            error: null,
          })
          return
        }

        setState({
          metrics: data,
          hasData: true,
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
              : 'Unable to load cart recovery.',
          hasData: false,
          metrics: EMPTY_CART_RECOVERY_METRICS,
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken])

  return {
    metrics: state.metrics,
    hasData: state.hasData,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
