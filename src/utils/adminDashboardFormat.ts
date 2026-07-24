// src/utils/adminDashboardFormat.ts
import type {
  DashboardLowStockItem,
  DashboardLowStockSection,
  DashboardOrderStatusBadge,
} from '../types/adminDashboard'
import type { StatusBadgeTone } from '../components/admin/ui/StatusBadge'
import type { StatTrendTone } from '../components/admin/ui/StatCard'

/**
 * Normalize GET /dashboard `lowStock` — API returns `{ threshold, alertCount, items }`.
 * Accepts a bare array for resilience against older payloads.
 */
export function getDashboardLowStockItems(
  lowStock: DashboardLowStockSection | DashboardLowStockItem[] | null | undefined,
): DashboardLowStockItem[] {
  if (!lowStock) return []
  if (Array.isArray(lowStock)) return lowStock
  return Array.isArray(lowStock.items) ? lowStock.items : []
}

/** Low-stock card should only list products below the alert threshold. */
export function getDashboardLowStockAlerts(
  lowStock: DashboardLowStockSection | DashboardLowStockItem[] | null | undefined,
  limit = 5,
): DashboardLowStockItem[] {
  const items = getDashboardLowStockItems(lowStock)
  const alerts = items.filter((item) => item.isAlert === true || item.isCritical)
  return alerts.slice(0, limit)
}

/** Normalize i18n language tags for Intl (e.g. `ar` → `ar-EG`). */
export function resolveDashboardLocale(language: string): string {
  const base = language.split('-')[0]?.toLowerCase()
  if (base === 'ar') return 'ar-EG'
  return 'en-US'
}

export function formatDashboardMoney(value: number, locale = 'en'): string {
  const resolved = resolveDashboardLocale(locale)
  const abs = Math.abs(value)
  return new Intl.NumberFormat(resolved, {
    style: 'currency',
    currency: 'USD',
    notation: abs >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: abs >= 100 ? 0 : 2,
    minimumFractionDigits: abs > 0 && abs < 100 ? 2 : 0,
  }).format(value)
}

export function formatDashboardNumber(value: number, locale = 'en'): string {
  const resolved = resolveDashboardLocale(locale)
  const abs = Math.abs(value)
  return new Intl.NumberFormat(resolved, {
    notation: abs >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: abs >= 1_000_000 ? 1 : 0,
  }).format(value)
}

export function formatDashboardPercent(value: number, locale = 'en'): string {
  return `${new Intl.NumberFormat(resolveDashboardLocale(locale), {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value)}%`
}

export function formatTrendLabel(trend: number, locale = 'en'): string {
  const abs = Math.abs(trend)
  const formatted = new Intl.NumberFormat(resolveDashboardLocale(locale), {
    maximumFractionDigits: 1,
  }).format(abs)
  if (trend > 0) return `+${formatted}%`
  if (trend < 0) return `-${formatted}%`
  return `${formatted}%`
}

export function trendTone(trend: number): StatTrendTone {
  if (trend > 0) return 'positive'
  if (trend < 0) return 'negative'
  return 'neutral'
}

/** Abandoned-cart increases are undesirable — invert visual tone. */
export function invertedTrendTone(trend: number): StatTrendTone {
  if (trend > 0) return 'negative'
  if (trend < 0) return 'positive'
  return 'neutral'
}

export function orderStatusTone(status: DashboardOrderStatusBadge): StatusBadgeTone {
  switch (status) {
    case 'PAID':
    case 'DELIVERED':
    case 'CONFIRMED':
      return 'success'
    case 'SHIPPED':
      return 'info'
    case 'PROCESSING':
    case 'PENDING':
      return 'warning'
    case 'CANCELLED':
    case 'REFUNDED':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function formatOrderId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, '')
  const short = (cleaned.slice(-4) || id.slice(-4)).toUpperCase()
  return `#OX-${short}`
}

export function formatDashboardDate(value: string, locale = 'en'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(resolveDashboardLocale(locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/** Relative time matching Figma (“2 min ago”). Falls back to absolute date. */
export function formatRelativeTime(
  value: string,
  locale = 'en',
  now = Date.now(),
): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const diffSeconds = Math.round((date.getTime() - now) / 1000)
  const absSeconds = Math.abs(diffSeconds)

  if (absSeconds < 60) {
    return new Intl.RelativeTimeFormat(resolveDashboardLocale(locale), {
      numeric: 'auto',
    }).format(diffSeconds, 'second')
  }

  const rtf = new Intl.RelativeTimeFormat(resolveDashboardLocale(locale), {
    numeric: 'auto',
  })

  if (absSeconds < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute')
  if (absSeconds < 86_400) return rtf.format(Math.round(diffSeconds / 3600), 'hour')
  if (absSeconds < 86_400 * 7) return rtf.format(Math.round(diffSeconds / 86_400), 'day')

  return formatDashboardDate(value, locale)
}

/** Cap chart bars for readability when the API returns a dense daily series. */
export function sampleRevenuePoints<T>(points: readonly T[], maxBars = 16): T[] {
  if (points.length <= maxBars) return [...points]
  const lastIndex = points.length - 1
  const sampled: T[] = []
  for (let i = 0; i < maxBars; i += 1) {
    const index = Math.round((i / (maxBars - 1)) * lastIndex)
    sampled.push(points[index]!)
  }
  return sampled
}
