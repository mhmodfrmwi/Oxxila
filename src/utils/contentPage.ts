// src/utils/contentPage.ts

const ADMIN_PLACEHOLDER_RE =
  /update\s+(this|these)\s+.+?\s+from\s+the\s+admin\s+dashboard/i

/** Strip tags so we can judge whether CMS HTML is meaningfully filled. */
function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Backend seeds policies with "Update this … from the admin dashboard."
 * Treat those (and empty bodies) as unpublished-looking empty states on the storefront.
 */
export function isPlaceholderContent(content: string | null | undefined): boolean {
  const text = stripHtml(content ?? '')
  if (!text) return true
  return ADMIN_PLACEHOLDER_RE.test(text)
}
