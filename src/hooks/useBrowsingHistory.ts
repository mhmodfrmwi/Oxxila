// src/hooks/useBrowsingHistory.ts
import { useEffect, useState } from 'react'
import { getBrowsingHistory } from '../api/users'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

export function useBrowsingHistory(limit = 6) {
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setProducts([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function load() {
      try {
        const response = await getBrowsingHistory()
        if (cancelled) return

        const mapped = (response.data ?? [])
          .map((entry) => entry.product)
          .filter(Boolean)
          .slice(0, limit)
          .map(mapApiProductToRecommendedProduct)

        setProducts(mapped)
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.statusCode === 401) {
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, limit])

  return { products, loading }
}
