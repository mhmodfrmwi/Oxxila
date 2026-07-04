import type { BestSellerProduct } from '../components/landing/best-seller/ProductCard'
import { bestSellerProducts as fallbackBestSellers } from '../components/landing/landingData'
import type {
  ApiProduct,
  FeaturedImage,
  SkinConcernDisplay,
} from '../types/catalog'
import { resolveProductImageUrl } from './productImage'
import { resolveProductPricing } from './productPricing'
import { SKIN_CONCERN_IMAGES } from './skinConcernImages'

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

export function buildSkinConcerns(): SkinConcernDisplay[] {
  return SKIN_CONCERN_ORDER.map((slug) => ({
    id: slug,
    slug,
    name: SKIN_CONCERN_LABELS[slug] ?? slug,
    image: SKIN_CONCERN_IMAGES[slug],
    href: `/search?concerns=${slug}`,
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
