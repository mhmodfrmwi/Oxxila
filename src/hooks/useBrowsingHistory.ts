// src/hooks/useBrowsingHistory.ts
import { useEffect, useState } from 'react'
import { getBrowsingHistory } from '../api/users'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { useAuth } from '../context/AuthContext'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

/**
 * Browsing history for authenticated users only.
 * Guests never trigger `/users/browsing-history`.
 */
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

    async function load() {
      setLoading(true)
      try {
        const response = await getBrowsingHistory()
        if (cancelled) return

        const mapped = (response.data ?? [])
          .map((entry) => entry.product)
          .filter(Boolean)
          .slice(0, limit)
          .map(mapApiProductToRecommendedProduct)

        setProducts(mapped)
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, limit])

  return {
    /** False for guests — UI should not render browsing sections. */
    enabled: isAuthenticated,
    products: isAuthenticated ? products : [],
    loading: isAuthenticated ? loading : false,
  }
}
