// src/utils/adminProductValidation.ts
/** Mirrors backend `product.validator.js` + Product model constraints. Do not invent rules. */

export const ADMIN_PRODUCT_CONCERNS = [
  'acne',
  'pigmentation',
  'sensitive-skin',
  'drought',
  'wrinkles',
  'wide-pores',
] as const

export type AdminProductConcern = (typeof ADMIN_PRODUCT_CONCERNS)[number]

export const ADMIN_PRODUCT_NAME_MIN = 2
export const ADMIN_PRODUCT_NAME_MAX = 200
export const ADMIN_PRODUCT_TEXT_MAX = 2000
export const ADMIN_PRODUCT_IMAGES_MAX = 5
/** From product upload middleware (`maxFileSizeMB: 15`). */
export const ADMIN_PRODUCT_FILE_MAX_BYTES = 15 * 1024 * 1024
export const ADMIN_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
export const ADMIN_PRODUCT_CATALOG_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

export interface AdminProductFormValues {
  name: string
  price: string
  stock: string
  category: string
  subCategory: string
  concerns: AdminProductConcern[]
  isSensitiveSkin: boolean
  description: string
  advantages: string
  composition: string
}

export type AdminProductFormErrors = Partial<
  Record<keyof AdminProductFormValues | 'images' | 'catalog', string>
>

const MONGO_ID_RE = /^[a-f\d]{24}$/i

export function isMongoId(value: string): boolean {
  return MONGO_ID_RE.test(value)
}

export function emptyAdminProductForm(): AdminProductFormValues {
  return {
    name: '',
    price: '',
    stock: '',
    category: '',
    subCategory: '',
    concerns: [],
    isSensitiveSkin: false,
    description: '',
    advantages: '',
    composition: '',
  }
}

/** Create-mode validation — mirrors `createProductValidator`. */
export function validateAdminProductCreate(
  values: AdminProductFormValues,
): AdminProductFormErrors {
  const errors: AdminProductFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Product name is required'
  } else if (name.length < ADMIN_PRODUCT_NAME_MIN || name.length > ADMIN_PRODUCT_NAME_MAX) {
    errors.name = 'Name must be 2-200 characters'
  }

  if (values.price.trim() === '') {
    errors.price = 'Price is required'
  } else {
    const price = Number(values.price)
    if (!Number.isFinite(price) || price < 0) {
      errors.price = 'Price must be >= 0'
    }
  }

  if (values.stock.trim() === '') {
    errors.stock = 'Stock is required'
  } else {
    const stock = Number(values.stock)
    if (!Number.isInteger(stock) || stock < 0) {
      errors.stock = 'Stock must be >= 0'
    }
  }

  if (!values.category) {
    errors.category = 'Category is required'
  } else if (!isMongoId(values.category)) {
    errors.category = 'Invalid category id'
  }

  if (!values.subCategory) {
    errors.subCategory = 'subCategory must be an array with at least one id'
  } else if (!isMongoId(values.subCategory)) {
    errors.subCategory = 'Invalid subCategory id'
  }

  applyOptionalTextAndConcernErrors(values, errors)
  return errors
}

/** Update-mode validation — mirrors `updateProductValidator` (fields when present). */
export function validateAdminProductUpdate(
  values: AdminProductFormValues,
): AdminProductFormErrors {
  const errors: AdminProductFormErrors = {}
  const name = values.name.trim()

  if (name && (name.length < ADMIN_PRODUCT_NAME_MIN || name.length > ADMIN_PRODUCT_NAME_MAX)) {
    errors.name = 'Name must be 2-200 characters'
  }
  if (!name) {
    // Edit still requires a name in our UI (field always sent).
    errors.name = 'Product name is required'
  }

  if (values.price.trim() === '') {
    errors.price = 'Price is required'
  } else {
    const price = Number(values.price)
    if (!Number.isFinite(price) || price < 0) {
      errors.price = 'price must be >= 0'
    }
  }

  if (values.stock.trim() === '') {
    errors.stock = 'Stock is required'
  } else {
    const stock = Number(values.stock)
    if (!Number.isInteger(stock) || stock < 0) {
      errors.stock = 'stock must be >= 0'
    }
  }

  if (values.category && !isMongoId(values.category)) {
    errors.category = 'Invalid category id'
  }
  if (!values.category) {
    errors.category = 'Category is required'
  }

  if (values.subCategory && !isMongoId(values.subCategory)) {
    errors.subCategory = 'Invalid subCategory id'
  }
  if (!values.subCategory) {
    errors.subCategory = 'subCategory must be an array with at least one id'
  }

  applyOptionalTextAndConcernErrors(values, errors)
  return errors
}

function applyOptionalTextAndConcernErrors(
  values: AdminProductFormValues,
  errors: AdminProductFormErrors,
) {
  if (values.description.length > ADMIN_PRODUCT_TEXT_MAX) {
    errors.description = 'description max 2000 characters'
  }
  if (values.advantages.length > ADMIN_PRODUCT_TEXT_MAX) {
    errors.advantages = 'advantages max 2000 characters'
  }
  if (values.composition.length > ADMIN_PRODUCT_TEXT_MAX) {
    errors.composition = 'composition max 2000 characters'
  }

  const invalidConcern = values.concerns.some(
    (concern) => !ADMIN_PRODUCT_CONCERNS.includes(concern),
  )
  if (invalidConcern) {
    errors.concerns = `Each concern must be one of: ${ADMIN_PRODUCT_CONCERNS.join(', ')}`
  }
}

export function validateImageFile(file: File): string | null {
  if (!ADMIN_PRODUCT_IMAGE_TYPES.includes(file.type as (typeof ADMIN_PRODUCT_IMAGE_TYPES)[number])) {
    return 'Allowed image formats: jpeg, jpg, png, webp'
  }
  if (file.size > ADMIN_PRODUCT_FILE_MAX_BYTES) {
    return 'File must be at most 15MB'
  }
  return null
}

export function validateCatalogFile(file: File): string | null {
  if (
    !ADMIN_PRODUCT_CATALOG_TYPES.includes(
      file.type as (typeof ADMIN_PRODUCT_CATALOG_TYPES)[number],
    )
  ) {
    return 'Allowed catalog formats: jpeg, jpg, png, webp, pdf'
  }
  if (file.size > ADMIN_PRODUCT_FILE_MAX_BYTES) {
    return 'File must be at most 15MB'
  }
  return null
}
