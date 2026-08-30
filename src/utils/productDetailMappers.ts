import { PRODUCTS_PATH, SEARCH_PATH, SHOP_PATH } from '../config/routes'
import { categoryBrowsePath } from './categoryBrowseParams'
import type { ProductDetail, ProductImage } from '../types/productDetail'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import type { ApiProduct, ApiReview } from '../types/catalog'
import type { RatingDistribution, Review } from '../components/product/reviews/types'
import { resolveProductImageUrl } from './productImage'
import { resolveDiscountPercent, resolveProductPricing } from './productPricing'

function parseDelimitedList(value: string | undefined | null): string[] {
  if (!value) return []

  const content = value.includes('|') ? value.split('|').slice(1).join('|').trim() : value.trim()
  if (!content) return []

  let items = content
    .split(/[\n\r;]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  // Admin often pastes one block without `;` — split before a capitalised clause.
  if (items.length === 1 && /[a-z0-9,.%)]\s+[A-Z]/.test(items[0])) {
    items = items[0]
      .split(/(?<=[a-z0-9,.%)])\s+(?=[A-Z])/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return items
}

function mapImages(images: readonly string[], productName: string): ProductImage[] {
  const sources = images.length > 0 ? images : ['']
  return sources.map((src, index) => ({
    src: resolveProductImageUrl(src),
    alt: index === 0 ? `${productName} — front` : `${productName} — view ${index + 1}`,
  }))
}

function resolveAvailability(stock: number | undefined): string {
  if (stock == null) return 'Availability unknown'
  return stock > 0 ? 'In stock' : 'Out of stock'
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : typeof item === 'object' && item && 'name' in item ? String((item as { name: string }).name).trim() : ''))
    .filter(Boolean)
}

function extractVariants(catalog: unknown): { sizes: string[]; shades?: string[] } {
  if (!catalog || typeof catalog !== 'object') {
    return { sizes: [], shades: undefined }
  }

  const record = catalog as Record<string, unknown>
  const sizes = readStringArray(record.sizes ?? record.sizeOptions)
  const shades = readStringArray(record.shades ?? record.shadeOptions ?? record.colors)
  return {
    sizes,
    shades: shades.length > 0 ? shades : undefined,
  }
}

function resolveProductBadge(product: ApiProduct): string | undefined {
  if (product.isBestSeller) return 'Best seller'
  if (product.isCertified) return 'Certified'
  if (product.isBundle) return 'Bundle'
  return undefined
}

function resolveOfferEndsAt(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return undefined
  return value
}

function formatOfferEndsLabel(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return undefined
  const formatted = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `Offer ends ${formatted}`
}

function buildTags(product: ApiProduct): string[] {
  const tags = new Set<string>()
  if (product.category?.name) tags.add(product.category.name)
  product.concerns?.forEach((concern) => tags.add(concern))
  if (product.isSensitiveSkin) tags.add('Sensitive skin')
  if (product.isCertified) tags.add('Certified')
  return [...tags]
}

function readOptionalString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

export function mapApiProductToRecommendedProduct(product: ApiProduct): RecommendedProduct {
  const { price, originalPrice } = resolveProductPricing(product)

  return {
    id: product._id,
    brand: product.brand?.name ?? '',
    title: product.name,
    price,
    originalPrice,
    rating: product.ratingsAverage ?? 0,
    reviewCount: product.ratingsQuantity ?? 0,
    image: resolveProductImageUrl(product.images?.[0]),
    imageAlt: product.name,
    badge: resolveProductBadge(product),
    href: `${PRODUCTS_PATH}/${product.slug}`,
    stock: product.stock,
  }
}

export function mapApiProductToProductDetail(product: ApiProduct): ProductDetail {
  const { price, originalPrice } = resolveProductPricing(product)
  const images = mapImages(product.images ?? [], product.name)
  const variants = extractVariants(product.catalog)
  const productRecord = product as ApiProduct & Record<string, unknown>
  const deliveryEstimate = readOptionalString(productRecord, [
    'deliveryEstimate',
    'estimatedDelivery',
    'deliveryTime',
  ])

  return {
    id: product._id,
    slug: product.slug,
    href: `${PRODUCTS_PATH}/${product.slug}`,
    brand: product.brand?.name?.trim() ?? '',
    brandLogo: product.brand?.logo
      ? resolveProductImageUrl(product.brand.logo)
      : undefined,
    brandHref: product.brand?._id
      ? `${SEARCH_PATH}?brand=${encodeURIComponent(product.brand._id)}`
      : undefined,
    title: product.name,
    price,
    originalPrice,
    rating: product.ratingsAverage ?? 0,
    reviewCount: product.ratingsQuantity ?? 0,
    image: resolveProductImageUrl(product.images?.[0]),
    imageAlt: product.name,
    badge: resolveProductBadge(product),
    offerEndsAt: resolveOfferEndsAt(product.offerEndsAt),
    offerEndsLabel: formatOfferEndsLabel(product.offerEndsAt),
    soldCount: product.soldCount != null && product.soldCount > 0 ? product.soldCount : undefined,
    subCategoryName: product.subCategory?.[0]?.name,
    categoryName: product.category?.name ?? '',
    categoryHref: product.category?.slug
      ? categoryBrowsePath(product.category.slug)
      : SHOP_PATH,
    description: product.description ?? '',
    advantages: parseDelimitedList(product.advantages),
    composition: parseDelimitedList(product.composition),
    images,
    beforeAfterImages: [],
    sizes: variants.sizes,
    shades: variants.shades,
    sku: product._id,
    availability: resolveAvailability(product.stock),
    tags: buildTags(product),
    stockCount: product.stock ?? 0,
    deliveryEstimate,
    discountPercent: resolveDiscountPercent(
      product.price,
      product.priceAfterDiscount,
      product.offerEndsAt,
    ),
  }
}

export function buildMoreFromBrandProducts(
  products: readonly ApiProduct[],
  currentProductId: string,
): RecommendedProduct[] {
  return products
    .filter((product) => product._id !== currentProductId)
    .map(mapApiProductToRecommendedProduct)
}

export function buildCatalogProductsForCategory(
  products: readonly ApiProduct[],
  categorySlug: string,
): RecommendedProduct[] {
  return products
    .filter((product) => product.category?.slug === categorySlug)
    .map(mapApiProductToRecommendedProduct)
}

function formatReviewDate(value: string | undefined, locale = 'en'): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function mapApiReviewToReview(
  review: ApiReview,
  currentUserId?: string | null,
  locale = 'en',
): Review | null {
  const comment = review.comment?.trim() || review.review?.trim() || ''
  if (!comment) return null

  const user =
    typeof review.user === 'string'
      ? { _id: review.user }
      : review.user

  const userId = user?._id
  const liked =
    Boolean(currentUserId) &&
    (review.likes ?? []).some((entry) => {
      const id = typeof entry === 'string' ? entry : entry?._id
      return id === currentUserId
    })

  return {
    id: review._id,
    name: user?.name?.trim() || '',
    avatar: user?.avatar ?? user?.photo ?? '',
    date: formatReviewDate(review.createdAt, locale),
    rating: review.rating,
    title: review.title?.trim() || '',
    comment,
    helpful: review.likesCount ?? 0,
    liked,
    isOwn: Boolean(currentUserId && userId && userId === currentUserId),
  }
}

const EMPTY_DISTRIBUTION: RatingDistribution[] = [
  { stars: 5, percentage: 0 },
  { stars: 4, percentage: 0 },
  { stars: 3, percentage: 0 },
  { stars: 2, percentage: 0 },
  { stars: 1, percentage: 0 },
]

export function mapApiReviewStatsToDistribution(
  breakdown: Array<{ star: number; percentage: number; count?: number }>,
): RatingDistribution[] {
  if (!breakdown.length) return EMPTY_DISTRIBUTION
  return breakdown.map((item) => ({
    stars: item.star,
    percentage: item.percentage,
  }))
}

function averageFromReviews(reviews: readonly Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

/**
 * Keeps rating summary / histogram / list consistent when BE denormalized
 * product counters disagree with visible reviews + breakdown aggregate.
 */
export function buildReconciledReviewsSectionData(options: {
  stats?: {
    ratingsAverage: number
    ratingsQuantity: number
    breakdown: Array<{ star: number; percentage: number; count?: number }>
  } | null
  apiReviews: readonly ApiReview[]
  visibleTotalDocuments?: number | null
  currentUserId?: string | null
  locale?: string
  fallbackAverage?: number
  fallbackQuantity?: number
}) {
  const {
    stats,
    apiReviews,
    visibleTotalDocuments,
    currentUserId,
    locale = 'en',
    fallbackAverage = 0,
  } = options

  const reviews = apiReviews
    .map((review) => mapApiReviewToReview(review, currentUserId, locale))
    .filter((review): review is Review => review != null)

  const breakdownTotal =
    stats?.breakdown?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0
  const listTotal =
    visibleTotalDocuments != null ? visibleTotalDocuments : reviews.length

  // Stale product counters with no listable reviews and empty histogram.
  if (listTotal === 0 && breakdownTotal === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: EMPTY_DISTRIBUTION,
      reviews: [],
      reviewsTotalDocuments: 0,
    }
  }

  const distribution =
    breakdownTotal > 0 && stats?.breakdown
      ? mapApiReviewStatsToDistribution(stats.breakdown)
      : buildRatingDistribution(reviews)

  const totalReviews =
    listTotal > 0 ? listTotal : breakdownTotal > 0 ? breakdownTotal : 0

  const averageRating =
    breakdownTotal > 0 || listTotal > 0
      ? (stats?.ratingsAverage ??
        (reviews.length > 0 ? averageFromReviews(reviews) : fallbackAverage) ??
        0)
      : 0

  return {
    averageRating: Number.isFinite(averageRating) ? averageRating : 0,
    totalReviews,
    distribution,
    reviews,
    reviewsTotalDocuments: totalReviews,
  }
}

export function buildReviewsSectionDataFromStats(
  stats: {
    ratingsAverage: number
    ratingsQuantity: number
    breakdown: Array<{ star: number; percentage: number; count?: number }>
  },
  apiReviews: readonly ApiReview[],
  currentUserId?: string | null,
  visibleTotalDocuments?: number | null,
  locale = 'en',
) {
  return buildReconciledReviewsSectionData({
    stats,
    apiReviews,
    currentUserId,
    visibleTotalDocuments,
    locale,
  })
}

export function buildRatingDistribution(reviews: readonly Review[]): RatingDistribution[] {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  reviews.forEach((review) => {
    const stars = Math.min(5, Math.max(1, Math.round(review.rating)))
    counts[stars] += 1
  })

  const total = reviews.length

  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percentage: total === 0 ? 0 : Math.round((counts[stars] / total) * 100),
  }))
}

export function buildReviewsSectionData(
  averageRating: number,
  totalReviews: number,
  apiReviews: readonly ApiReview[],
  currentUserId?: string | null,
  visibleTotalDocuments?: number | null,
  locale = 'en',
) {
  return buildReconciledReviewsSectionData({
    stats: null,
    apiReviews,
    currentUserId,
    visibleTotalDocuments: visibleTotalDocuments ?? totalReviews,
    locale,
    fallbackAverage: averageRating,
    fallbackQuantity: totalReviews,
  })
}
