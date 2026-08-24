// src/types/adminProducts.ts
import type { ApiProduct } from './catalog'

export type AdminProductsCatalogTab = 'active' | 'archived'

export interface AdminProductsListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
  category?: string
  brand?: string
  isBestSeller?: boolean
  isBundle?: boolean
  priceMin?: number
  priceMax?: number
  /** Days for GET /products performance trend (backend default 30). */
  period?: number
  /**
   * Catalog visibility. Backend defaults to active-only when omitted.
   * Pass `false` for the Archived tab.
   */
  isActive?: boolean
}

export type AdminProductInventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface AdminProductRow {
  id: string
  name: string
  image: string | null
  /** Null when the API does not provide a SKU — UI must show a placeholder. */
  sku: string | null
  categoryId: string | null
  categoryName: string | null
  stock: number
  inventoryStatus: AdminProductInventoryStatus
  inventoryProgress: number
  price: number
  soldCount: number
  isBestSeller: boolean
  /** Period-over-period units-sold trend (%) from list API `performance`. */
  performancePercent: number | null
}

export type AdminProductSource = ApiProduct

/** Writable fields for create/update (aligned with BE product body). */
export interface AdminProductWriteFields {
  name: string
  price: number
  stock: number
  category: string
  subCategory: string[]
  concerns?: string[]
  isSensitiveSkin?: boolean
  description?: string
  advantages?: string
  composition?: string
  /** Existing Cloudinary URLs to keep (JSON updates). */
  images?: string[]
  /** Pass `null` to clear an existing catalog file. */
  catalog?: string | null
  isActive?: boolean
}

export interface AdminProductWriteFiles {
  images?: File[]
  catalog?: File | null
}

