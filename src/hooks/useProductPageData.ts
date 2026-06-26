import { useEffect, useRef, useState } from 'react'
import { getProductReviews, getProducts } from '../api/catalog'
import type { ReviewsSectionProps } from '../components/product/reviews/types'
import type { ProductDetail } from '../types/productDetail'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { ApiError } from '../lib/api'
import { useLandingCatalogContext } from './useLandingCatalogContext'
import {
  buildMoreFromBrandProducts,
  buildReviewsSectionData,
  mapApiProductToProductDetail,
} from '../utils/productDetailMappers'
import { resolveProductBySlug } from '../utils/resolveProductBySlug'

export type ProductPageErrorKind = 'not_found' | 'load_failed' | null

export interface ProductPageDataState {
  loading: boolean
  reviewsLoading: boolean
  error: string | null
  errorKind: ProductPageErrorKind
  product: ProductDetail | null
  brandName: string
  reviewsData: Pick<
    ReviewsSectionProps,
    'averageRating' | 'totalReviews' | 'distribution' | 'reviews' | 'reviewsTotalDocuments'
  >
  moreFromBrandProducts: RecommendedProduct[]
}

const emptyReviewsData: ProductPageDataState['reviewsData'] = {
  averageRating: 0,
  totalReviews: 0,
  distribution: [
    { stars: 5, percentage: 0 },
    { stars: 4, percentage: 0 },
    { stars: 3, percentage: 0 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 },
  ],
  reviews: [],
}

const missingSlugState: ProductPageDataState = {
  loading: false,
  reviewsLoading: false,
  error: 'Product not found.',
  errorKind: 'not_found',
  product: null,
  brandName: '',
  reviewsData: emptyReviewsData,
  moreFromBrandProducts: [],
}

function resolveError(error: unknown): { message: string; kind: ProductPageErrorKind } {
  if (error instanceof ApiError) {
    const isNotFound =
      error.statusCode === 404 ||
      /not found|invalid id/i.test(error.message)

    if (isNotFound) {
      return { message: 'Product not found.', kind: 'not_found' }
    }

    return { message: error.message, kind: 'load_failed' }
  }

  return { message: 'Unable to load product details.', kind: 'load_failed' }
}

export function useProductPageData(slug: string | undefined): ProductPageDataState {
  const normalizedSlug = slug?.trim() ?? ''
  const { products: catalogProducts } = useLandingCatalogContext()
  const catalogProductsRef = useRef(catalogProducts)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<ProductPageErrorKind>(null)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [reviewsData, setReviewsData] = useState(emptyReviewsData)
  const [moreFromBrandProducts, setMoreFromBrandProducts] = useState<RecommendedProduct[]>([])

  useEffect(() => {
    catalogProductsRef.current = catalogProducts
  }, [catalogProducts])

  useEffect(() => {
    if (!normalizedSlug) return

    let cancelled = false

    async function loadProductPage() {
      setLoading(true)
      setReviewsLoading(true)
      setError(null)
      setErrorKind(null)
      setProduct(null)
      setReviewsData(emptyReviewsData)
      setMoreFromBrandProducts([])

      try {
        const apiProduct = await resolveProductBySlug(normalizedSlug, {
          seedProducts: catalogProductsRef.current,
        })
        if (cancelled) return

        const mappedProduct = mapApiProductToProductDetail(apiProduct)
        setProduct(mappedProduct)
        setLoading(false)

        const brandSlug = apiProduct.brand?.slug
        if (brandSlug) {
          try {
            const brandProductsResponse = await getProducts({ brand: brandSlug, limit: 20 })
            if (!cancelled) {
              setMoreFromBrandProducts(
                buildMoreFromBrandProducts(brandProductsResponse.data ?? [], apiProduct._id),
              )
            }
          } catch {
            if (!cancelled) setMoreFromBrandProducts([])
          }
        }

        try {
          const reviewsResponse = await getProductReviews(apiProduct._id, { limit: 10 })
          if (cancelled) return

          setReviewsData({
            ...buildReviewsSectionData(
              mappedProduct.rating,
              mappedProduct.reviewCount,
              reviewsResponse.data ?? [],
            ),
            reviewsTotalDocuments: reviewsResponse.pagination?.totalDocuments,
          })
        } catch {
          if (cancelled) return
          setReviewsData({
            ...buildReviewsSectionData(mappedProduct.rating, mappedProduct.reviewCount, []),
            reviewsTotalDocuments: undefined,
          })
        }
      } catch (loadError) {
        if (cancelled) return
        const resolved = resolveError(loadError)
        setProduct(null)
        setMoreFromBrandProducts([])
        setReviewsData(emptyReviewsData)
        setError(resolved.message)
        setErrorKind(resolved.kind)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setReviewsLoading(false)
        }
      }
    }

    void loadProductPage()

    return () => {
      cancelled = true
    }
  }, [normalizedSlug])

  if (!normalizedSlug) {
    return missingSlugState
  }

  return {
    loading,
    reviewsLoading,
    error,
    errorKind,
    product,
    brandName: product?.brand ?? '',
    reviewsData,
    moreFromBrandProducts,
  }
}
