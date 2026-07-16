// src/hooks/useCartAddresses.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMyAddresses, type UserAddress } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { findDefaultAddress } from '../utils/userAddress'

export function useCartAddresses() {
  const { isAuthenticated } = useAuth()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([])
      setSelectedAddressId(null)
      return [] as UserAddress[]
    }

    const response = await getMyAddresses()
    const next = response.data?.addresses ?? []
    setAddresses(next)

    setSelectedAddressId((current) => {
      if (current && next.some((entry) => entry._id === current)) return current
      return findDefaultAddress(next)?._id ?? null
    })

    return next
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      try {
        await refreshAddresses()
      } catch (error) {
        if (!cancelled && !(error instanceof ApiError && error.statusCode === 401)) {
          setAddresses([])
          setSelectedAddressId(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, refreshAddresses])

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
    selectedAddressId,
    setSelectedAddressId,
    selectedAddress,
    primaryAddress,
    refreshAddresses,
  }
}
