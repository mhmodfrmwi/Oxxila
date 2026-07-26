// src/hooks/useAdminShipping.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAdminCarriers } from '../api/admin/carriers'
import { ApiError } from '../lib/api'
import type { AdminCarrierRow } from '../types/adminShipping'
import {
  filterCarriersByKeyword,
  filterCarriersByType,
  type AdminCarrierTypeFilter,
  mapApiCarrierToAdminRow,
} from '../utils/adminShippingFormat'

const SEARCH_DEBOUNCE_MS = 300

/** Shipping page — Courier Companies list (carriers only; assign lives on Orders). */
export function useAdminShipping() {
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [typeFilter, setTypeFilterState] = useState<AdminCarrierTypeFilter>('all')
  const [carriers, setCarriers] = useState<AdminCarrierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [keyword])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await getAdminCarriers({ signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        setCarriers((response.data ?? []).map(mapApiCarrierToAdminRow))
        setLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setLoading(false)
        setError(err instanceof ApiError ? err.message : 'Unable to load carriers.')
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken])

  const setKeyword = useCallback((value: string) => {
    setKeywordState(value)
  }, [])

  const setTypeFilter = useCallback((value: AdminCarrierTypeFilter) => {
    setTypeFilterState(value)
  }, [])

  const clearFilters = useCallback(() => {
    setKeywordState('')
    setTypeFilterState('all')
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const upsertCarrier = useCallback((row: AdminCarrierRow) => {
    setCarriers((previous) => {
      const exists = previous.some((carrier) => carrier.id === row.id)
      return exists
        ? previous.map((carrier) => (carrier.id === row.id ? row : carrier))
        : [row, ...previous]
    })
  }, [])

  const removeCarrier = useCallback((id: string) => {
    setCarriers((previous) => previous.filter((carrier) => carrier.id !== id))
  }, [])

  const visibleCarriers = useMemo(() => {
    const byType = filterCarriersByType(carriers, typeFilter)
    return filterCarriersByKeyword(byType, debouncedKeyword)
  }, [carriers, debouncedKeyword, typeFilter])

  const hasActiveFilters = Boolean(debouncedKeyword) || typeFilter !== 'all'

  return {
    carriers: visibleCarriers,
    allCarriers: carriers,
    loading,
    error,
    keyword,
    typeFilter,
    hasActiveFilters,
    setKeyword,
    setTypeFilter,
    clearFilters,
    reload,
    upsertCarrier,
    removeCarrier,
  }
}
