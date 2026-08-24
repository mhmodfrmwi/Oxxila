export interface ProductImage {
  src: string
  alt: string
}

export interface ProductDetail {
  id: string
  slug: string
  href: string
  brand: string
  brandLogo?: string
  /** Link to brand-filtered search, when brand id is known. */
  brandHref?: string
  title: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  imageAlt: string
  badge?: string
  /** ISO date string — format with i18n on the product page */
  offerEndsAt?: string
  /** @deprecated Prefer formatting offerEndsAt in the UI */
  offerEndsLabel?: string
  soldCount?: number
  subCategoryName?: string
  categoryName: string
  categoryHref: string
  description: string
  advantages: string[]
  composition: string[]
  images: ProductImage[]
  beforeAfterImages: ProductImage[]
  sizes: string[]
  shades?: string[]
  sku: string
  availability: string
  tags: string[]
  stockCount: number
  deliveryEstimate?: string
  discountPercent?: number
}
