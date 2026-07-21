// src/hooks/useAdminCarriers.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminCarriers } from '../api/admin/carriers'
import { ApiError } from '../lib/api'
import type { AdminCarrierRow } from '../types/adminShipping'
import { mapApiCarrierToAdminRow } from '../utils/adminShippingFormat'

interface AsyncState {
  carriers: AdminCarrierRow[]
  loading: boolean
  error: string | null
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/** Settings Shipping & Logistics — carriers as Shipping Protocols (read-only). */
export function useAdminCarriers() {
  const [state, setState] = useState<AsyncState>({
    carriers: [],
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
        const response = await getAdminCarriers({ signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        setState({
          carriers: (response.data ?? []).map(mapApiCarrierToAdminRow),
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
              : 'Unable to load carriers.',
          ...(previous.carriers.length === 0 ? { carriers: [] } : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken])

  return {
    carriers: state.carriers,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
