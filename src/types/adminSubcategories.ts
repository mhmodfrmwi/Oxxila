// src/types/adminSubcategories.ts

/** Raw subcategory from /api/v1/subcategories (list/detail). */
export interface ApiAdminSubcategory {
  _id: string
  name: string
  nameEn?: string
  nameAr?: string
  slug: string
  image?: string | null
  isActive?: boolean
  category?:
    | string
    | { _id: string; name?: string; nameEn?: string; nameAr?: string; slug?: string }
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for Subcategories Manager table. */
export interface AdminSubcategoryRow {
  id: string
  name: string
  nameEn: string
  nameAr: string
  slug: string
  image: string | null
  isActive: boolean
  categoryId: string
  categoryName: string | null
}

export interface AdminSubcategoriesListParams {
  keyword?: string
  category?: string
  sort?: string
}

export interface AdminSubcategoryWriteFields {
  nameEn: string
  nameAr: string
  isActive?: boolean
  /** Optional on update — may move the subcategory to another parent. */
  category?: string
}

export interface AdminSubcategoryFormValues {
  nameEn: string
  nameAr: string
  category: string
  isActive: boolean
}

export type AdminSubcategoryFormErrors = Partial<
  Record<keyof AdminSubcategoryFormValues | 'image', string>
>
