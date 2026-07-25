// src/utils/adminProductsFormat.ts
import type {
  AdminProductInventoryStatus,
  AdminProductRow,
  AdminProductSource,
} from '../types/adminProducts'
import { resolveDashboardLocale } from './adminDashboardFormat'

/** Matches dashboard low-stock threshold. */
export const ADMIN_LOW_STOCK_THRESHOLD = 10

/**
 * Visual scale for inventory bars only — not a business capacity field.
 * Progress is capped at 100% for large inventories.
 */
const INVENTORY_FULL_STOCK = 190

export function resolveProductListPrice(product: AdminProductSource): number {
  const discounted = product.priceAfterDiscount
  if (discounted != null && discounted >= 0) {
    const endsAt = product.offerEndsAt ? new Date(product.offerEndsAt).getTime() : null
    if (endsAt == null || endsAt > Date.now()) return discounted
  }
  return product.price
}

export function resolveInventoryStatus(stock: number): AdminProductInventoryStatus {
  if (stock <= 0) return 'out_of_stock'
  if (stock <= ADMIN_LOW_STOCK_THRESHOLD) return 'low_stock'
  return 'in_stock'
}

export function resolveInventoryProgress(stock: number): number {
  if (stock <= 0) return 0
  return Math.min(Math.round((stock / INVENTORY_FULL_STOCK) * 100), 100)
}

export function formatAdminProductPrice(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(resolveDashboardLocale(locale), {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatAdminStockCount(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(resolveDashboardLocale(locale), {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPerformancePercent(
  value: number | null,
  locale = 'en',
): string | null {
  if (value == null) return null
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat(resolveDashboardLocale(locale), {
    maximumFractionDigits: 0,
  }).format(abs)
  if (value > 0) return `+${formatted}%`
  if (value < 0) return `-${formatted}%`
  return `${formatted}%`
}

export function mapApiProductToAdminRow(product: AdminProductSource): AdminProductRow {
  const stock =
    typeof product.stock === 'number' && Number.isFinite(product.stock)
      ? Math.max(0, product.stock)
      : 0
  const category =
    product.category && typeof product.category === 'object' ? product.category : null
  const image = product.images?.find((src) => typeof src === 'string' && src.trim()) ?? null

  return {
    id: product._id,
    name: product.name?.trim() || '—',
    image,
    /** Backend has no SKU field — never synthesize one. */
    sku: null,
    categoryId: category?._id ?? null,
    categoryName: category?.name?.trim() || null,
    stock,
    inventoryStatus: resolveInventoryStatus(stock),
    inventoryProgress: resolveInventoryProgress(stock),
    price: resolveProductListPrice(product),
    soldCount: product.soldCount ?? 0,
    isBestSeller: Boolean(product.isBestSeller),
    /** Backend list API has no period-over-period performance metric. */
    performancePercent: null,
  }
}

export function categoryBadgeTone(categoryId: string | null): 'accent' | 'neutral' {
  if (!categoryId) return 'neutral'
  let hash = 0
  for (let i = 0; i < categoryId.length; i += 1) {
    hash = (hash + categoryId.charCodeAt(i) * (i + 1)) % 2
  }
  return hash === 0 ? 'accent' : 'neutral'
}
