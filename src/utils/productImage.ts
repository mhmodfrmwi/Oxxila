/** Neutral placeholder when a product image URL is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23ececef" width="400" height="400"/%3E%3C/svg%3E'

export function resolveProductImageUrl(src: string | undefined | null): string {
  const trimmed = src?.trim()
  return trimmed || PRODUCT_IMAGE_PLACEHOLDER
}
