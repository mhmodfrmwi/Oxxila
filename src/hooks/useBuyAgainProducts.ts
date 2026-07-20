// src/hooks/useBuyAgainProducts.ts
import { useEffect, useState } from 'react'
import { getRecommendations } from '../api/users'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { useAuth } from '../context/AuthContext'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

export function useBuyAgainProducts() {
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
        const response = await getRecommendations()
        if (cancelled) return
        setProducts((response.data ?? []).map(mapApiProductToRecommendedProduct))
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
  }, [isAuthenticated])

  return {
    enabled: isAuthenticated,
    products: isAuthenticated ? products : [],
    loading: isAuthenticated ? loading : false,
  }
}
