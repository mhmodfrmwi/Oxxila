// src/utils/bannerMappers.ts
import type { ApiBanner } from '../api/banners'
import { CATEGORIES_PATH, PRODUCTS_PATH, SHOP_PATH } from '../config/routes'
import type { ApiCategory } from '../types/catalog'
import { resolveProductImageUrl } from './productImage'
import type { ShopHeroSlide } from '../components/shop/shopData'

function resolveBannerHref(
  banner: ApiBanner,
  categories: readonly ApiCategory[],
): string {
  if (banner.linkType === 'url' && banner.externalUrl) {
    return banner.externalUrl
  }

  if (banner.linkType === 'product' && banner.linkId) {
    return `${PRODUCTS_PATH}/${banner.linkId}`
  }

  if (banner.linkType === 'category' && banner.linkId) {
    const category = categories.find((entry) => entry._id === banner.linkId)
    if (category?.slug) return `${CATEGORIES_PATH}/${category.slug}`
    return CATEGORIES_PATH
  }

  return SHOP_PATH
}

export function mapBannerToShopHeroSlide(
  banner: ApiBanner,
  index: number,
  categories: readonly ApiCategory[] = [],
): ShopHeroSlide {
  const title = banner.title?.trim() || 'Special Offer'
  const href = resolveBannerHref(banner, categories)

  return {
    id: banner.id,
    variant: index % 2 === 0 ? 'dark' : 'light',
    brand: 'OXXILA',
    headline: title,
    ctaLabel: 'SHOP NOW',
    ctaHref: href,
    productImage: resolveProductImageUrl(banner.image),
    productImageAlt: title,
    badge: 'FEATURED',
  }
}

export function mapBannersToShopHeroSlides(
  banners: readonly ApiBanner[],
  categories: readonly ApiCategory[] = [],
): ShopHeroSlide[] {
  return banners.map((banner, index) => mapBannerToShopHeroSlide(banner, index, categories))
}
