// src/hooks/useCarrierPickups.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAdminCarrierPickup,
  deleteAdminCarrierPickup,
  getAdminCarrierBostaDistrictsLookup,
  getAdminCarrierPickups,
  setDefaultAdminCarrierPickup,
  syncAdminCarrierBostaCoverage,
  syncAdminCarrierBostaPickups,
  syncAdminCarrierBostaZones,
} from '../api/admin/carriers'
import { ApiError } from '../lib/api'
import type {
  AdminCarrierPickupRow,
  ApiBostaCity,
  CreateCarrierPickupPayload,
} from '../types/adminShipping'
import { mapApiPickupToRow } from '../utils/adminShippingFormat'

interface UseCarrierPickupsOptions {
  carrierId: string | null
  /** Only fetch when the drawer is open in edit mode for a Bosta/api carrier. */
  enabled: boolean
}

/** Bosta pickups list + sync + add/default/delete for a single carrier. */
export function useCarrierPickups({ carrierId, enabled }: UseCarrierPickupsOptions) {
  const [items, setItems] = useState<AdminCarrierPickupRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncingZones, setSyncingZones] = useState(false)
  const [syncingCoverage, setSyncingCoverage] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [cities, setCities] = useState<ApiBostaCity[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesError, setCitiesError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled || !carrierId) {
      setItems([])
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await getAdminCarrierPickups(carrierId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        setItems((response.data ?? []).map(mapApiPickupToRow))
        setLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setLoading(false)
        setError(err instanceof ApiError ? err.message : 'Unable to load pickups.')
      }
    })()

    return () => {
      controller.abort()
    }
  }, [carrierId, enabled, reloadToken])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const loadDistrictsLookup = useCallback(async () => {
    if (!carrierId) return
    setCitiesLoading(true)
    setCitiesError(null)
    try {
      const response = await getAdminCarrierBostaDistrictsLookup(carrierId)
      setCities(response.data ?? [])
      setCitiesLoading(false)
    } catch (err) {
      setCitiesLoading(false)
      setCitiesError(
        err instanceof ApiError ? err.message : 'Unable to load districts lookup.',
      )
    }
  }, [carrierId])

  const syncPickups = useCallback(async () => {
    if (!carrierId) return false
    setSyncing(true)
    setError(null)
    try {
      const response = await syncAdminCarrierBostaPickups(carrierId)
      setItems((response.data ?? []).map(mapApiPickupToRow))
      setSyncing(false)
      return true
    } catch (err) {
      setSyncing(false)
      setError(
        err instanceof ApiError ? err.message : 'Unable to sync pickups from Bosta.',
      )
      return false
    }
  }, [carrierId])

  const syncZones = useCallback(async () => {
    if (!carrierId) return false
    setSyncingZones(true)
    setError(null)
    try {
      await syncAdminCarrierBostaZones(carrierId)
      setSyncingZones(false)
      return true
    } catch (err) {
      setSyncingZones(false)
      setError(
        err instanceof ApiError ? err.message : 'Unable to sync zones from Bosta.',
      )
      return false
    }
  }, [carrierId])

  const syncCoverage = useCallback(async () => {
    if (!carrierId) return false
    setSyncingCoverage(true)
    setError(null)
    try {
      await syncAdminCarrierBostaCoverage(carrierId)
      setSyncingCoverage(false)
      return true
    } catch (err) {
      setSyncingCoverage(false)
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to sync coverage from Bosta.',
      )
      return false
    }
  }, [carrierId])

  const addPickup = useCallback(
    async (payload: CreateCarrierPickupPayload) => {
      if (!carrierId) return false
      setAdding(true)
      setAddError(null)
      try {
        const response = await createAdminCarrierPickup(carrierId, payload)
        const created = response.data
        if (!created) throw new ApiError(response.message || 'Unable to add pickup.')
        setItems((previous) => [...previous, mapApiPickupToRow(created)])
        setAdding(false)
        return true
      } catch (err) {
        setAdding(false)
        setAddError(err instanceof ApiError ? err.message : 'Unable to add pickup.')
        return false
      }
    },
    [carrierId],
  )

  const setDefault = useCallback(
    async (pickupId: string) => {
      if (!carrierId) return
      setMutatingId(pickupId)
      setError(null)
      try {
        await setDefaultAdminCarrierPickup(carrierId, pickupId)
        setItems((previous) =>
          previous.map((item) => ({ ...item, isDefault: item.id === pickupId })),
        )
        setMutatingId(null)
      } catch (err) {
        setMutatingId(null)
        setError(
          err instanceof ApiError ? err.message : 'Unable to set default pickup.',
        )
      }
    },
    [carrierId],
  )

  const removePickup = useCallback(
    async (pickupId: string) => {
      if (!carrierId) return
      setMutatingId(pickupId)
      setError(null)
      try {
        await deleteAdminCarrierPickup(carrierId, pickupId)
        setItems((previous) => previous.filter((item) => item.id !== pickupId))
        setMutatingId(null)
      } catch (err) {
        setMutatingId(null)
        setError(err instanceof ApiError ? err.message : 'Unable to delete pickup.')
      }
    },
    [carrierId],
  )

  return {
    items,
    loading,
    error,
    reload,
    syncing,
    syncPickups,
    syncingZones,
    syncZones,
    syncingCoverage,
    syncCoverage,
    adding,
    addError,
    addPickup,
    mutatingId,
    setDefault,
    removePickup,
    cities,
    citiesLoading,
    citiesError,
    loadDistrictsLookup,
  }
}
