import { useEffect, useState } from 'react'
import { getBrands, getCategories, getProducts } from '../api/catalog'
import type { BestSellerProduct } from '../components/landing/best-seller/ProductCard'
import { ApiError } from '../lib/api'
import {
  buildBestSellers,
  buildFeaturedImages,
  buildSkinConcerns,
} from '../utils/catalogMappers'
import type { ApiBrand, ApiCategory, ApiProduct, FeaturedImage, SkinConcernDisplay } from '../types/catalog'

export interface LandingCatalogState {
  loading: boolean
  error: string | null
  products: ApiProduct[]
  categories: ApiCategory[]
  brands: ApiBrand[]
  bestSellers: BestSellerProduct[]
  skinConcerns: SkinConcernDisplay[]
  featuredImages: FeaturedImage[]
}

const initialState: LandingCatalogState = {
  loading: true,
  error: null,
  products: [],
  categories: [],
  brands: [],
  bestSellers: [],
  skinConcerns: [],
  featuredImages: [],
}

export function useLandingCatalog(): LandingCatalogState {
  const [state, setState] = useState<LandingCatalogState>(initialState)

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        // Independent requests: one slow/failed call must not blank the others (e.g. brands).
        const results = await Promise.allSettled([
          getProducts({ limit: 100 }),
          getCategories({ limit: 100 }),
          getBrands({ limit: 100 }),
          getProducts({ isBestSeller: true, limit: 5 }),
        ])

        if (cancelled) return

        const failed = results.filter((result) => result.status === 'rejected')
        if (failed.length === results.length) throw (failed[0] as PromiseRejectedResult).reason

        const [productsResult, categoriesResult, brandsResult, bestSellersResult] = results
        const products = productsResult.status === 'fulfilled' ? (productsResult.value.data ?? []) : []
        const bestSellerProducts =
          bestSellersResult.status === 'fulfilled' ? (bestSellersResult.value.data ?? []) : []

        setState({
          loading: false,
          error: null,
          products,
          categories: categoriesResult.status === 'fulfilled' ? (categoriesResult.value.data ?? []) : [],
          brands: brandsResult.status === 'fulfilled' ? (brandsResult.value.data ?? []) : [],
          bestSellers: buildBestSellers(bestSellerProducts.length > 0 ? bestSellerProducts : products),
          skinConcerns: buildSkinConcerns(),
          featuredImages: buildFeaturedImages(products),
        })
      } catch (error) {
        if (cancelled) return

        setState({
          loading: false,
          error: error instanceof ApiError ? error.message : 'Unable to load store data.',
          products: [],
          categories: [],
          brands: [],
          bestSellers: buildBestSellers([]),
          skinConcerns: buildSkinConcerns(),
          featuredImages: buildFeaturedImages([]),
        })
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
