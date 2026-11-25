// src/components/checkout/OrderConfirmationContent.tsx
import { motion, useReducedMotion } from 'framer-motion'
import { Clock, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { useDeliveryNote } from '../../hooks/useDeliveryNote'
import { useOrderConfirmationPage } from '../../hooks/useOrderConfirmationPage'
import {
  formatOrderDate,
  formatOrderReferenceId,
  formatOrderShippingAddressLines,
  getOrderTrackingNumber,
} from '../../utils/orderFormat'
import { formatCartPrice } from '../../utils/formatProductPrice'
import type { ApiOrder } from '../../types/order'
import { OrderSummarySection } from '../order/OrderSummarySection'
import { ShippingContactDetails } from '../order/ShippingContactDetails'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { BrandLoader } from '../ui/BrandLoader'
import { Button } from '../ui/Button'
import { CheckoutStepper } from './CheckoutStepper'
import { OrderStatusStepper } from './OrderStatusStepper'

function translatePaymentMethod(order: ApiOrder, t: (key: string) => string) {
  if (order.paymentMethod === 'cod') return t('checkout.payment.cod')
  if (order.paymentProvider === 'paymob') return 'Paymob'
  if (order.paymentProvider === 'stripe') return 'Stripe'
  return t('checkout.payment.card')
}

export function OrderConfirmationContent() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const deliveryNote = useDeliveryNote()
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

  // Staggered entrance; collapses to an instant render for prefers-reduced-motion.
  const rise = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay: 0.15 + index * 0.1, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <CheckoutStepper currentStep="confirmation" className="mb-6 sm:mb-8" />

        {loading ? (
          // Also the landing state when returning from the payment gateway.
          <BrandLoader message={t('checkout.confirmation.loading')} />
        ) : error ? (
          <FormMessage message={error} />
        ) : order ? (
          <div className="mx-auto max-w-4xl">
            <section
              className="order-confirmation-success"
              aria-label={t('checkout.confirmation.ariaLabel')}
            >
              <motion.div
                className="order-confirmation-icon"
                aria-hidden
                initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path className="order-confirmation-check-path" d="M5 12.5l4.2 4.2L19 7" />
                </svg>
              </motion.div>

              <motion.h1 className="order-confirmation-title" {...rise(0)}>
                {t('checkout.confirmation.thankYou')}
              </motion.h1>
              <motion.p className="order-confirmation-order-id" {...rise(1)}>
                {t('checkout.confirmation.orderHash', {
                  id: trackingNumber ?? formatOrderReferenceId(order),
                })}
              </motion.p>
              <motion.p className="order-confirmation-message" {...rise(2)}>
                {t('checkout.confirmation.emailSent', {
                  email: customerEmail || t('checkout.confirmation.yourEmail'),
                })}
              </motion.p>
            </section>

            <motion.div className="order-confirmation-card" {...rise(3)}>
              <div className="order-confirmation-card-grid">
                <div className="order-confirmation-details">
                  <p className="order-confirmation-section-label">
                    {t('checkout.confirmation.shippingTo')}
                  </p>
                  {/* The phone typed at checkout for THIS order — not the account phone. */}
                  <ShippingContactDetails
                    name={customerName || t('checkout.confirmation.customer')}
                    phone={order.shippingAddress.phone}
                    addressLines={formatOrderShippingAddressLines(order)}
                  />

                  <div className="order-confirmation-divider" />

                  {/* No courier/shipping method yet (it's assigned from the dashboard): show the
                      general delivery window instead, editable in dashboard settings. */}
                  <p className="order-confirmation-section-label">
                    {t('checkout.confirmation.deliveryTitle')}
                  </p>
                  <div className="order-confirmation-delivery-note">
                    <Truck size={20} strokeWidth={1.75} aria-hidden className="shrink-0" />
                    <span>{deliveryNote || t('checkout.confirmation.deliveryDefault')}</span>
                  </div>

                  <div className="order-confirmation-divider" />

                  <dl className="order-confirmation-details-list">
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.orderNumber')}</dt>
                      <dd>#{formatOrderReferenceId(order)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.orderDate')}</dt>
                      <dd>{formatOrderDate(order.createdAt, i18n.language)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.paymentMethod')}</dt>
                      <dd>{translatePaymentMethod(order, t)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>{t('checkout.confirmation.totalAmount')}</dt>
                      <dd>{formatCartPrice(order.totalPrice, i18n.language)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="order-confirmation-summary">
                  <OrderSummarySection order={order} />
                </div>
              </div>
            </motion.div>

            <motion.div {...rise(4)}>
              <OrderStatusStepper order={order} />
            </motion.div>

            <motion.div className="order-confirmation-actions" {...rise(5)}>
              <Button
                type="button"
                variant="primary"
                pill
                className="order-confirmation-action w-full sm:w-auto"
                onClick={handleTrackOrder}
              >
                <Clock size={16} strokeWidth={1.75} aria-hidden />
                {t('checkout.confirmation.trackOrder')}
              </Button>
              <Button
                type="button"
                variant="outline"
                pill
                className="order-confirmation-action w-full sm:w-auto"
                onClick={handleContinueShopping}
              >
                {t('actions.continueShopping')}
              </Button>
            </motion.div>
          </div>
        ) : null}
      </div>

      <Footer />
    </>
  )
}
