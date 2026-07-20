// src/hooks/useCollectionProducts.ts
import { useEffect, useState } from 'react'
import { getProducts } from '../api/catalog'
import type { CollectionConfig } from '../config/collections'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'
import { sortOptionToApiSort } from '../utils/productQueryParams'
import type { SortOption } from '../components/category/categoryData'

export interface CollectionProductsState {
  loading: boolean
  error: string | null
  products: RecommendedProduct[]
  pagination: ApiPagination | null
}

export function useCollectionProducts(
  config: CollectionConfig | null,
  sort: SortOption,
  page: number,
  limit: number,
): CollectionProductsState {
  const [state, setState] = useState<CollectionProductsState>({
    loading: true,
    error: null,
    products: [],
    pagination: null,
  })

  useEffect(() => {
    if (!config) return

    let cancelled = false
    const activeConfig = config

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))

      try {
        const response = await getProducts({
          ...activeConfig.query,
          page,
          limit,
          sort: sortOptionToApiSort(sort),
        })

        if (cancelled) return

        setState({
          loading: false,
          error: null,
          products: (response.data ?? []).map(mapApiProductToRecommendedProduct),
          pagination: response.pagination ?? null,
        })
      } catch (error) {
        if (cancelled) return
        setState({
          loading: false,
          error: error instanceof ApiError ? error.message : 'Unable to load collection.',
          products: [],
          pagination: null,
        })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [config, sort, page, limit])

  return state
}
