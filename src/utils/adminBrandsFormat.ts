// src/utils/adminBrandsFormat.ts
import type {
  AdminBrandFormErrors,
  AdminBrandFormValues,
  AdminBrandRow,
  AdminBrandWriteFields,
  ApiAdminBrand,
} from '../types/adminBrands'

/** From brand upload middleware (`maxFileSizeMB: 2`). */
export const ADMIN_BRAND_FILE_MAX_BYTES = 2 * 1024 * 1024
export const ADMIN_BRAND_LOGO_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const
export const ADMIN_BRAND_NAME_MIN = 2
export const ADMIN_BRAND_NAME_MAX = 50
export const ADMIN_BRAND_DESCRIPTION_MAX = 500

function resolveCategory(
  category: ApiAdminBrand['category'],
): { id: string | null; name: string | null } {
  if (category && typeof category === 'object') {
    return {
      id: category._id ? String(category._id) : null,
      name: category.name ?? null,
    }
  }
  if (typeof category === 'string' && category) {
    return { id: category, name: null }
  }
  return { id: null, name: null }
}

export function mapApiBrandToAdminRow(brand: ApiAdminBrand): AdminBrandRow {
  const { id: categoryId, name: categoryName } = resolveCategory(brand.category)

  return {
    id: String(brand._id),
    name: brand.name ?? '',
    slug: brand.slug ?? '',
    logo: brand.logo ? String(brand.logo) : null,
    description: brand.description ?? '',
    isActive: brand.isActive !== false,
    categoryId,
    categoryName,
  }
}

export function emptyBrandFormValues(): AdminBrandFormValues {
  return {
    name: '',
    description: '',
    category: '',
    isActive: true,
  }
}

export function brandToFormValues(brand: AdminBrandRow): AdminBrandFormValues {
  return {
    name: brand.name,
    description: brand.description,
    category: brand.categoryId ?? '',
    isActive: brand.isActive,
  }
}

export function formValuesToWriteFields(
  values: AdminBrandFormValues,
): AdminBrandWriteFields {
  const fields: AdminBrandWriteFields = {
    name: values.name.trim(),
    isActive: values.isActive,
  }

  const description = values.description.trim()
  fields.description = description

  if (values.category.trim()) {
    fields.category = values.category.trim()
  }

  return fields
}

export function validateBrandLogo(file: File): string | null {
  if (!(ADMIN_BRAND_LOGO_TYPES as readonly string[]).includes(file.type)) {
    return 'Logo must be JPEG, PNG, or WebP'
  }
  if (file.size > ADMIN_BRAND_FILE_MAX_BYTES) {
    return 'Logo must be 2MB or smaller'
  }
  return null
}

/** Client validation aligned with brand.validator.js. */
export function validateBrandForm(
  values: AdminBrandFormValues,
  logoFile: File | null,
): AdminBrandFormErrors {
  const errors: AdminBrandFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Brand name is required'
  } else if (
    name.length < ADMIN_BRAND_NAME_MIN ||
    name.length > ADMIN_BRAND_NAME_MAX
  ) {
    errors.name = `Name must be ${ADMIN_BRAND_NAME_MIN}-${ADMIN_BRAND_NAME_MAX} characters`
  }

  const description = values.description.trim()
  if (description.length > ADMIN_BRAND_DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${ADMIN_BRAND_DESCRIPTION_MAX} characters`
  }

  if (logoFile) {
    const logoError = validateBrandLogo(logoFile)
    if (logoError) errors.logo = logoError
  }

  return errors
}
