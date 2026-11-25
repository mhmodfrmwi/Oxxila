/** Soft branded placeholder (bottle outline on lavender) when a product image URL is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f1effa'/%3E%3Cg fill='none' stroke='%23c9c1ea' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='160' y='150' width='80' height='120' rx='18'/%3E%3Cpath d='M180 150v-22h40v22'/%3E%3Cpath d='M188 128v-14h24v14'/%3E%3C/g%3E%3C/svg%3E"

export function resolveProductImageUrl(src: string | undefined | null): string {
  const trimmed = src?.trim()
  return trimmed || PRODUCT_IMAGE_PLACEHOLDER
}
