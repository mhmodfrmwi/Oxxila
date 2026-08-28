// src/utils/orderDelivery.ts
import type { ApiOrder } from '../types/order'
import i18n from '../i18n'

export function hasOrderDeliveryEstimate(order: ApiOrder): boolean {
  return Boolean(order.delivery?.estimatedFrom && order.delivery?.estimatedTo)
}

export function formatEstimatedDeliveryRange(order: ApiOrder): string | null {
  const delivery = order.delivery
  if (!delivery) return null

  if (delivery.deliveryDaysLabel?.trim()) {
    return delivery.deliveryDaysLabel.trim()
  }

  if (delivery.minBusinessDays != null && delivery.maxBusinessDays != null) {
    return i18n.t('checkout.delivery.businessDaysRange', {
      min: delivery.minBusinessDays,
      max: delivery.maxBusinessDays,
    })
  }

  return null
}

export function formatEstimatedDeliveryArrival(order: ApiOrder): string | null {
  const delivery = order.delivery
  if (!delivery?.estimatedFrom || !delivery?.estimatedTo) return null

  const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-US'
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  })

  return `${formatter.format(new Date(delivery.estimatedFrom))} – ${formatter.format(new Date(delivery.estimatedTo))}`
}

export function getOrderShippingMethodLabel(
  order: ApiOrder,
  fallback: string,
): string {
  return (
    order.delivery?.carrierName?.trim() ||
    order.shipment?.carrierName?.trim() ||
    order.tracking?.carrierName?.trim() ||
    fallback
  )
}
