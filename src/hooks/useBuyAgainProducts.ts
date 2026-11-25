// src/hooks/useBuyAgainProducts.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRecommendations } from '../api/users'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { useAuth } from '../context/AuthContext'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

export function useBuyAgainProducts() {
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const language = i18n.language
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
        setProducts((response.data ?? []).map((product) => mapApiProductToRecommendedProduct(product, language)))
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
  }, [isAuthenticated, language])

  return {
    enabled: isAuthenticated,
    products: isAuthenticated ? products : [],
    loading: isAuthenticated ? loading : false,
  }
}
