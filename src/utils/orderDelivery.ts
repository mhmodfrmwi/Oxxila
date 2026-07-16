// src/utils/orderDelivery.ts
import type { ApiOrder } from '../types/order'
import i18n from '../i18n'

export const ESTIMATED_DELIVERY_BUSINESS_DAYS = {
  min: 3,
  max: 5,
} as const

export interface EstimatedDeliveryWindow {
  orderDate: Date
  minDate: Date
  maxDate: Date
  businessDays: typeof ESTIMATED_DELIVERY_BUSINESS_DAYS
}

export function addBusinessDays(from: Date, businessDays: number): Date {
  const date = new Date(from)
  let added = 0

  while (added < businessDays) {
    date.setDate(date.getDate() + 1)
    const weekday = date.getDay()
    if (weekday !== 0 && weekday !== 6) added++
  }

  return date
}

export function calculateEstimatedDelivery(order: ApiOrder): EstimatedDeliveryWindow {
  const orderDate = new Date(order.createdAt)

  return {
    orderDate,
    minDate: addBusinessDays(orderDate, ESTIMATED_DELIVERY_BUSINESS_DAYS.min),
    maxDate: addBusinessDays(orderDate, ESTIMATED_DELIVERY_BUSINESS_DAYS.max),
    businessDays: ESTIMATED_DELIVERY_BUSINESS_DAYS,
  }
}

export function formatEstimatedDeliveryRange(order: ApiOrder): string {
  const { businessDays } = calculateEstimatedDelivery(order)
  return i18n.t('checkout.delivery.businessDaysRange', {
    min: businessDays.min,
    max: businessDays.max,
  })
}

export function formatEstimatedDeliveryArrival(order: ApiOrder): string {
  const { minDate, maxDate } = calculateEstimatedDelivery(order)
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${formatter.format(minDate)} – ${formatter.format(maxDate)}`
}
