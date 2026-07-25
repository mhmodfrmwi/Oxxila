// src/utils/adminSubcategoriesFormat.ts
import type {
  AdminSubcategoryFormErrors,
  AdminSubcategoryFormValues,
  AdminSubcategoryRow,
  AdminSubcategoryWriteFields,
  ApiAdminSubcategory,
} from '../types/adminSubcategories'

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
      name: category.name ?? null,
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

  return {
    id: String(subcategory._id),
    name: subcategory.name ?? '',
    slug: subcategory.slug ?? '',
    image: subcategory.image ? String(subcategory.image) : null,
    isActive: subcategory.isActive !== false,
    categoryId,
    categoryName,
  }
}

export function emptySubcategoryFormValues(): AdminSubcategoryFormValues {
  return {
    name: '',
    category: '',
    isActive: true,
  }
}

export function subcategoryToFormValues(
  subcategory: AdminSubcategoryRow,
): AdminSubcategoryFormValues {
  return {
    name: subcategory.name,
    category: subcategory.categoryId,
    isActive: subcategory.isActive,
  }
}

export function formValuesToWriteFields(
  values: AdminSubcategoryFormValues,
): AdminSubcategoryWriteFields {
  return {
    name: values.name.trim(),
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
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Subcategory name is required'
  } else if (
    name.length < ADMIN_SUBCATEGORY_NAME_MIN ||
    name.length > ADMIN_SUBCATEGORY_NAME_MAX
  ) {
    errors.name = `Name must be ${ADMIN_SUBCATEGORY_NAME_MIN}-${ADMIN_SUBCATEGORY_NAME_MAX} characters`
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
