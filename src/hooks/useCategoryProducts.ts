// src/hooks/useCategoryProducts.ts
import { useEffect, useState } from 'react'
import { getProducts } from '../api/catalog'
import type { SortOption } from '../components/category/categoryData'
import type { FilterState } from '../components/category/filters/filterState'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import { applyClientOnlyFilters, buildProductQueryParams } from '../utils/productQueryParams'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'

export interface CategoryProductsState {
  loading: boolean
  error: string | null
  products: RecommendedProduct[]
  pagination: ApiPagination | null
}

const emptyState: CategoryProductsState = {
  loading: true,
  error: null,
  products: [],
  pagination: null,
}

export function useCategoryProducts(
  categoryId: string | undefined,
  filters: FilterState,
  sort: SortOption,
  page: number,
  limit: number,
) {
  const [state, setState] = useState<CategoryProductsState>(emptyState)

  useEffect(() => {
    if (!categoryId) {
      setState({ ...emptyState, loading: false })
      return
    }

    let cancelled = false

    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }))

      try {
        const response = await getProducts(
          buildProductQueryParams(filters, sort, { categoryId, page, limit }),
        )

        if (cancelled) return

        const apiProducts = applyClientOnlyFilters(response.data ?? [], filters)
        setState({
          loading: false,
          error: null,
          products: apiProducts.map(mapApiProductToRecommendedProduct),
          pagination: response.pagination ?? null,
        })
      } catch (error) {
        if (cancelled) return
        setState({
          loading: false,
          error: error instanceof ApiError ? error.message : 'Unable to load products.',
          products: [],
          pagination: null,
        })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [categoryId, filters, sort, page, limit])

  return state
}
