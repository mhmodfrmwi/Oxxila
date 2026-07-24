// src/hooks/useZoneManager.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAdminCountry,
  createAdminDistrict,
  createAdminGovernorate,
  deleteAdminCountry,
  deleteAdminDistrict,
  deleteAdminGovernorate,
  getAdminCountries,
  getAdminCountryGovernorates,
  getAdminGovernorateDistricts,
  updateAdminCountry,
  updateAdminDistrict,
  updateAdminGovernorate,
} from '../api/admin/shipping'
import { ApiError } from '../lib/api'
import type {
  AdminCountryRow,
  AdminDistrictRow,
  AdminGovernorateRow,
  CreateCountryPayload,
  CreateDistrictPayload,
  CreateGovernoratePayload,
  UpdateCountryPayload,
  UpdateDistrictPayload,
  UpdateGovernoratePayload,
} from '../types/adminShipping'
import {
  mapApiCountryToRow,
  mapApiDistrictToRow,
  mapApiGovernorateToRow,
} from '../utils/adminShippingFormat'

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/** Zone Manager — three-column drill-down: Countries → Governorates → Districts. */
export function useZoneManager() {
  const [countries, setCountries] = useState<AdminCountryRow[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [countriesError, setCountriesError] = useState<string | null>(null)
  const [countryMutating, setCountryMutating] = useState(false)

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [governorates, setGovernorates] = useState<AdminGovernorateRow[]>([])
  const [governoratesLoading, setGovernoratesLoading] = useState(false)
  const [governoratesError, setGovernoratesError] = useState<string | null>(null)
  const [governorateMutating, setGovernorateMutating] = useState(false)

  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string | null>(
    null,
  )
  const [districts, setDistricts] = useState<AdminDistrictRow[]>([])
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [districtsError, setDistrictsError] = useState<string | null>(null)
  const [districtMutating, setDistrictMutating] = useState(false)

  const countriesRequestId = useRef(0)
  const governoratesRequestId = useRef(0)
  const districtsRequestId = useRef(0)
  const [countriesReloadToken, setCountriesReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++countriesRequestId.current
    setCountriesLoading(true)
    setCountriesError(null)

    void (async () => {
      try {
        const response = await getAdminCountries({ signal: controller.signal })
        if (requestId !== countriesRequestId.current) return
        const rows = (response.data ?? []).map(mapApiCountryToRow)
        setCountries(rows)
        setCountriesLoading(false)
        setSelectedCountryId((previous) =>
          previous && rows.some((row) => row.id === previous)
            ? previous
            : rows[0]?.id ?? null,
        )
      } catch (err) {
        if (controller.signal.aborted || requestId !== countriesRequestId.current) return
        if (isAbortError(err)) return
        setCountriesLoading(false)
        setCountriesError(
          err instanceof ApiError ? err.message : 'Unable to load countries.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [countriesReloadToken])

  useEffect(() => {
    if (!selectedCountryId) {
      setGovernorates([])
      return
    }
    const controller = new AbortController()
    const requestId = ++governoratesRequestId.current
    setGovernoratesLoading(true)
    setGovernoratesError(null)

    void (async () => {
      try {
        const response = await getAdminCountryGovernorates(selectedCountryId, {
          signal: controller.signal,
        })
        if (requestId !== governoratesRequestId.current) return
        const rows = (response.data ?? []).map(mapApiGovernorateToRow)
        setGovernorates(rows)
        setGovernoratesLoading(false)
        setSelectedGovernorateId((previous) =>
          previous && rows.some((row) => row.id === previous)
            ? previous
            : rows[0]?.id ?? null,
        )
      } catch (err) {
        if (controller.signal.aborted || requestId !== governoratesRequestId.current)
          return
        if (isAbortError(err)) return
        setGovernoratesLoading(false)
        setGovernoratesError(
          err instanceof ApiError ? err.message : 'Unable to load governorates.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [selectedCountryId])

  useEffect(() => {
    if (!selectedGovernorateId) {
      setDistricts([])
      return
    }
    const controller = new AbortController()
    const requestId = ++districtsRequestId.current
    setDistrictsLoading(true)
    setDistrictsError(null)

    void (async () => {
      try {
        const response = await getAdminGovernorateDistricts(selectedGovernorateId, {
          signal: controller.signal,
        })
        if (requestId !== districtsRequestId.current) return
        setDistricts((response.data ?? []).map(mapApiDistrictToRow))
        setDistrictsLoading(false)
      } catch (err) {
        if (controller.signal.aborted || requestId !== districtsRequestId.current)
          return
        if (isAbortError(err)) return
        setDistrictsLoading(false)
        setDistrictsError(
          err instanceof ApiError ? err.message : 'Unable to load districts.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [selectedGovernorateId])

  const reloadCountries = useCallback(() => {
    setCountriesReloadToken((token) => token + 1)
  }, [])

  const selectCountry = useCallback((id: string) => {
    setSelectedCountryId(id)
    setSelectedGovernorateId(null)
    setDistricts([])
  }, [])

  const selectGovernorate = useCallback((id: string) => {
    setSelectedGovernorateId(id)
  }, [])

  const addCountry = useCallback(async (payload: CreateCountryPayload) => {
    setCountryMutating(true)
    setCountriesError(null)
    try {
      const response = await createAdminCountry(payload)
      const created = response.data
      if (!created) throw new ApiError(response.message || 'Unable to add country.')
      const row = mapApiCountryToRow(created)
      setCountries((previous) => [...previous, row])
      setSelectedCountryId(row.id)
      setCountryMutating(false)
      return true
    } catch (err) {
      setCountryMutating(false)
      setCountriesError(
        err instanceof ApiError ? err.message : 'Unable to add country.',
      )
      return false
    }
  }, [])

  const editCountry = useCallback(
    async (id: string, payload: UpdateCountryPayload) => {
      setCountryMutating(true)
      setCountriesError(null)
      try {
        const response = await updateAdminCountry(id, payload)
        const updated = response.data
        if (!updated)
          throw new ApiError(response.message || 'Unable to update country.')
        const row = mapApiCountryToRow(updated)
        setCountries((previous) =>
          previous.map((country) => (country.id === id ? row : country)),
        )
        setCountryMutating(false)
        return true
      } catch (err) {
        setCountryMutating(false)
        setCountriesError(
          err instanceof ApiError ? err.message : 'Unable to update country.',
        )
        return false
      }
    },
    [],
  )

  const removeCountry = useCallback(async (id: string) => {
    setCountryMutating(true)
    setCountriesError(null)
    try {
      await deleteAdminCountry(id)
      setCountries((previous) => previous.filter((country) => country.id !== id))
      setCountryMutating(false)
      setSelectedCountryId((previous) => (previous === id ? null : previous))
      return true
    } catch (err) {
      setCountryMutating(false)
      setCountriesError(
        err instanceof ApiError ? err.message : 'Unable to delete country.',
      )
      return false
    }
  }, [])

  const addGovernorate = useCallback(async (payload: CreateGovernoratePayload) => {
    setGovernorateMutating(true)
    setGovernoratesError(null)
    try {
      const response = await createAdminGovernorate(payload)
      const created = response.data
      if (!created)
        throw new ApiError(response.message || 'Unable to add governorate.')
      const row = mapApiGovernorateToRow(created)
      setGovernorates((previous) => [...previous, row])
      setSelectedGovernorateId(row.id)
      setGovernorateMutating(false)
      return true
    } catch (err) {
      setGovernorateMutating(false)
      setGovernoratesError(
        err instanceof ApiError ? err.message : 'Unable to add governorate.',
      )
      return false
    }
  }, [])

  const editGovernorate = useCallback(
    async (id: string, payload: UpdateGovernoratePayload) => {
      setGovernorateMutating(true)
      setGovernoratesError(null)
      try {
        const response = await updateAdminGovernorate(id, payload)
        const updated = response.data
        if (!updated)
          throw new ApiError(response.message || 'Unable to update governorate.')
        const row = mapApiGovernorateToRow(updated)
        setGovernorates((previous) =>
          previous.map((gov) => (gov.id === id ? row : gov)),
        )
        setGovernorateMutating(false)
        return true
      } catch (err) {
        setGovernorateMutating(false)
        setGovernoratesError(
          err instanceof ApiError ? err.message : 'Unable to update governorate.',
        )
        return false
      }
    },
    [],
  )

  const removeGovernorate = useCallback(async (id: string) => {
    setGovernorateMutating(true)
    setGovernoratesError(null)
    try {
      await deleteAdminGovernorate(id)
      setGovernorates((previous) => previous.filter((gov) => gov.id !== id))
      setGovernorateMutating(false)
      setSelectedGovernorateId((previous) => (previous === id ? null : previous))
      return true
    } catch (err) {
      setGovernorateMutating(false)
      setGovernoratesError(
        err instanceof ApiError ? err.message : 'Unable to delete governorate.',
      )
      return false
    }
  }, [])

  const addDistrict = useCallback(async (payload: CreateDistrictPayload) => {
    setDistrictMutating(true)
    setDistrictsError(null)
    try {
      const response = await createAdminDistrict(payload)
      const created = response.data
      if (!created) throw new ApiError(response.message || 'Unable to add district.')
      setDistricts((previous) => [...previous, mapApiDistrictToRow(created)])
      setDistrictMutating(false)
      return true
    } catch (err) {
      setDistrictMutating(false)
      setDistrictsError(
        err instanceof ApiError ? err.message : 'Unable to add district.',
      )
      return false
    }
  }, [])

  const editDistrict = useCallback(
    async (id: string, payload: UpdateDistrictPayload) => {
      setDistrictMutating(true)
      setDistrictsError(null)
      try {
        const response = await updateAdminDistrict(id, payload)
        const updated = response.data
        if (!updated)
          throw new ApiError(response.message || 'Unable to update district.')
        const row = mapApiDistrictToRow(updated)
        setDistricts((previous) =>
          previous.map((district) => (district.id === id ? row : district)),
        )
        setDistrictMutating(false)
        return true
      } catch (err) {
        setDistrictMutating(false)
        setDistrictsError(
          err instanceof ApiError ? err.message : 'Unable to update district.',
        )
        return false
      }
    },
    [],
  )

  const removeDistrict = useCallback(async (id: string) => {
    setDistrictMutating(true)
    setDistrictsError(null)
    try {
      await deleteAdminDistrict(id)
      setDistricts((previous) => previous.filter((district) => district.id !== id))
      setDistrictMutating(false)
      return true
    } catch (err) {
      setDistrictMutating(false)
      setDistrictsError(
        err instanceof ApiError ? err.message : 'Unable to delete district.',
      )
      return false
    }
  }, [])

  return {
    countries,
    countriesLoading,
    countriesError,
    countryMutating,
    reloadCountries,
    selectedCountryId,
    selectCountry,
    addCountry,
    editCountry,
    removeCountry,
    governorates,
    governoratesLoading,
    governoratesError,
    governorateMutating,
    selectedGovernorateId,
    selectGovernorate,
    addGovernorate,
    editGovernorate,
    removeGovernorate,
    districts,
    districtsLoading,
    districtsError,
    districtMutating,
    addDistrict,
    editDistrict,
    removeDistrict,
  }
}
