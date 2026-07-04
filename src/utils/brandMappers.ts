// src/utils/brandMappers.ts
import { SEARCH_PATH } from '../config/routes'
import type { BrandStore } from '../components/shop/brand-stores/brandStoresData'
import type { ApiBrand } from '../types/catalog'
import { resolveProductImageUrl } from './productImage'

export function mapBrandToStore(brand: ApiBrand): BrandStore {
  return {
    id: brand._id,
    name: brand.name,
    logo: resolveProductImageUrl(brand.logo),
    logoAlt: `${brand.name} logo`,
    href: `${SEARCH_PATH}?brand=${encodeURIComponent(brand._id)}`,
  }
}

export function mapBrandsToStores(brands: readonly ApiBrand[]): BrandStore[] {
  return brands
    .filter((brand) => brand.isActive !== false)
    .map(mapBrandToStore)
}
