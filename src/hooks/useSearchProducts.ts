// src/hooks/useSearchProducts.ts
import { useEffect, useState } from 'react'
import { getProducts } from '../api/catalog'
import type { SortOption } from '../components/category/categoryData'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import { sortOptionToApiSort } from '../utils/productQueryParams'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

export interface SearchProductsQuery {
  keyword?: string
  brandId?: string
  concerns?: string
  sort: SortOption
  page: number
  limit?: number
}

const emptySearchResult = {
  loading: false,
  error: null as string | null,
  products: [] as RecommendedProduct[],
  pagination: null as ApiPagination | null,
}

export function useSearchProducts({
  keyword = '',
  brandId = '',
  concerns = '',
  sort,
  page,
  limit = 12,
}: SearchProductsQuery) {
  const trimmedKeyword = keyword.trim()
  const trimmedBrand = brandId.trim()
  const trimmedConcerns = concerns.trim()
  const hasQuery = Boolean(trimmedKeyword || trimmedBrand || trimmedConcerns)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)

  useEffect(() => {
    if (!hasQuery) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setError(null)
      try {
        const response = await getProducts({
          ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
          ...(trimmedBrand ? { brand: trimmedBrand } : {}),
          ...(trimmedConcerns ? { concerns: trimmedConcerns } : {}),
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
  }, [hasQuery, trimmedKeyword, trimmedBrand, trimmedConcerns, sort, page, limit])

  if (!hasQuery) {
    return emptySearchResult
  }

  return { loading, error, products, pagination }
}
