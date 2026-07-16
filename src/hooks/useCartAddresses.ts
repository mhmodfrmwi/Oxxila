// src/hooks/useCartAddresses.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getMyAddresses, type UserAddress } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { findDefaultAddress } from '../utils/userAddress'

export function useCartAddresses() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([])
      setSelectedAddressId(null)
      setLoadError(null)
      return [] as UserAddress[]
    }

    setLoading(true)
    setLoadError(null)
    try {
      const response = await getMyAddresses()
      const next = response.data?.addresses ?? []
      setAddresses(next)
      setLoadError(null)

      setSelectedAddressId((current) => {
        if (current && next.some((entry) => entry._id === current)) return current
        return findDefaultAddress(next)?._id ?? null
      })

      return next
    } catch (error) {
      if (!(error instanceof ApiError && error.statusCode === 401)) {
        setAddresses([])
        setSelectedAddressId(null)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : t('profile.addresses.loadFailed'),
        )
      }
      throw error
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, t])

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([])
      setSelectedAddressId(null)
      setLoadError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const response = await getMyAddresses()
        if (cancelled) return

        const next = response.data?.addresses ?? []
        setAddresses(next)
        setLoadError(null)
        setSelectedAddressId((current) => {
          if (current && next.some((entry) => entry._id === current)) return current
          return findDefaultAddress(next)?._id ?? null
        })
      } catch (error) {
        if (cancelled) return
        if (!(error instanceof ApiError && error.statusCode === 401)) {
          setAddresses([])
          setSelectedAddressId(null)
          setLoadError(
            error instanceof ApiError
              ? error.message
              : t('profile.addresses.loadFailed'),
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, t])

  const resolvedAddresses = useMemo(
    () => (isAuthenticated ? addresses : []),
    [isAuthenticated, addresses],
  )

  const selectedAddress = useMemo(
    () => resolvedAddresses.find((entry) => entry._id === selectedAddressId) ?? null,
    [resolvedAddresses, selectedAddressId],
  )

  const primaryAddress = useMemo(
    () => findDefaultAddress(resolvedAddresses),
    [resolvedAddresses],
  )

  return {
    addresses: resolvedAddresses,
    loading: isAuthenticated ? loading : false,
    loadError: isAuthenticated ? loadError : null,
    selectedAddressId,
    setSelectedAddressId,
    selectedAddress,
    primaryAddress,
    refreshAddresses,
  }
}
