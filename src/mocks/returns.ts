// src/mocks/returns.ts
/**
 * Temporary development preview data for Returns pages.
 * Remove this file (and hook preview branches) once UI review is done.
 *
 * Preview is NEVER automatic. Enable only via:
 * - `?preview=true` on the returns URL (dev builds only), or
 * - `VITE_ENABLE_RETURNS_PREVIEW=true` in a local `.env` (dev builds only)
 *
 * Production builds always ignore preview data.
 */
import type { EligibleReturnOrder, ReturnRequest } from '../api/returns'
import type { ShippingDistrict, ShippingGovernorate } from '../api/shipping'
import ctaProduct1 from '../assets/landing/sections/cta-image0_110_5881.webp'
import ctaProduct2 from '../assets/landing/sections/cta-image1_110_5881.webp'
import ctaProduct3 from '../assets/landing/sections/cta-image2_110_5881.jpg'
import ctaProduct4 from '../assets/landing/sections/cta-image3_110_5881.jpg'
import ctaProduct5 from '../assets/landing/sections/cta-image4_110_5881.webp'
import heroProductLeft from '../assets/landing/sections/hero-image3_110_4575.webp'
import heroProductRight from '../assets/landing/sections/hero-image2_110_4575.webp'
import concernAcne from '../assets/landing/image0_47_362.png'
import concernPigmentation from '../assets/landing/image1_47_362.webp'
import concernSensitive from '../assets/landing/image2_47_362.png'

const img = {
  vitaminC: ctaProduct1,
  serum: ctaProduct2,
  cream: ctaProduct3,
  cleanser: ctaProduct4,
  sunscreen: ctaProduct5,
  bottleA: heroProductLeft,
  bottleB: heroProductRight,
  acne: concernAcne,
  pigment: concernPigmentation,
  sensitive: concernSensitive,
} as const

/** Eligible orders for the Returns request form preview. */
export const PREVIEW_ELIGIBLE_RETURN_ORDERS: EligibleReturnOrder[] = [
  {
    _id: 'preview_order_77291aaaaa01',
    orderStatus: 'delivered',
    deliveredAt: '2024-02-15T14:20:00.000Z',
    daysSinceDelivery: 12,
    totalPrice: 318,
    paymentMethod: 'card',
    items: [
      {
        orderItemId: 'preview_item_b5',
        product: 'preview_product_b5',
        name: 'Advanced B5 Cell Repair',
        image: img.serum,
        price: 85,
        quantity: 1,
        purchasedQuantity: 1,
        returnableQuantity: 1,
      },
      {
        orderItemId: 'preview_item_glycolic',
        product: 'preview_product_glycolic',
        name: 'Glycolic Deep Cleanser',
        image: img.cleanser,
        price: 48,
        quantity: 2,
        purchasedQuantity: 2,
        returnableQuantity: 2,
      },
      {
        orderItemId: 'preview_item_vitc',
        product: 'preview_product_vitc',
        name: 'Vitamin C Brightening Day Cream',
        image: img.cream,
        price: 96,
        quantity: 1,
        purchasedQuantity: 1,
        returnableQuantity: 1,
      },
    ],
  },
  {
    _id: 'preview_order_88302bbbbb02',
    orderStatus: 'delivered',
    deliveredAt: '2024-02-10T09:05:00.000Z',
    daysSinceDelivery: 17,
    totalPrice: 412.5,
    paymentMethod: 'cod',
    items: [
      {
        orderItemId: 'preview_item_spf',
        product: 'preview_product_spf',
        name: 'Mineral SPF 50 Fluid',
        image: img.sunscreen,
        price: 72.5,
        quantity: 1,
        purchasedQuantity: 1,
        returnableQuantity: 1,
      },
      {
        orderItemId: 'preview_item_niacin',
        product: 'preview_product_niacin',
        name: 'Niacinamide Barrier Serum',
        image: img.bottleA,
        price: 110,
        quantity: 1,
        purchasedQuantity: 1,
        returnableQuantity: 1,
      },
      {
        orderItemId: 'preview_item_retinol',
        product: 'preview_product_retinol',
        name: 'Retinol Night Renewal',
        image: img.bottleB,
        price: 128,
        quantity: 1,
        purchasedQuantity: 1,
        returnableQuantity: 1,
      },
      {
        orderItemId: 'preview_item_calm',
        product: 'preview_product_calm',
        name: 'Calming Centella Gel',
        image: img.sensitive,
        price: 54,
        quantity: 2,
        purchasedQuantity: 2,
        returnableQuantity: 2,
      },
    ],
  },
]

/** Return history cards for the Tracking Status preview. */
export const PREVIEW_RETURN_HISTORY: ReturnRequest[] = [
  {
    _id: 'a1b2c3d4056f5b18',
    order: {
      _id: 'preview_order_77291aaaaa01',
      orderStatus: 'delivered',
      totalPrice: 318,
      paymentMethod: 'card',
    },
    items: [
      {
        orderItemId: 'preview_hist_1a',
        product: 'preview_product_vitc',
        name: 'Vitamin C Brightening Day Cream',
        variant: '50ml',
        price: 96,
        quantity: 1,
        image: img.cream,
      },
      {
        orderItemId: 'preview_hist_1b',
        product: 'preview_product_b5',
        name: 'Advanced B5 Cell Repair',
        variant: '30ml',
        price: 85,
        quantity: 1,
        image: img.serum,
      },
      {
        orderItemId: 'preview_hist_1c',
        product: 'preview_product_glycolic',
        name: 'Glycolic Deep Cleanser',
        variant: '150ml',
        price: 48,
        quantity: 1,
        image: img.cleanser,
      },
      {
        orderItemId: 'preview_hist_1d',
        product: 'preview_product_spf',
        name: 'Mineral SPF 50 Fluid',
        variant: '40ml',
        price: 72.5,
        quantity: 1,
        image: img.sunscreen,
      },
      {
        orderItemId: 'preview_hist_1e',
        product: 'preview_product_calm',
        name: 'Calming Centella Gel',
        variant: '100ml',
        price: 54,
        quantity: 1,
        image: img.sensitive,
      },
    ],
    reason: 'damaged_item',
    note: 'Bottle arrived cracked; product leaked into packaging.',
    refundStatus: 'pending',
    refundAmount: 855.75,
    logisticsHandler: null,
    carrier: null,
    createdAt: '2026-05-23T10:15:00.000Z',
  },
  {
    _id: 'b2c3d4e5089a1c22',
    order: {
      _id: 'preview_order_88302bbbbb02',
      orderStatus: 'delivered',
      totalPrice: 412.5,
      paymentMethod: 'cod',
    },
    items: [
      {
        orderItemId: 'preview_hist_2a',
        product: 'preview_product_niacin',
        name: 'Niacinamide Barrier Serum',
        variant: '30ml',
        price: 110,
        quantity: 1,
        image: img.bottleA,
      },
      {
        orderItemId: 'preview_hist_2b',
        product: 'preview_product_retinol',
        name: 'Retinol Night Renewal',
        variant: '20ml',
        price: 128,
        quantity: 1,
        image: img.bottleB,
      },
    ],
    reason: 'wrong_product',
    note: 'Received shade/variant different from order confirmation.',
    refundStatus: 'received',
    refundAmount: 396,
    logisticsHandler: 'bosta',
    carrier: { name: 'Bosta', code: 'bosta' },
    bostaTrackingNumber: '4104304908',
    bostaStateLabel: 'Pickup requested',
    logisticsNotes: 'Pickup requested',
    createdAt: '2026-05-18T16:40:00.000Z',
  },
  {
    _id: 'c3d4e5f6012b3d44',
    order: {
      _id: 'preview_order_77291aaaaa01',
      orderStatus: 'delivered',
    },
    items: [
      {
        orderItemId: 'preview_hist_3a',
        product: 'preview_product_acne',
        name: 'Salicylic Clearing Toner',
        variant: '200ml',
        price: 64,
        quantity: 1,
        image: img.acne,
      },
    ],
    reason: 'allergic_reaction',
    note: 'Mild redness after first use; photos attached in original request.',
    refundStatus: 'approved',
    refundAmount: 64,
    logisticsHandler: 'bosta',
    carrier: { name: 'Bosta', code: 'bosta' },
    createdAt: '2026-05-12T11:05:00.000Z',
  },
  {
    _id: 'd4e5f607123c4e55',
    order: {
      _id: 'preview_order_88302bbbbb02',
      orderStatus: 'delivered',
    },
    items: [
      {
        orderItemId: 'preview_hist_4a',
        product: 'preview_product_pigment',
        name: 'Pigment Corrector Ampoule',
        variant: '15ml',
        price: 145,
        quantity: 1,
        image: img.pigment,
      },
      {
        orderItemId: 'preview_hist_4b',
        product: 'preview_product_vitc',
        name: 'Vitamin C Brightening Day Cream',
        variant: '50ml',
        price: 96,
        quantity: 2,
        image: img.cream,
      },
    ],
    reason: 'expired_product',
    note: 'Expiry date was within 30 days of delivery.',
    refundStatus: 'picked_up',
    refundAmount: 337,
    logisticsHandler: 'bosta',
    carrier: { name: 'Bosta', code: 'bosta' },
    bostaTrackingNumber: '4104988123',
    bostaStateLabel: 'Out for pickup',
    createdAt: '2026-05-08T08:22:00.000Z',
  },
  {
    _id: 'e5f60718234d5f66',
    order: {
      _id: 'preview_order_77291aaaaa01',
      orderStatus: 'delivered',
    },
    items: [
      {
        orderItemId: 'preview_hist_5a',
        product: 'preview_product_glycolic',
        name: 'Glycolic Deep Cleanser',
        variant: '150ml',
        price: 48,
        quantity: 1,
        image: img.cleanser,
      },
    ],
    reason: 'changed_mind',
    note: '',
    refundStatus: 'refunded',
    refundAmount: 48,
    refundedAt: '2026-04-28T13:00:00.000Z',
    logisticsHandler: 'bosta',
    carrier: { name: 'Bosta', code: 'bosta' },
    bostaTrackingNumber: '4104011002',
    bostaStateLabel: 'Delivered to warehouse',
    createdAt: '2026-04-20T19:10:00.000Z',
  },
  {
    _id: 'f6071829345e6a77',
    order: {
      _id: 'preview_order_88302bbbbb02',
      orderStatus: 'delivered',
    },
    items: [
      {
        orderItemId: 'preview_hist_6a',
        product: 'preview_product_spf',
        name: 'Mineral SPF 50 Fluid',
        variant: '40ml',
        price: 72.5,
        quantity: 1,
        image: img.sunscreen,
      },
      {
        orderItemId: 'preview_hist_6b',
        product: 'preview_product_b5',
        name: 'Advanced B5 Cell Repair',
        variant: '30ml',
        price: 85,
        quantity: 1,
        image: img.serum,
      },
    ],
    reason: 'other',
    note: 'Packaging seal was already open on arrival.',
    refundStatus: 'rejected',
    refundAmount: 157.5,
    adminNote: 'Evidence did not meet return policy requirements.',
    logisticsHandler: 'internal',
    carrier: null,
    createdAt: '2026-04-14T12:45:00.000Z',
  },
]

export function isReturnsPreviewEnabled(searchParams?: URLSearchParams | null): boolean {
  // Production / preview builds must never render shared mock returns.
  if (!import.meta.env.DEV) return false

  if (import.meta.env.VITE_ENABLE_RETURNS_PREVIEW === 'true') return true

  if (searchParams?.get('preview') === 'true') return true

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('preview') === 'true') return true
  }

  return false
}

export function resolveEligibleOrdersOrPreview(
  apiData: EligibleReturnOrder[] | null | undefined,
  previewEnabled = false,
): { orders: EligibleReturnOrder[]; usingPreview: boolean } {
  if (apiData && apiData.length > 0) {
    return { orders: apiData, usingPreview: false }
  }

  if (previewEnabled) {
    return { orders: PREVIEW_ELIGIBLE_RETURN_ORDERS, usingPreview: true }
  }

  return { orders: [], usingPreview: false }
}

export function resolveReturnHistoryOrPreview(
  apiData: ReturnRequest[] | null | undefined,
  previewEnabled = false,
): { returns: ReturnRequest[]; usingPreview: boolean } {
  if (apiData && apiData.length > 0) {
    return { returns: apiData, usingPreview: false }
  }

  if (previewEnabled) {
    return { returns: PREVIEW_RETURN_HISTORY, usingPreview: true }
  }

  return { returns: [], usingPreview: false }
}

/** Soft shipping options so the request form remains usable in preview. */
export const PREVIEW_GOVERNORATES: ShippingGovernorate[] = [
  { _id: 'preview_gov_cairo', name: 'Cairo' },
  { _id: 'preview_gov_giza', name: 'Giza' },
]

export const PREVIEW_DISTRICTS_BY_GOVERNORATE: Record<string, ShippingDistrict[]> = {
  preview_gov_cairo: [
    { _id: 'preview_dist_nasr', name: 'Nasr City' },
    { _id: 'preview_dist_heliopolis', name: 'Heliopolis' },
  ],
  preview_gov_giza: [
    { _id: 'preview_dist_dokki', name: 'Dokki' },
    { _id: 'preview_dist_mohandessin', name: 'Mohandessin' },
  ],
}

