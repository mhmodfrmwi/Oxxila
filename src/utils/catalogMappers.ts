import type { BestSellerProduct } from '../components/landing/best-seller/ProductCard'
import {
  bestSellerProducts as fallbackBestSellers,
  skinConcerns as fallbackSkinConcerns,
} from '../components/landing/landingData'
import type {
  ApiProduct,
  FeaturedImage,
  SkinConcernDisplay,
} from '../types/catalog'
import { resolveProductImageUrl } from './productImage'
import { resolveProductPricing } from './productPricing'

export const SKIN_CONCERN_ORDER = [
  'acne',
  'pigmentation',
  'sensitive-skin',
  'drought',
  'wrinkles',
  'wide-pores',
] as const

const SKIN_CONCERN_LABELS: Record<string, string> = {
  acne: 'Acne',
  pigmentation: 'Pigmentation',
  'sensitive-skin': 'Sensitive skin',
  drought: 'Drought',
  wrinkles: 'Wrinkles',
  'wide-pores': 'Wide pores',
}

const FALLBACK_CONCERN_IMAGES = Object.fromEntries(
  fallbackSkinConcerns.map((concern) => [concern.id, concern.image]),
) as Record<string, string>

export function mapProductToBestSeller(product: ApiProduct): BestSellerProduct {
  const { price } = resolveProductPricing(product)

  return {
    id: product._id,
    title: product.name,
    price,
    originalPrice: product.price,
    rating: product.ratingsAverage ?? 0,
    reviewCount: product.ratingsQuantity ?? 0,
    image: resolveProductImageUrl(product.images?.[0]),
    slug: product.slug,
  }
}

export function buildBestSellers(products: ApiProduct[]): BestSellerProduct[] {
  const flagged = products.filter((product) => product.isBestSeller)
  const pool =
    flagged.length >= 5
      ? flagged
      : [
          ...flagged,
          ...products
            .filter((product) => !product.isBestSeller)
            .sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)),
        ]

  const mapped = pool.slice(0, 5).map(mapProductToBestSeller).filter((product) => product.image)

  if (mapped.length > 0) return mapped
  return fallbackBestSellers.map((product) => ({ ...product }))
}

export function buildSkinConcerns(products: ApiProduct[]): SkinConcernDisplay[] {
  const mapped = SKIN_CONCERN_ORDER.map((slug) => {
    const product = products.find((item) => item.concerns?.includes(slug))
    const image =
      product?.images?.[0] ??
      FALLBACK_CONCERN_IMAGES[slug === 'sensitive-skin' ? 'sensitive' : slug] ??
      FALLBACK_CONCERN_IMAGES.acne

    return {
      id: slug,
      slug,
      name: SKIN_CONCERN_LABELS[slug] ?? slug,
      image,
      href: `/shop?concern=${slug}`,
    }
  })

  if (mapped.some((concern) => concern.image)) return mapped

  return fallbackSkinConcerns.map((concern) => ({
    id: concern.id,
    slug: concern.id,
    name: concern.name,
    image: concern.image,
    href: `/shop?concern=${concern.id}`,
  }))
}

export function buildFeaturedImages(products: ApiProduct[]): FeaturedImage[] {
  const fromApi = products
    .filter((product) => product.images?.[0])
    .slice(0, 4)
    .map((product) => ({
      id: product._id,
      src: resolveProductImageUrl(product.images[0]),
      alt: product.name,
    }))

  if (fromApi.length > 0) return fromApi

  return fallbackBestSellers.slice(0, 4).map((product) => ({
    id: product.id,
    src: product.image,
    alt: product.title,
  }))
}
