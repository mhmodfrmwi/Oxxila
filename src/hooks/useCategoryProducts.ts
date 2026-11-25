// src/hooks/useCategoryProducts.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getProducts } from '../api/catalog'
import type { SortOption } from '../components/category/categoryData'
import { getFiltersQueryKey, type FilterState } from '../components/category/filters/filterState'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type { ApiProduct } from '../types/catalog'
import { requiresClientProductFilter } from '../utils/categoryBrowseParams'
import {
  applyClientOnlyFilters,
  buildProductQueryParams,
} from '../utils/productQueryParams'
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

const CLIENT_FILTER_PAGE_SIZE = 100
const CLIENT_FILTER_MAX_PAGES = 20

async function fetchAllMatchingProducts(
  baseParams: ReturnType<typeof buildProductQueryParams>,
): Promise<ApiProduct[]> {
  const collected: ApiProduct[] = []
  let page = 1
  let totalPages: number

  do {
    const response = await getProducts({
      ...baseParams,
      page,
      limit: CLIENT_FILTER_PAGE_SIZE,
    })
    collected.push(...(response.data ?? []))
    totalPages = Math.min(
      response.pagination?.numberOfPages ?? 1,
      CLIENT_FILTER_MAX_PAGES,
    )
    page += 1
  } while (page <= totalPages)

  return collected
}

function buildClientPagination(
  totalDocuments: number,
  page: number,
  limit: number,
): ApiPagination {
  const numberOfPages = Math.max(1, Math.ceil(totalDocuments / limit) || 1)
  const safePage = Math.min(Math.max(1, page), numberOfPages)
  return {
    currentPage: safePage,
    limit,
    numberOfPages,
    totalDocuments,
    nextPage: safePage < numberOfPages ? safePage + 1 : null,
    prevPage: safePage > 1 ? safePage - 1 : null,
    results: Math.min(limit, Math.max(0, totalDocuments - (safePage - 1) * limit)),
  }
}

export function useCategoryProducts(
  categoryId: string | undefined,
  filters: FilterState,
  sort: SortOption,
  page: number,
  limit: number,
  options?: {
    /** When false, skip fetch (e.g. waiting for catalog to resolve a category slug). */
    enabled?: boolean
    isCertified?: boolean
  },
) {
  const { i18n } = useTranslation()
  const [state, setState] = useState<CategoryProductsState>(emptyState)
  const filtersKey = getFiltersQueryKey(filters)
  const enabled = options?.enabled !== false
  const isCertified = options?.isCertified === true
  const clientFilter = requiresClientProductFilter(filters)
  const locale = i18n.language

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const queryParams = buildProductQueryParams(filters, sort, {
      categoryId,
      page: clientFilter ? 1 : page,
      limit: clientFilter ? CLIENT_FILTER_PAGE_SIZE : limit,
      isCertified: isCertified || undefined,
    })

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setState((previous) => ({ ...previous, loading: true, error: null }))

      try {
        if (clientFilter) {
          const allProducts = await fetchAllMatchingProducts(queryParams)
          if (cancelled) return

          const filtered = applyClientOnlyFilters(allProducts, filters)
          const pagination = buildClientPagination(filtered.length, page, limit)
          const start = (pagination.currentPage - 1) * limit
          const pageSlice = filtered.slice(start, start + limit)

          setState({
            loading: false,
            error: null,
            products: pageSlice.map((product) =>
              mapApiProductToRecommendedProduct(product, locale),
            ),
            pagination,
          })
          return
        }

        const response = await getProducts(queryParams)
        if (cancelled) return

        setState({
          loading: false,
          error: null,
          products: (response.data ?? []).map((product) =>
            mapApiProductToRecommendedProduct(product, locale),
          ),
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
  }, [
    categoryId,
    filtersKey,
    sort,
    page,
    limit,
    enabled,
    isCertified,
    clientFilter,
    filters,
    locale,
  ])

  return state
}
