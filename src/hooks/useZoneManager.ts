// src/hooks/useZoneManager.ts
import { isAbortError } from '../lib/isAbortError'
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
  const selectedCountryIdRef = useRef<string | null>(null)
  const selectedGovernorateIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedCountryIdRef.current = selectedCountryId
  }, [selectedCountryId])

  useEffect(() => {
    selectedGovernorateIdRef.current = selectedGovernorateId
  }, [selectedGovernorateId])

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

        // Never auto-select a country — only keep a prior user selection if it
        // still exists after refetch; otherwise clear nested selection.
        const previousCountryId = selectedCountryIdRef.current
        const nextCountryId =
          previousCountryId && rows.some((row) => row.id === previousCountryId)
            ? previousCountryId
            : null

        if (nextCountryId !== previousCountryId) {
          setSelectedGovernorateId(null)
          setGovernorates([])
          setDistricts([])
          setDistrictsError(null)
        }

        selectedCountryIdRef.current = nextCountryId
        setSelectedCountryId(nextCountryId)
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
      setGovernoratesLoading(false)
      setGovernoratesError(null)
      setSelectedGovernorateId(null)
      setDistricts([])
      setDistrictsLoading(false)
      setDistrictsError(null)
      return
    }

    const controller = new AbortController()
    const requestId = ++governoratesRequestId.current
    // Country changed — clear child selection immediately so districts never show
    // from a previous country's governorate while the new list loads.
    setSelectedGovernorateId(null)
    setDistricts([])
    setDistrictsError(null)
    setGovernoratesLoading(true)
    setGovernoratesError(null)

    void (async () => {
      try {
        const response = await getAdminCountryGovernorates(selectedCountryId, {
          signal: controller.signal,
        })
        if (requestId !== governoratesRequestId.current) return
        setGovernorates((response.data ?? []).map(mapApiGovernorateToRow))
        setGovernoratesLoading(false)
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
      setDistrictsLoading(false)
      setDistrictsError(null)
      return
    }

    const controller = new AbortController()
    const requestId = ++districtsRequestId.current
    setDistricts([])
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
    if (selectedCountryIdRef.current === id) {
      // Same country: still clear child selection so districts stay empty until
      // a governorate is chosen again.
      setSelectedGovernorateId(null)
      setDistricts([])
      setDistrictsError(null)
      return
    }
    setSelectedCountryId(id)
    setSelectedGovernorateId(null)
    setGovernorates([])
    setDistricts([])
    setDistrictsError(null)
  }, [])

  const selectGovernorate = useCallback((id: string) => {
    if (selectedGovernorateIdRef.current === id) return
    setSelectedGovernorateId(id)
    setDistricts([])
    setDistrictsError(null)
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
      setSelectedGovernorateId(null)
      setGovernorates([])
      setDistricts([])
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
      if (selectedCountryIdRef.current === id) {
        selectedCountryIdRef.current = null
        setSelectedCountryId(null)
        setSelectedGovernorateId(null)
        setGovernorates([])
        setDistricts([])
      }
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
      setDistricts([])
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
      if (selectedGovernorateIdRef.current === id) {
        selectedGovernorateIdRef.current = null
        setSelectedGovernorateId(null)
        setDistricts([])
      }
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
