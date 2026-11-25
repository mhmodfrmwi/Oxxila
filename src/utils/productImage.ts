/** Soft branded placeholder (bottle outline on lavender) when a product image URL is missing or fails to load. */
export const PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f1effa'/%3E%3Cg fill='none' stroke='%23c9c1ea' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='160' y='150' width='80' height='120' rx='18'/%3E%3Cpath d='M180 150v-22h40v22'/%3E%3Cpath d='M188 128v-14h24v14'/%3E%3C/g%3E%3C/svg%3E"

const CLOUDINARY_UPLOAD = '/image/upload/'

/**
 * Cloudinary originals can be several MB (e.g. 1254px PNGs shown at 220px). Ask the CDN for a
 * resized, auto-format (WebP/AVIF) copy instead; URLs that already carry a transformation, and
 * non-Cloudinary or vector images, are left untouched.
 */
export function optimizeImageUrl(url: string, width: number): string {
  if (!url.includes('res.cloudinary.com') || /\.(svg|gif)(\?|$)/i.test(url)) return url
  const at = url.indexOf(CLOUDINARY_UPLOAD)
  if (at === -1) return url
  const head = url.slice(0, at + CLOUDINARY_UPLOAD.length)
  const rest = url.slice(at + CLOUDINARY_UPLOAD.length)
  // A transformation segment looks like "w_300,c_fill" (contains "_" before any "/", no version "v123").
  if (/^[a-z]{1,3}_[^/]+\//i.test(rest)) return url
  return `${head}f_auto,q_auto,w_${width}/${rest}`
}

export function resolveProductImageUrl(src: string | undefined | null, width = 800): string {
  const trimmed = src?.trim()
  return trimmed ? optimizeImageUrl(trimmed, width) : PRODUCT_IMAGE_PLACEHOLDER
}
