// src/hooks/useBrowsingHistory.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getProductsByIds } from '../api/catalog'
import { getBrowsingHistory } from '../api/users'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { useAuth } from '../context/AuthContext'
import { readGuestHistoryIds } from '../utils/guestBrowsingHistory'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

/**
 * Recently viewed products. Signed-in users read the server history; guests use
 * ids kept in localStorage (hydrated through the public `/products/by-ids`).
 */
export function useBrowsingHistory(limit = 6) {
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const language = i18n.language
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const apiProducts = isAuthenticated
          ? ((await getBrowsingHistory()).data ?? [])
              .map((entry) => entry.product)
              .filter(
                (product): product is NonNullable<typeof product> =>
                  Boolean(product) && product.isActive !== false,
              )
          : await (async () => {
              const ids = readGuestHistoryIds()
              return ids.length ? ((await getProductsByIds(ids.slice(0, limit))).data ?? []) : []
            })()
        if (cancelled) return
        setProducts(
          apiProducts.slice(0, limit).map((product) => mapApiProductToRecommendedProduct(product, language)),
        )
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
  }, [isAuthenticated, limit, language])

  return { enabled: true, products, loading }
}
