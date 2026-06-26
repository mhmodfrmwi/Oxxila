import { useEffect, useState } from 'react'
import { getProducts } from '../api/catalog'
import type { BestSellerProduct } from '../components/landing/best-seller/ProductCard'
import { ApiError } from '../lib/api'
import {
  buildBestSellers,
  buildFeaturedImages,
  buildSkinConcerns,
} from '../utils/catalogMappers'
import type { ApiProduct, FeaturedImage, SkinConcernDisplay } from '../types/catalog'

export interface LandingCatalogState {
  loading: boolean
  error: string | null
  products: ApiProduct[]
  bestSellers: BestSellerProduct[]
  skinConcerns: SkinConcernDisplay[]
  featuredImages: FeaturedImage[]
}

const initialState: LandingCatalogState = {
  loading: true,
  error: null,
  products: [],
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
        const productsResponse = await getProducts({ limit: 100 })

        if (cancelled) return

        const products = productsResponse.data ?? []

        setState({
          loading: false,
          error: null,
          products,
          bestSellers: buildBestSellers(products),
          skinConcerns: buildSkinConcerns(products),
          featuredImages: buildFeaturedImages(products),
        })
      } catch (error) {
        if (cancelled) return

        setState({
          loading: false,
          error: error instanceof ApiError ? error.message : 'Unable to load store data.',
          products: [],
          bestSellers: buildBestSellers([]),
          skinConcerns: buildSkinConcerns([]),
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
