// src/hooks/useGiftCards.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getMyGiftCards, type ApiGiftCardTransaction } from '../api/giftCards'
import { useAuth } from '../context/AuthContext'

export function useGiftCards() {
  const { isAuthenticated } = useAuth()
  const [balance, setBalance] = useState(0)
  const [currency, setCurrency] = useState('EGP')
  const [transactions, setTransactions] = useState<ApiGiftCardTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(0)
      setTransactions([])
      setError(null)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    try {
      const response = await getMyGiftCards()
      if (requestId !== requestIdRef.current) return

      const data = response.data
      setBalance(data?.balance ?? 0)
      setCurrency(data?.currency ?? 'EGP')
      setTransactions(data?.transactions ?? [])
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err instanceof Error ? err.message : 'Unable to load gift cards.')
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    balance,
    currency,
    transactions,
    loading,
    error,
    refresh,
  }
}
