// src/hooks/useCarrierCoverage.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAdminCarrierCoverage,
  updateAdminCarrierCoverage,
} from '../api/admin/carriers'
import { getAdminCountries, getAdminCountryGovernorates } from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import type { AdminGovernorateOption } from '../types/adminShipping'
import { mapApiCoverageToGovernorateIds } from '../utils/adminShippingFormat'

interface UseCarrierCoverageOptions {
  carrierId: string | null
  /** Only fetch once the drawer is open in edit mode. */
  enabled: boolean
}

/** Governorate multi-select coverage editor for a single carrier. */
export function useCarrierCoverage({ carrierId, enabled }: UseCarrierCoverageOptions) {
  const [options, setOptions] = useState<AdminGovernorateOption[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled || !carrierId) {
      setOptions([])
      setSelectedIds(new Set())
      setInitialIds(new Set())
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [countriesResponse, coverageResponse] = await Promise.all([
          getAdminCountries({ signal: controller.signal }),
          getAdminCarrierCoverage(carrierId, { signal: controller.signal }),
        ])
        if (requestId !== requestIdRef.current) return

        const countries = countriesResponse.data ?? []
        const governoratesByCountry = await Promise.all(
          countries.map(async (country) => {
            const countryId = String(country._id)
            const response = await getAdminCountryGovernorates(countryId, {
              signal: controller.signal,
            })
            return (response.data ?? []).map((gov): AdminGovernorateOption => ({
              id: String(gov._id),
              name: gov.name?.trim() || '—',
              countryId,
              countryName: country.name?.trim() || '—',
            }))
          }),
        )
        if (requestId !== requestIdRef.current) return

        const ids = new Set(
          mapApiCoverageToGovernorateIds(coverageResponse.data ?? []),
        )
        setOptions(governoratesByCountry.flat())
        setSelectedIds(new Set(ids))
        setInitialIds(new Set(ids))
        setLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setLoading(false)
        setError(err instanceof ApiError ? err.message : 'Unable to load coverage.')
      }
    })()

    return () => {
      controller.abort()
    }
  }, [carrierId, enabled])

  const toggle = useCallback((id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaveError(null)
  }, [])

  const dirty = useMemo(() => {
    if (selectedIds.size !== initialIds.size) return true
    for (const id of selectedIds) {
      if (!initialIds.has(id)) return true
    }
    return false
  }, [selectedIds, initialIds])

  const save = useCallback(async () => {
    if (!carrierId) return false
    setSaving(true)
    setSaveError(null)
    try {
      await updateAdminCarrierCoverage(carrierId, [...selectedIds])
      setInitialIds(new Set(selectedIds))
      setSaving(false)
      return true
    } catch (err) {
      setSaving(false)
      setSaveError(err instanceof ApiError ? err.message : 'Unable to save coverage.')
      return false
    }
  }, [carrierId, selectedIds])

  return { options, selectedIds, loading, error, toggle, dirty, saving, saveError, save }
}
