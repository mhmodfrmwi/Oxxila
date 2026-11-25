// src/utils/formatProductPrice.ts
import { resolveActiveLocale } from './activeLocale'

function resolveLocale(locale?: unknown): string {
  return resolveActiveLocale(locale)
}

function currencyLabel(locale?: string | null): string {
  return resolveLocale(locale).toLowerCase().startsWith('ar') ? 'ج.م' : 'EGP'
}

function formatAmount(value: number, fractionDigits?: number): string {
  if (fractionDigits != null) {
    return value.toFixed(fractionDigits)
  }
  return value % 1 === 0 ? `${value}` : value.toFixed(2)
}

export function formatProductPrice(value: number, locale?: string | null) {
  return `${formatAmount(value)} ${currencyLabel(locale)}`
}

/** Product detail card — amount then currency: `232.56 EGP` */
export function formatProductPriceDetail(value: number, locale?: string | null) {
  return `${formatAmount(value)} ${currencyLabel(locale)}`
}

/** Cart / checkout — `252.5 EGP` / `210.0 EGP` */
export function formatCartPrice(value: number, locale?: string | null) {
  const amount =
    value % 1 === 0
      ? value.toFixed(1)
      : (value * 10) % 1 === 0
        ? value.toFixed(1)
        : value.toFixed(2)
  return `${amount} ${currencyLabel(locale)}`
}
