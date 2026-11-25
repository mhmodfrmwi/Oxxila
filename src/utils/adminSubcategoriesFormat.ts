// src/utils/adminSubcategoriesFormat.ts
import type {
  AdminSubcategoryFormErrors,
  AdminSubcategoryFormValues,
  AdminSubcategoryRow,
  AdminSubcategoryWriteFields,
  ApiAdminSubcategory,
} from '../types/adminSubcategories'
import { catalogDisplayName } from './catalogDisplayName'

/** From subcategory upload middleware (`maxFileSizeMB: 2`). */
export const ADMIN_SUBCATEGORY_FILE_MAX_BYTES = 2 * 1024 * 1024
export const ADMIN_SUBCATEGORY_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const
export const ADMIN_SUBCATEGORY_NAME_MIN = 2
export const ADMIN_SUBCATEGORY_NAME_MAX = 50

function resolveCategory(
  category: ApiAdminSubcategory['category'],
): { id: string; name: string | null } {
  if (category && typeof category === 'object') {
    return {
      id: category._id ? String(category._id) : '',
      name: catalogDisplayName(category, 'en') || category.name || null,
    }
  }
  if (typeof category === 'string' && category) {
    return { id: category, name: null }
  }
  return { id: '', name: null }
}

export function mapApiSubcategoryToAdminRow(
  subcategory: ApiAdminSubcategory,
): AdminSubcategoryRow {
  const { id: categoryId, name: categoryName } = resolveCategory(
    subcategory.category,
  )
  const nameEn = subcategory.nameEn ?? subcategory.name ?? ''
  const nameAr = subcategory.nameAr ?? ''

  return {
    id: String(subcategory._id),
    name: catalogDisplayName(subcategory, 'en') || nameEn,
    nameEn,
    nameAr,
    slug: subcategory.slug ?? '',
    image: subcategory.image ? String(subcategory.image) : null,
    isActive: subcategory.isActive !== false,
    categoryId,
    categoryName,
  }
}

export function emptySubcategoryFormValues(): AdminSubcategoryFormValues {
  return {
    nameEn: '',
    nameAr: '',
    category: '',
    isActive: true,
  }
}

export function subcategoryToFormValues(
  subcategory: AdminSubcategoryRow,
): AdminSubcategoryFormValues {
  return {
    nameEn: subcategory.nameEn || subcategory.name,
    nameAr: subcategory.nameAr || '',
    category: subcategory.categoryId,
    isActive: subcategory.isActive,
  }
}

export function formValuesToWriteFields(
  values: AdminSubcategoryFormValues,
): AdminSubcategoryWriteFields {
  return {
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim(),
    isActive: values.isActive,
    category: values.category.trim() || undefined,
  }
}

export function validateSubcategoryImage(file: File): string | null {
  if (
    !(ADMIN_SUBCATEGORY_IMAGE_TYPES as readonly string[]).includes(file.type)
  ) {
    return 'Image must be JPEG, PNG, or WebP'
  }
  if (file.size > ADMIN_SUBCATEGORY_FILE_MAX_BYTES) {
    return 'Image must be 2MB or smaller'
  }
  return null
}

/** Client validation aligned with subCategory.validator.js. */
export function validateSubcategoryForm(
  values: AdminSubcategoryFormValues,
  imageFile: File | null,
): AdminSubcategoryFormErrors {
  const errors: AdminSubcategoryFormErrors = {}
  const nameEn = values.nameEn.trim()
  const nameAr = values.nameAr.trim()

  if (!nameEn) {
    errors.nameEn = 'English name is required'
  } else if (
    nameEn.length < ADMIN_SUBCATEGORY_NAME_MIN ||
    nameEn.length > ADMIN_SUBCATEGORY_NAME_MAX
  ) {
    errors.nameEn = `English name must be ${ADMIN_SUBCATEGORY_NAME_MIN}-${ADMIN_SUBCATEGORY_NAME_MAX} characters`
  }

  if (nameAr.length > ADMIN_SUBCATEGORY_NAME_MAX) {
    errors.nameAr = `Arabic name must be at most ${ADMIN_SUBCATEGORY_NAME_MAX} characters`
  }

  if (!values.category.trim()) {
    errors.category = 'Parent category is required'
  }

  if (imageFile) {
    const imageError = validateSubcategoryImage(imageFile)
    if (imageError) errors.image = imageError
  }

  return errors
}
