// src/types/adminCategories.ts
import type { ApiCategory } from './catalog'

/** Admin list/detail uses the catalog category shape plus optional timestamps. */
export type ApiAdminCategory = ApiCategory & {
  createdAt?: string
  updatedAt?: string
  image?: string | null
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

export interface AdminCategoriesListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
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
