// src/hooks/useAdminCustomerStats.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminCustomerStats } from '../api/admin/customers'
import { ApiError } from '../lib/api'
import type { AdminCustomerStats } from '../types/adminCustomers'
import { mapApiCustomerStats } from '../utils/adminCustomersFormat'

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useAdminCustomerStats() {
  const [stats, setStats] = useState<AdminCustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await getAdminCustomerStats({ signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        setStats(mapApiCustomerStats(response.data))
        setLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setLoading(false)
        setError(
          err instanceof ApiError ? err.message : 'Unable to load customer stats.',
        )
      }
    }

    void load()
    return () => controller.abort()
  }, [reloadToken])

  return { stats, loading, error, reload }
}
