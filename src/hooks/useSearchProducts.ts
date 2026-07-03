// src/hooks/useSearchProducts.ts
import { useEffect, useState } from 'react'
import { getProducts } from '../api/catalog'
import type { SortOption } from '../components/category/categoryData'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import { sortOptionToApiSort } from '../utils/productQueryParams'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

export function useSearchProducts(keyword: string, sort: SortOption, page: number, limit = 12) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)

  useEffect(() => {
    const trimmed = keyword.trim()
    if (!trimmed) {
      setProducts([])
      setPagination(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const response = await getProducts({
          keyword: trimmed,
          page,
          limit,
          sort: sortOptionToApiSort(sort),
        })

        if (cancelled) return

        setProducts((response.data ?? []).map(mapApiProductToRecommendedProduct))
        setPagination(response.pagination ?? null)
      } catch (loadError) {
        if (cancelled) return
        setError(loadError instanceof ApiError ? loadError.message : 'Search failed.')
        setProducts([])
        setPagination(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [keyword, sort, page, limit])

  return { loading, error, products, pagination }
}
