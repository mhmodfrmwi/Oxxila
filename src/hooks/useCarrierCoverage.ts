// src/hooks/useCarrierCoverage.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAdminCarrierCoverage,
  updateAdminCarrierCoverage,
} from '../api/admin/carriers'
import { getAdminCountries, getAdminCountryGovernorates } from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import { isAbortError } from '../lib/isAbortError'
import type { AdminCountryRow, AdminGovernorateOption } from '../types/adminShipping'
import {
  mapApiCountryToRow,
  mapApiCoverageToGovernorateIds,
} from '../utils/adminShippingFormat'

interface UseCarrierCoverageOptions {
  carrierId: string | null
  /** Fetch countries (and existing coverage when editing) while the drawer is open. */
  enabled: boolean
}

export type UseCarrierCoverageResult = {
  countries: AdminCountryRow[]
  selectedCountryId: string
  setSelectedCountryId: (countryId: string) => void
  /** Governorates for the selected country only. */
  governorates: AdminGovernorateOption[]
  selectedIds: ReadonlySet<string>
  loading: boolean
  governoratesLoading: boolean
  error: string | null
  toggle: (governorateId: string) => void
  dirty: boolean
  saving: boolean
  saveError: string | null
  save: () => Promise<boolean>
  /** After create — persist pending chip selection for the new carrier id. */
  saveForCarrier: (carrierId: string) => Promise<boolean>
  hasPendingSelection: boolean
}

/**
 * Country → governorate coverage for the carrier drawer (Figma location flow).
 * Governorates load only after a country is selected.
 */
export function useCarrierCoverage({
  carrierId,
  enabled,
}: UseCarrierCoverageOptions): UseCarrierCoverageResult {
  const [countries, setCountries] = useState<AdminCountryRow[]>([])
  const [selectedCountryId, setSelectedCountryIdState] = useState('')
  const [governorates, setGovernorates] = useState<AdminGovernorateOption[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [initialIds, setInitialIds] = useState<Set<string>>(() => new Set())
  const [loading, setLoading] = useState(false)
  const [governoratesLoading, setGovernoratesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const countriesRequestId = useRef(0)
  const governoratesRequestId = useRef(0)
  /** Snapshot of selected ids under the previous country (cleared on country change). */
  const previousCountryGovIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled) {
      setCountries([])
      setSelectedCountryIdState('')
      setGovernorates([])
      setSelectedIds(new Set())
      setInitialIds(new Set())
      setLoading(false)
      setGovernoratesLoading(false)
      setError(null)
      setSaveError(null)
      previousCountryGovIdsRef.current = new Set()
      return
    }

    const controller = new AbortController()
    const requestId = ++countriesRequestId.current
    setLoading(true)
    setError(null)
    setSelectedCountryIdState('')
    setGovernorates([])
    previousCountryGovIdsRef.current = new Set()

    void (async () => {
      try {
        const countriesResponse = await getAdminCountries({
          signal: controller.signal,
        })
        if (requestId !== countriesRequestId.current) return

        const rows = (countriesResponse.data ?? []).map(mapApiCountryToRow)
        setCountries(rows)

        if (carrierId) {
          const coverageResponse = await getAdminCarrierCoverage(carrierId, {
            signal: controller.signal,
          })
          if (requestId !== countriesRequestId.current) return
          const ids = new Set(
            mapApiCoverageToGovernorateIds(coverageResponse.data ?? []),
          )
          setSelectedIds(new Set(ids))
          setInitialIds(new Set(ids))
        } else {
          setSelectedIds(new Set())
          setInitialIds(new Set())
        }

        setLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== countriesRequestId.current) {
          return
        }
        if (isAbortError(err)) return
        setLoading(false)
        setCountries([])
        setSelectedIds(new Set())
        setInitialIds(new Set())
        setError(
          err instanceof ApiError ? err.message : 'Unable to load coverage.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [carrierId, enabled])

  useEffect(() => {
    if (!enabled || !selectedCountryId) {
      setGovernorates([])
      setGovernoratesLoading(false)
      previousCountryGovIdsRef.current = new Set()
      return
    }

    const controller = new AbortController()
    const requestId = ++governoratesRequestId.current
    setGovernoratesLoading(true)
    setGovernorates([])

    void (async () => {
      try {
        const response = await getAdminCountryGovernorates(selectedCountryId, {
          signal: controller.signal,
        })
        if (requestId !== governoratesRequestId.current) return

        const country = countries.find((row) => row.id === selectedCountryId)
        const options = (response.data ?? []).map(
          (gov): AdminGovernorateOption => ({
            id: String(gov._id),
            name: gov.name?.trim() || '—',
            countryId: selectedCountryId,
            countryName: country?.name ?? '—',
          }),
        )
        setGovernorates(options)
        previousCountryGovIdsRef.current = new Set(options.map((g) => g.id))
        setGovernoratesLoading(false)
      } catch (err) {
        if (
          controller.signal.aborted ||
          requestId !== governoratesRequestId.current
        ) {
          return
        }
        if (isAbortError(err)) return
        setGovernoratesLoading(false)
        setGovernorates([])
        previousCountryGovIdsRef.current = new Set()
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load governorates.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [countries, enabled, selectedCountryId])

  const setSelectedCountryId = useCallback(
    (countryId: string) => {
      setSelectedCountryIdState((prev) => {
        if (prev === countryId) return prev
        // Clear governorates selected under the previous country (dependent field).
        setSelectedIds((ids) => {
          const previousGovIds = previousCountryGovIdsRef.current
          if (previousGovIds.size === 0) return ids
          const next = new Set<string>()
          for (const id of ids) {
            if (!previousGovIds.has(id)) next.add(id)
          }
          return next
        })
        previousCountryGovIdsRef.current = new Set()
        setSaveError(null)
        return countryId
      })
    },
    [],
  )

  const toggle = useCallback((governorateId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(governorateId)) next.delete(governorateId)
      else next.add(governorateId)
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

  const persist = useCallback(async (id: string): Promise<boolean> => {
    setSaving(true)
    setSaveError(null)
    try {
      await updateAdminCarrierCoverage(id, [...selectedIds])
      setInitialIds(new Set(selectedIds))
      setSaving(false)
      return true
    } catch (err) {
      setSaving(false)
      setSaveError(
        err instanceof ApiError ? err.message : 'Unable to save coverage.',
      )
      return false
    }
  }, [selectedIds])

  const save = useCallback(async () => {
    if (!carrierId) return false
    return persist(carrierId)
  }, [carrierId, persist])

  const saveForCarrier = useCallback(
    async (id: string) => persist(id),
    [persist],
  )

  return {
    countries,
    selectedCountryId,
    setSelectedCountryId,
    governorates,
    selectedIds,
    loading,
    governoratesLoading,
    error,
    toggle,
    dirty,
    saving,
    saveError,
    save,
    saveForCarrier,
    hasPendingSelection: selectedIds.size > 0,
  }
}
