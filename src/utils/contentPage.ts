// src/utils/contentPage.ts
import type { ApiContentPage } from '../api/settings'

const ADMIN_PLACEHOLDER_RE =
  /update\s+(this|these)\s+.+?\s+from\s+the\s+admin|Website Content tab|check back shortly/i

/** Split plain CMS text into paragraphs (blank-line or single-newline separated). */
export function plainTextParagraphs(value: string | null | undefined): string[] {
  const text = String(value ?? '').trim()
  if (!text) return []
  if (ADMIN_PLACEHOLDER_RE.test(text)) return []
  const blocks = text.includes('\n\n')
    ? text.split(/\n{2,}/)
    : text.split(/\n/)
  return blocks.map((part) => part.trim()).filter(Boolean)
}

export function pageHasSections(
  page: Pick<ApiContentPage, 'sections'> | null | undefined,
): boolean {
  return Boolean(
    page?.sections?.some(
      (section) =>
        section.title.trim() ||
        section.body.trim() ||
        (section.items?.length ?? 0) > 0,
    ),
  )
}

/** True when the page has no meaningful sections for the storefront. */
export function isEmptyContentPage(
  page: Pick<ApiContentPage, 'sections'> | null | undefined,
): boolean {
  if (!page) return true
  return !pageHasSections(page)
}
