// src/hooks/useProductPageData.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getProductFaqs,
  getProductReviewStats,
  getProductReviews,
  getProducts,
  getRelatedProducts,
} from '../api/catalog'
import type { ReviewsSectionProps } from '../components/product/reviews/types'
import type { FAQItem } from '../components/product/QuestionsSafetySection'
import type { ProductDetail } from '../types/productDetail'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import type { ApiProduct, ApiReview } from '../types/catalog'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { useLandingCatalogContext } from './useLandingCatalogContext'
import {
  buildMoreFromBrandProducts,
  buildReconciledReviewsSectionData,
  mapApiProductToProductDetail,
  mapApiProductToRecommendedProduct,
} from '../utils/productDetailMappers'
import { recordGuestView } from '../utils/guestBrowsingHistory'
import { resolveProductBySlug } from '../utils/resolveProductBySlug'

export type ProductPageErrorKind = 'not_found' | 'load_failed' | null

const REVIEWS_PAGE_SIZE = 10

export interface ProductPageDataState {
  loading: boolean
  reviewsLoading: boolean
  reviewsLoadingMore: boolean
  reviewsError: string | null
  faqsError: string | null
  error: string | null
  errorKind: ProductPageErrorKind
  product: ProductDetail | null
  productId: string | null
  brandName: string
  faqs: FAQItem[]
  reviewsData: Pick<
    ReviewsSectionProps,
    'averageRating' | 'totalReviews' | 'distribution' | 'reviews' | 'reviewsTotalDocuments'
  >
  moreFromBrandProducts: RecommendedProduct[]
  /** Server-ranked "you may also like" for this product (same concerns / sub-category first). */
  relatedProducts: RecommendedProduct[]
  hasMoreReviews: boolean
  refreshReviews: () => Promise<void>
  loadMoreReviews: () => Promise<void>
  updateReviewHelpful: (reviewId: string, likesCount: number, liked: boolean) => void
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
  reviewsTotalDocuments: 0,
}

const noopAsync = async () => undefined
const noopUpdate = (() => undefined) as (
  reviewId: string,
  likesCount: number,
  liked: boolean,
) => void

const missingSlugState: ProductPageDataState = {
  loading: false,
  reviewsLoading: false,
  reviewsLoadingMore: false,
  reviewsError: null,
  faqsError: null,
  error: 'Product not found.',
  errorKind: 'not_found',
  product: null,
  productId: null,
  brandName: '',
  faqs: [],
  reviewsData: emptyReviewsData,
  moreFromBrandProducts: [],
  relatedProducts: [],
  hasMoreReviews: false,
  refreshReviews: noopAsync,
  loadMoreReviews: noopAsync,
  updateReviewHelpful: noopUpdate,
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
  const { i18n } = useTranslation()
  const locale = i18n.language
  const { products: catalogProducts } = useLandingCatalogContext()
  const { isAuthenticated, user } = useAuth()
  const currentUserId = user?.id ?? null
  const catalogProductsRef = useRef(catalogProducts)
  const currentUserIdRef = useRef(currentUserId)
  const localeRef = useRef(locale)
  const productIdRef = useRef<string | null>(null)
  const productRef = useRef<ProductDetail | null>(null)
  // Raw API product, so text/names can be re-localized when the language switches.
  const apiProductRef = useRef<ApiProduct | null>(null)
  const reviewsPageRef = useRef(1)
  const reviewsTotalRef = useRef(0)
  const apiReviewsRef = useRef<ApiReview[]>([])
  const statsRef = useRef<Parameters<typeof buildReconciledReviewsSectionData>[0]['stats']>(null)

  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [faqsError, setFaqsError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<ProductPageErrorKind>(null)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [reviewsData, setReviewsData] = useState(emptyReviewsData)
  const [moreFromBrandProducts, setMoreFromBrandProducts] = useState<RecommendedProduct[]>([])
  const [relatedProducts, setRelatedProducts] = useState<RecommendedProduct[]>([])
  const [hasMoreReviews, setHasMoreReviews] = useState(false)

  // Language switch: re-map the already-loaded product (no refetch) so description, tabs and
  // names follow the active language immediately.
  useEffect(() => {
    const raw = apiProductRef.current
    if (raw) setProduct(mapApiProductToProductDetail(raw))
  }, [locale])

  useEffect(() => {
    catalogProductsRef.current = catalogProducts
  }, [catalogProducts])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    localeRef.current = locale
  }, [locale])

  useEffect(() => {
    productIdRef.current = productId
  }, [productId])

  useEffect(() => {
    productRef.current = product
  }, [product])

  const applyReviewsState = useCallback(
    (apiReviews: ApiReview[], visibleTotal: number) => {
      const next = buildReconciledReviewsSectionData({
        stats: statsRef.current,
        apiReviews,
        visibleTotalDocuments: visibleTotal,
        currentUserId: currentUserIdRef.current,
        locale: localeRef.current,
        fallbackAverage: productRef.current?.rating ?? 0,
        fallbackQuantity: productRef.current?.reviewCount ?? 0,
      })
      apiReviewsRef.current = apiReviews
      reviewsTotalRef.current = next.reviewsTotalDocuments ?? visibleTotal
      setReviewsData(next)
      setHasMoreReviews(apiReviews.length < (next.reviewsTotalDocuments ?? visibleTotal))
    },
    [],
  )

  const loadReviewsPage = useCallback(async (id: string, page: number, append: boolean) => {
    const [statsResponse, reviewsResponse] = await Promise.all([
      page === 1 ? getProductReviewStats(id) : Promise.resolve(null),
      getProductReviews(id, { limit: REVIEWS_PAGE_SIZE, page, sort: '-createdAt' }),
    ])

    if (page === 1 && statsResponse) {
      statsRef.current = statsResponse.data ?? null
    }

    const pageReviews = reviewsResponse.data ?? []
    const visibleTotal =
      reviewsResponse.pagination?.totalDocuments ??
      (append ? apiReviewsRef.current.length + pageReviews.length : pageReviews.length)

    const merged = append ? [...apiReviewsRef.current, ...pageReviews] : pageReviews
    // Dedupe by id in case of overlap
    const seen = new Set<string>()
    const unique = merged.filter((review) => {
      if (seen.has(review._id)) return false
      seen.add(review._id)
      return true
    })

    reviewsPageRef.current = page
    applyReviewsState(unique, visibleTotal)
  }, [applyReviewsState])

  const refreshReviews = useCallback(async () => {
    const id = productIdRef.current
    if (!id) return

    try {
      setReviewsError(null)
      await loadReviewsPage(id, 1, false)
    } catch (error) {
      setReviewsError(
        error instanceof ApiError ? error.message : 'Unable to load reviews.',
      )
    }
  }, [loadReviewsPage])

  const loadMoreReviews = useCallback(async () => {
    const id = productIdRef.current
    if (!id || reviewsLoadingMore) return
    if (apiReviewsRef.current.length >= reviewsTotalRef.current) return

    setReviewsLoadingMore(true)
    setReviewsError(null)
    try {
      await loadReviewsPage(id, reviewsPageRef.current + 1, true)
    } catch (error) {
      setReviewsError(
        error instanceof ApiError ? error.message : 'Unable to load more reviews.',
      )
    } finally {
      setReviewsLoadingMore(false)
    }
  }, [loadReviewsPage, reviewsLoadingMore])

  const updateReviewHelpful = useCallback(
    (reviewId: string, likesCount: number, liked: boolean) => {
      setReviewsData((previous) => ({
        ...previous,
        reviews: previous.reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpful: likesCount, liked }
            : review,
        ),
      }))
    },
    [],
  )

  useEffect(() => {
    if (!normalizedSlug) return

    let cancelled = false

    async function loadProductPage() {
      setLoading(true)
      setReviewsLoading(true)
      setReviewsLoadingMore(false)
      setReviewsError(null)
      setFaqsError(null)
      setError(null)
      setErrorKind(null)
      setProduct(null)
      setProductId(null)
      setFaqs([])
      setReviewsData(emptyReviewsData)
      setMoreFromBrandProducts([])
      setRelatedProducts([])
      setHasMoreReviews(false)
      reviewsPageRef.current = 1
      reviewsTotalRef.current = 0
      apiReviewsRef.current = []
      statsRef.current = null

      try {
        const apiProduct = await resolveProductBySlug(normalizedSlug, {
          seedProducts: catalogProductsRef.current,
          auth: isAuthenticated,
        })
        if (cancelled) return

        const mappedProduct = mapApiProductToProductDetail(apiProduct)
        apiProductRef.current = apiProduct
        setProduct(mappedProduct)
        setProductId(apiProduct._id)
        setLoading(false)

        // Signed-in views are recorded server-side by GET /products/:id; guests keep a local list.
        if (!isAuthenticated) recordGuestView(apiProduct._id)

        void getRelatedProducts(apiProduct._id, 12)
          .then((response) => {
            if (!cancelled) {
              setRelatedProducts(
                (response.data ?? []).map((item) =>
                  mapApiProductToRecommendedProduct(item, localeRef.current),
                ),
              )
            }
          })
          .catch(() => {
            if (!cancelled) setRelatedProducts([])
          })

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
          await loadReviewsPage(apiProduct._id, 1, false)
          if (!cancelled) setReviewsError(null)
        } catch (reviewsLoadError) {
          if (cancelled) return
          setReviewsData(
            buildReconciledReviewsSectionData({
              stats: null,
              apiReviews: [],
              visibleTotalDocuments: 0,
              currentUserId: currentUserIdRef.current,
              locale: localeRef.current,
            }),
          )
          setReviewsError(
            reviewsLoadError instanceof ApiError
              ? reviewsLoadError.message
              : 'Unable to load reviews.',
          )
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
            setFaqsError(null)
          }
        } catch (faqsLoadError) {
          if (!cancelled) {
            setFaqs([])
            setFaqsError(
              faqsLoadError instanceof ApiError
                ? faqsLoadError.message
                : 'Unable to load FAQs.',
            )
          }
        }
      } catch (loadError) {
        if (cancelled) return
        const resolved = resolveError(loadError)
        setProduct(null)
        setProductId(null)
        setFaqs([])
        setMoreFromBrandProducts([])
        setRelatedProducts([])
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
  }, [normalizedSlug, isAuthenticated, loadReviewsPage])

  // Re-map review dates / liked flags when language or user changes without full reload.
  useEffect(() => {
    if (!productIdRef.current || apiReviewsRef.current.length === 0) return
    applyReviewsState(apiReviewsRef.current, reviewsTotalRef.current)
  }, [applyReviewsState, currentUserId, locale])

  if (!normalizedSlug) {
    return missingSlugState
  }

  return {
    loading,
    reviewsLoading,
    reviewsLoadingMore,
    reviewsError,
    faqsError,
    error,
    errorKind,
    product,
    productId,
    brandName: product?.brand ?? '',
    faqs,
    reviewsData,
    moreFromBrandProducts,
    relatedProducts,
    hasMoreReviews,
    refreshReviews,
    loadMoreReviews,
    updateReviewHelpful,
  }
}
