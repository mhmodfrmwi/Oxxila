// src/utils/orderFormat.ts
import type { ApiOrder } from '../types/order'
import {
  formatOrderReferenceId,
  getOrderTrackingNumber,
} from './orderTracking'

export { formatEstimatedDeliveryRange, formatEstimatedDeliveryArrival } from './orderDelivery'
export {
  formatOrderReferenceId,
  getOrderTrackingNumber,
  getOrderStatusDisplaySteps,
  getTrackOrderStatusSteps,
  canCancelOrder,
} from './orderTracking'

export function formatOrderDisplayId(order: ApiOrder) {
  return getOrderTrackingNumber(order) ?? formatOrderReferenceId(order)
}

export function formatOrderShippingAddress(order: ApiOrder) {
  const { shippingAddress } = order
  return `${shippingAddress.addressLine}, ${shippingAddress.districtName}, ${shippingAddress.governorateName}, ${shippingAddress.countryName}`
}

export function formatOrderPaymentMethod(order: ApiOrder) {
  if (order.paymentMethod === 'cod') return 'Cash on delivery'
  if (order.paymentProvider === 'paymob') return 'Paymob'
  if (order.paymentProvider === 'stripe') return 'Stripe'
  return 'Card'
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function orderToSummaryCart(order: ApiOrder) {
  return {
    items: order.items.map((item) => ({
      _id: `${item.product}-${item.name}`,
      product: {
        _id: item.product,
        name: item.name,
        images: item.image ? [item.image] : [],
        price: item.price,
        priceAfterDiscount: null,
        stock: item.quantity,
        isActive: true,
      },
      quantity: item.quantity,
      price: item.price,
    })),
    couponCode: order.couponCode,
    discountAmount: order.discountAmount,
    storeCreditBalance: 0,
    storeCreditApplied: order.storeCreditApplied,
    subtotal: order.subtotal,
    totalPrice: order.totalPrice,
  }
}

export function getOrderSummaryProps(order: ApiOrder) {
  return {
    cart: orderToSummaryCart(order),
  }
}

export function formatOrderShippingAddressLines(order: ApiOrder) {
  const { shippingAddress } = order
  return [
    shippingAddress.addressLine,
    shippingAddress.districtName,
    `${shippingAddress.governorateName}, ${shippingAddress.countryName}`,
  ]
}
