// src/components/checkout/OrderConfirmationContent.tsx
import { Check, Clock, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { useOrderConfirmationPage } from '../../hooks/useOrderConfirmationPage'
import {
  formatOrderDate,
  formatOrderReferenceId,
  formatOrderShippingAddress,
  getOrderTrackingNumber,
} from '../../utils/orderFormat'
import {
  formatEstimatedDeliveryRange,
  getOrderShippingMethodLabel,
  hasOrderDeliveryEstimate,
} from '../../utils/orderDelivery'
import { formatCartPrice } from '../../utils/formatProductPrice'
import type { ApiOrder } from '../../types/order'
import { OrderSummarySection } from '../order/OrderSummarySection'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { Button } from '../ui/Button'
import { CheckoutStepper } from './CheckoutStepper'
import { OrderStatusStepper } from './OrderStatusStepper'

function ConfirmationSkeleton() {
  return (
    <div className="order-confirmation-skeleton space-y-6" aria-hidden>
      <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-surface-muted" />
      <div className="mx-auto h-8 w-72 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  )
}

function translatePaymentMethod(order: ApiOrder, t: (key: string) => string) {
  if (order.paymentMethod === 'cod') return t('checkout.payment.cod')
  if (order.paymentProvider === 'paymob') return 'Paymob'
  if (order.paymentProvider === 'stripe') return 'Stripe'
  return t('checkout.payment.card')
}

export function OrderConfirmationContent() {
  const { t } = useTranslation()
  const {
    isAuthenticated,
    loginPath,
    order,
    customerName,
    customerEmail,
    loading,
    error,
    handleContinueShopping,
    handleTrackOrder,
  } = useOrderConfirmationPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  if (!loading && !order && !error) {
    return <Navigate to={SHOP_PATH} replace />
  }

  const trackingNumber = order ? getOrderTrackingNumber(order) : null
  const deliveryRange = order ? formatEstimatedDeliveryRange(order) : null
  const hasDeliveryEstimate = order ? hasOrderDeliveryEstimate(order) : false
  const shippingMethodLabel = order
    ? getOrderShippingMethodLabel(order, t('checkout.confirmation.standardShipping'))
    : ''

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <CheckoutStepper currentStep="confirmation" className="mb-6 sm:mb-8" />

        {loading ? (
          <ConfirmationSkeleton />
        ) : error ? (
          <FormMessage message={error} />
        ) : order ? (
          <div className="mx-auto max-w-4xl">
            <section
              className="order-confirmation-success"
              aria-label={t('checkout.confirmation.ariaLabel')}
            >
              <div className="order-confirmation-icon" aria-hidden>
                <Check size={36} strokeWidth={2} />
              </div>

              <h1 className="order-confirmation-title">{t('checkout.confirmation.thankYou')}</h1>
              <p className="order-confirmation-order-id">
                {t('checkout.confirmation.orderHash', {
                  id: trackingNumber ?? formatOrderReferenceId(order),
                })}
              </p>
              <p className="order-confirmation-message">
                {t('checkout.confirmation.emailSent', {
                  email: customerEmail || t('checkout.confirmation.yourEmail'),
                })}
              </p>

              <dl className="order-confirmation-meta">
                <div className="order-confirmation-meta-item">
                  <strong>{t('checkout.confirmation.orderNumber')}</strong>
                  <span>#{formatOrderReferenceId(order)}</span>
                </div>
                {trackingNumber && (
                  <div className="order-confirmation-meta-item">
                    <strong>{t('checkout.confirmation.trackingNumber')}</strong>
                    <span>{trackingNumber}</span>
                  </div>
                )}
                {hasDeliveryEstimate && deliveryRange && (
                  <div className="order-confirmation-meta-item">
                    <strong>{t('checkout.delivery.estimatedDelivery')}</strong>
                    <span>{deliveryRange}</span>
                  </div>
                )}
                <div className="order-confirmation-meta-item">
                  <strong>{t('checkout.confirmation.paymentMethod')}</strong>
                  <span>{translatePaymentMethod(order, t)}</span>
                </div>
                <div className="order-confirmation-meta-item">
                  <strong>{t('checkout.confirmation.deliveryAddress')}</strong>
                  <span>{formatOrderShippingAddress(order)}</span>
                </div>
              </dl>
            </section>

            <div className="order-confirmation-card">
              <div className="order-confirmation-card-grid">
                <div className="order-confirmation-details">
                  <p className="order-confirmation-section-label">
                    {t('checkout.confirmation.shippingTo')}
                  </p>
                  <p className="order-confirmation-recipient">
                    {customerName || t('checkout.confirmation.customer')}
                  </p>
                  <p className="order-confirmation-address">
                    {formatOrderShippingAddress(order)}
                  </p>

                  {hasDeliveryEstimate && (
                    <>
                      <p className="order-confirmation-section-label">
                        {t('checkout.confirmation.deliveryMethod')}
                      </p>
                      <div className="order-confirmation-delivery">
                        <span className="order-confirmation-delivery-icon" aria-hidden>
                          <Truck size={18} strokeWidth={1.75} />
                        </span>
                        <div>
                          <p className="order-confirmation-delivery-title">{shippingMethodLabel}</p>
                          {deliveryRange && (
                            <p className="order-confirmation-delivery-subtitle">
                              {t('checkout.confirmation.estimatedArrival', { range: deliveryRange })}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="order-confirmation-divider" />

                  <dl className="order-confirmation-details-list">
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.orderDate')}</dt>
                      <dd>{formatOrderDate(order.createdAt)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.paymentMethod')}</dt>
                      <dd>{translatePaymentMethod(order, t)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.totalAmount')}</dt>
                      <dd>{formatCartPrice(order.totalPrice)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="order-confirmation-summary">
                  <OrderSummarySection order={order} />
                </div>
              </div>
            </div>

            <OrderStatusStepper order={order} />

            <div className="order-confirmation-actions">
              <Button
                type="button"
                variant="primary"
                className="order-confirmation-action w-full sm:w-auto"
                onClick={handleTrackOrder}
              >
                <Clock size={16} strokeWidth={1.75} aria-hidden />
                {t('checkout.confirmation.trackOrder')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="order-confirmation-action w-full sm:w-auto"
                onClick={handleContinueShopping}
              >
                {t('actions.continueShopping')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </>
  )
}
