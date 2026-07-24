// src/hooks/useShippingMethods.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminShippingMethods,
  updateAdminShippingMethod,
} from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import type {
  AdminShippingMethodRow,
  AdminShippingMethodType,
} from '../types/adminShipping'
import { mapApiShippingMethods } from '../utils/adminShippingFormat'

/** Shipping Methods panel — 3 live toggles: api / known / internal. */
export function useShippingMethods() {
  const [methods, setMethods] = useState<AdminShippingMethodRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingType, setUpdatingType] = useState<AdminShippingMethodType | null>(
    null,
  )
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await getAdminShippingMethods({
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        setMethods(mapApiShippingMethods(response.data ?? []))
        setLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setLoading(false)
        setError(
          err instanceof ApiError ? err.message : 'Unable to load shipping methods.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const toggleMethod = useCallback(
    async (type: AdminShippingMethodType, nextEnabled: boolean) => {
      let previous: AdminShippingMethodRow[] = []
      setUpdatingType(type)
      setError(null)
      setMethods((current) => {
        previous = current
        return current.map((method) =>
          method.type === type ? { ...method, isEnabled: nextEnabled } : method,
        )
      })
      try {
        await updateAdminShippingMethod(type, nextEnabled)
        setUpdatingType(null)
        return true
      } catch (err) {
        setMethods(previous)
        setUpdatingType(null)
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to update shipping method.',
        )
        return false
      }
    },
    [],
  )

  return { methods, loading, error, updatingType, reload, toggleMethod }
}
