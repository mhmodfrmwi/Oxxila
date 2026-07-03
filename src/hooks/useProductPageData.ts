// src/hooks/useProductPageData.ts
import { useEffect, useRef, useState } from 'react'
import { getProductFaqs, getProductReviewStats, getProductReviews, getProducts } from '../api/catalog'
import type { ReviewsSectionProps } from '../components/product/reviews/types'
import type { FAQItem } from '../components/product/QuestionsSafetySection'
import type { ProductDetail } from '../types/productDetail'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { useLandingCatalogContext } from './useLandingCatalogContext'
import {
  buildMoreFromBrandProducts,
  buildReviewsSectionData,
  buildReviewsSectionDataFromStats,
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
  faqs: FAQItem[]
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
  faqs: [],
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
  const { isAuthenticated } = useAuth()
  const catalogProductsRef = useRef(catalogProducts)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<ProductPageErrorKind>(null)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
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
      setFaqs([])
      setReviewsData(emptyReviewsData)
      setMoreFromBrandProducts([])

      try {
        const apiProduct = await resolveProductBySlug(normalizedSlug, {
          seedProducts: catalogProductsRef.current,
          auth: isAuthenticated,
        })
        if (cancelled) return

        const mappedProduct = mapApiProductToProductDetail(apiProduct)
        setProduct(mappedProduct)
        setLoading(false)

        const brandId = apiProduct.brand?._id
        if (brandId) {
          try {
            const brandProductsResponse = await getProducts({ brand: brandId, limit: 20 })
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
          const [statsResponse, reviewsResponse] = await Promise.all([
            getProductReviewStats(apiProduct._id),
            getProductReviews(apiProduct._id, { limit: 10, sort: '-createdAt' }),
          ])
          if (cancelled) return

          const stats = statsResponse.data
          setReviewsData({
            ...(stats
              ? buildReviewsSectionDataFromStats(stats, reviewsResponse.data ?? [])
              : buildReviewsSectionData(
                  mappedProduct.rating,
                  mappedProduct.reviewCount,
                  reviewsResponse.data ?? [],
                )),
            reviewsTotalDocuments: stats?.ratingsQuantity ?? reviewsResponse.pagination?.totalDocuments,
          })
        } catch {
          if (cancelled) return
          setReviewsData({
            ...buildReviewsSectionData(mappedProduct.rating, mappedProduct.reviewCount, []),
            reviewsTotalDocuments: mappedProduct.reviewCount,
          })
        }

        try {
          const faqsResponse = await getProductFaqs(apiProduct._id)
          if (!cancelled) {
            setFaqs(
              (faqsResponse.data ?? []).map((faq) => ({
                question: faq.question,
                answer: faq.answer,
              })),
            )
          }
        } catch {
          if (!cancelled) setFaqs([])
        }
      } catch (loadError) {
        if (cancelled) return
        const resolved = resolveError(loadError)
        setProduct(null)
        setFaqs([])
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
  }, [normalizedSlug, isAuthenticated])

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
    faqs,
    reviewsData,
    moreFromBrandProducts,
  }
}
