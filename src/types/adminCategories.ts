// src/types/adminCategories.ts
import type { ApiAdminAuditBlock } from './adminAudit'
import type { ApiCategory } from './catalog'

/** Admin list/detail uses the catalog category shape plus optional timestamps. */
export type ApiAdminCategory = ApiCategory & {
  createdAt?: string
  updatedAt?: string
  image?: string | null
  audit?: ApiAdminAuditBlock | null
}

/** Normalized row for Categories Manager table. */
export interface AdminCategoryRow {
  id: string
  name: string
  slug: string
  image: string | null
  isActive: boolean
  subcategoryCount: number
}

/** Nested subcategory on a category tree row (from populated `subcategories[]`). */
export interface AdminCategoryTreeSubcategory {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdByName: string | null
}

/** Category with nested subcategories for the admin tree table. */
export interface AdminCategoryTreeRow {
  id: string
  name: string
  slug: string
  image: string | null
  isActive: boolean
  createdByName: string | null
  subcategories: AdminCategoryTreeSubcategory[]
}

export interface AdminCategoriesListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
  includeInactive?: boolean
}

export interface AdminCategoryWriteFields {
  name: string
  isActive?: boolean
}

export interface AdminCategoryFormValues {
  name: string
  isActive: boolean
}

export type AdminCategoryFormErrors = Partial<
  Record<keyof AdminCategoryFormValues | 'image', string>
>
