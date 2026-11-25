// src/utils/catalogDisplayName.ts
import { resolveActiveLocale } from './activeLocale'
import { arabicNameBySlug } from './catalogLocaleNames'

export interface BilingualNameFields {
  name?: string | null
  nameEn?: string | null
  nameAr?: string | null
  slug?: string | null
}

export type CatalogNameKind = 'category' | 'subcategory' | 'brand' | 'product'

function resolveLocale(locale?: unknown): string {
  return resolveActiveLocale(locale)
}

/** Pick display name from bilingual catalog fields for the active locale. */
export function catalogDisplayName(
  entity: BilingualNameFields | null | undefined,
  locale?: string | null,
  kind: CatalogNameKind = 'product',
): string {
  if (!entity) return ''
  const isAr = resolveLocale(locale).toLowerCase().startsWith('ar')
  const en = (entity.nameEn || entity.name || '').trim()
  const ar = (entity.nameAr || '').trim()

  if (isAr) {
    if (ar) return ar
    // API may omit nameAr (strict schema on older deploys) — use slug map.
    if (kind !== 'product') {
      const bySlug = arabicNameBySlug(kind, entity.slug)
      if (bySlug) return bySlug
    }
    return en
  }

  return en || ar
}
