// src/utils/adminCategoriesFormat.ts
import type {
  AdminCategoryFormErrors,
  AdminCategoryFormValues,
  AdminCategoryRow,
  AdminCategoryWriteFields,
  ApiAdminCategory,
} from '../types/adminCategories'

/** From category upload middleware (`maxFileSizeMB: 2`). */
export const ADMIN_CATEGORY_FILE_MAX_BYTES = 2 * 1024 * 1024
export const ADMIN_CATEGORY_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const
export const ADMIN_CATEGORY_NAME_MIN = 2
export const ADMIN_CATEGORY_NAME_MAX = 50

export function mapApiCategoryToAdminRow(
  category: ApiAdminCategory,
): AdminCategoryRow {
  const subcategories = Array.isArray(category.subcategories)
    ? category.subcategories
    : []

  return {
    id: String(category._id),
    name: category.name ?? '',
    slug: category.slug ?? '',
    image: category.image ? String(category.image) : null,
    isActive: category.isActive !== false,
    subcategoryCount: subcategories.length,
  }
}

export function emptyCategoryFormValues(): AdminCategoryFormValues {
  return {
    name: '',
    isActive: true,
  }
}

export function categoryToFormValues(
  category: AdminCategoryRow,
): AdminCategoryFormValues {
  return {
    name: category.name,
    isActive: category.isActive,
  }
}

export function formValuesToWriteFields(
  values: AdminCategoryFormValues,
): AdminCategoryWriteFields {
  return {
    name: values.name.trim(),
    isActive: values.isActive,
  }
}

export function validateCategoryImage(file: File): string | null {
  if (
    !(ADMIN_CATEGORY_IMAGE_TYPES as readonly string[]).includes(file.type)
  ) {
    return 'Image must be JPEG, PNG, or WebP'
  }
  if (file.size > ADMIN_CATEGORY_FILE_MAX_BYTES) {
    return 'Image must be 2MB or smaller'
  }
  return null
}

/** Client validation aligned with category.validator.js. */
export function validateCategoryForm(
  values: AdminCategoryFormValues,
  imageFile: File | null,
): AdminCategoryFormErrors {
  const errors: AdminCategoryFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Category name is required'
  } else if (
    name.length < ADMIN_CATEGORY_NAME_MIN ||
    name.length > ADMIN_CATEGORY_NAME_MAX
  ) {
    errors.name = `Name must be ${ADMIN_CATEGORY_NAME_MIN}-${ADMIN_CATEGORY_NAME_MAX} characters`
  }

  if (imageFile) {
    const imageError = validateCategoryImage(imageFile)
    if (imageError) errors.image = imageError
  }

  return errors
}
