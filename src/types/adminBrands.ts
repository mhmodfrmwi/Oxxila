// src/types/adminBrands.ts
import type { ApiBrand } from './catalog'

/** Admin list/detail uses the catalog brand shape plus optional description. */
export type ApiAdminBrand = ApiBrand & {
  description?: string | null
  logo?: string | null
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for Brands Manager table. */
export interface AdminBrandRow {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string
  isActive: boolean
  categoryId: string | null
  categoryName: string | null
}

export interface AdminBrandsListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
  category?: string
}

export interface AdminBrandWriteFields {
  name: string
  description?: string
  category?: string
  isActive?: boolean
}

export interface AdminBrandFormValues {
  name: string
  description: string
  category: string
  isActive: boolean
}

export type AdminBrandFormErrors = Partial<
  Record<keyof AdminBrandFormValues | 'logo', string>
>
