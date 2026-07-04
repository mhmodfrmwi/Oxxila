// src/config/collections.ts
import type { GetProductsParams } from '../api/catalog'
import { collectionBrowsePath } from '../utils/categoryBrowseParams'

export interface CollectionConfig {
  slug: string
  title: string
  description?: string
  query: GetProductsParams
}

export const COLLECTION_CONFIGS: Record<string, CollectionConfig> = {
  'new-arrivals': {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    description: 'Fresh takes you almost need',
    query: { sort: '-createdAt', limit: 12 },
  },
  'best-sellers': {
    slug: 'best-sellers',
    title: 'Best Sellers',
    description: 'Fill your cart',
    query: { isBestSeller: true, limit: 12 },
  },
  trending: {
    slug: 'trending',
    title: 'Trending',
    description: 'Stay in trend',
    query: { sort: '-soldCount,-createdAt', limit: 12 },
  },
  offers: {
    slug: 'offers',
    title: 'Offers & Discounts',
    description: 'Discover Oxxila deals',
    query: { allOffers: true, limit: 12 },
  },
  featured: {
    slug: 'featured',
    title: 'Featured',
    description: 'Doctor recommended skincare',
    query: { isCertified: true, limit: 12 },
  },
}

export function getCollectionConfig(slug: string): CollectionConfig | null {
  return COLLECTION_CONFIGS[slug] ?? null
}

export function getCollectionHref(slug: keyof typeof COLLECTION_CONFIGS | string): string {
  return collectionBrowsePath(slug)
}
