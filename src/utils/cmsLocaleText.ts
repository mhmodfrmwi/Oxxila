// src/utils/cmsLocaleText.ts
import { resolveActiveLocale } from './activeLocale'

function resolveLocale(locale?: unknown): string {
  return resolveActiveLocale(locale)
}

export function isArabicLocale(locale?: string | null): boolean {
  return resolveLocale(locale).toLowerCase().startsWith('ar')
}

/**
 * Pick CMS copy from bilingual En/Ar fields.
 * `crossFallback` (default true): if locale field empty, use the other language.
 * Set false for UI chrome so callers can fall back to i18n instead of the wrong language.
 */
export function cmsLocaleText(
  fields: {
    en?: string | null
    ar?: string | null
    legacy?: string | null
  },
  locale?: string | null,
  options?: { crossFallback?: boolean },
): string {
  const crossFallback = options?.crossFallback !== false
  const en = (fields.en || fields.legacy || '').trim()
  const ar = (fields.ar || '').trim()
  if (isArabicLocale(locale)) return ar || (crossFallback ? en : '')
  return en || (crossFallback ? ar : '')
}
