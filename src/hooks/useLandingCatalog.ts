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
        const [productsResponse, categoriesResponse, brandsResponse, bestSellersResponse] =
          await Promise.all([
            getProducts({ limit: 100 }),
            getCategories({ limit: 100 }),
            getBrands({ limit: 100 }),
            getProducts({ isBestSeller: true, limit: 5 }),
          ])

        if (cancelled) return

        const products = productsResponse.data ?? []
        const bestSellerProducts = bestSellersResponse.data ?? []

        setState({
          loading: false,
          error: null,
          products,
          categories: categoriesResponse.data ?? [],
          brands: brandsResponse.data ?? [],
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
