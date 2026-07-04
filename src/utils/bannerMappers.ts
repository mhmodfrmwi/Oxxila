// src/utils/bannerMappers.ts
import type { ApiBanner } from '../api/banners'
import { CATEGORIES_PATH, PRODUCTS_PATH } from '../config/routes'
import type { ApiCategory } from '../types/catalog'
import type { ShopHeroSlide } from '../components/shop/shopData'
import { categoryBrowsePath } from './categoryBrowseParams'
import { resolveProductImageUrl } from './productImage'

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/** Resolve banner destination from API link fields only — no hardcoded marketing paths. */
export function resolveBannerHref(
  banner: ApiBanner,
  categories: readonly ApiCategory[] = [],
): string | null {
  switch (banner.linkType) {
    case 'url': {
      const url = banner.externalUrl?.trim()
      return url || null
    }
    case 'product': {
      const productId = banner.linkId?.trim()
      return productId ? `${PRODUCTS_PATH}/${productId}` : null
    }
    case 'category': {
      const categoryId = banner.linkId?.trim()
      if (!categoryId) return null
      const category = categories.find((entry) => entry._id === categoryId)
      return category?.slug ? categoryBrowsePath(category.slug) : CATEGORIES_PATH
    }
    case 'none':
    default:
      return null
  }
}

export function mapBannerToShopHeroSlide(
  banner: ApiBanner,
  _index: number,
  categories: readonly ApiCategory[] = [],
): ShopHeroSlide {
  const title = banner.title?.trim()
  return {
    id: banner.id,
    image: resolveProductImageUrl(banner.image),
    imageAlt: title || 'Promotional banner',
    href: resolveBannerHref(banner, categories),
  }
}

export function mapBannersToShopHeroSlides(
  banners: readonly ApiBanner[],
  categories: readonly ApiCategory[] = [],
): ShopHeroSlide[] {
  return banners.map((banner, index) => mapBannerToShopHeroSlide(banner, index, categories))
}

export { isExternalHref }
