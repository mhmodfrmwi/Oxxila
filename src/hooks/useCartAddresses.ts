// src/hooks/useCartAddresses.ts
import { useEffect, useState } from 'react'
import { getMyAddresses, type UserAddress } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export function useCartAddresses() {
  const { isAuthenticated } = useAuth()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      try {
        const response = await getMyAddresses()
        if (!cancelled) setAddresses(response.data?.addresses ?? [])
      } catch (error) {
        if (!cancelled && !(error instanceof ApiError && error.statusCode === 401)) {
          setAddresses([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const resolvedAddresses = isAuthenticated ? addresses : []

  return {
    addresses: resolvedAddresses,
    loading: isAuthenticated ? loading : false,
    primaryAddress: resolvedAddresses[0] ?? null,
  }
}
