// src/components/checkout/OrderConfirmationContent.tsx
import { Check, Clock, Truck } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { useOrderConfirmationPage } from '../../hooks/useOrderConfirmationPage'
import {
  formatEstimatedDeliveryRange,
  formatOrderDate,
  formatOrderPaymentMethod,
  formatOrderReferenceId,
  formatOrderShippingAddress,
  getOrderTrackingNumber,
} from '../../utils/orderFormat'
import { formatCartPrice } from '../../utils/formatProductPrice'
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

export function OrderConfirmationContent() {
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
            <section className="order-confirmation-success" aria-label="Order confirmation">
              <div className="order-confirmation-icon" aria-hidden>
                <Check size={36} strokeWidth={2} />
              </div>

              <h1 className="order-confirmation-title">Thank You for Your Order</h1>
              <p className="order-confirmation-order-id">
                Order #{trackingNumber ?? formatOrderReferenceId(order)}
              </p>
              <p className="order-confirmation-message">
                A confirmation email with your invoice and tracking details has been sent to{' '}
                {customerEmail || 'your email address'}
              </p>

              <dl className="order-confirmation-meta">
                <div className="order-confirmation-meta-item">
                  <strong>Order Number</strong>
                  <span>#{formatOrderReferenceId(order)}</span>
                </div>
                {trackingNumber && (
                  <div className="order-confirmation-meta-item">
                    <strong>Tracking Number</strong>
                    <span>{trackingNumber}</span>
                  </div>
                )}
                <div className="order-confirmation-meta-item">
                  <strong>Estimated Delivery</strong>
                  <span>{formatEstimatedDeliveryRange(order)}</span>
                </div>
                <div className="order-confirmation-meta-item">
                  <strong>Payment Method</strong>
                  <span>{formatOrderPaymentMethod(order)}</span>
                </div>
                <div className="order-confirmation-meta-item">
                  <strong>Delivery Address</strong>
                  <span>{formatOrderShippingAddress(order)}</span>
                </div>
              </dl>
            </section>

            <div className="order-confirmation-card">
              <div className="order-confirmation-card-grid">
                <div className="order-confirmation-details">
                  <p className="order-confirmation-section-label">Shipping To</p>
                  <p className="order-confirmation-recipient">{customerName || 'Customer'}</p>
                  <p className="order-confirmation-address">
                    {formatOrderShippingAddress(order)}
                  </p>

                  <div className="order-confirmation-divider" />

                  <p className="order-confirmation-section-label">Delivery Method</p>
                  <div className="order-confirmation-delivery">
                    <span className="order-confirmation-delivery-icon" aria-hidden>
                      <Truck size={18} strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="order-confirmation-delivery-title">
                        {order.shipping.methodName || 'Standard Shipping'}
                      </p>
                      <p className="order-confirmation-delivery-subtitle">
                        Estimated arrival {formatEstimatedDeliveryRange(order)}
                      </p>
                    </div>
                  </div>

                  <dl className="order-confirmation-details-list">
                    <div className="order-confirmation-details-row">
                      <dt>Order Date</dt>
                      <dd>{formatOrderDate(order.createdAt)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>Payment Method</dt>
                      <dd>{formatOrderPaymentMethod(order)}</dd>
                    </div>
                    <div className="order-confirmation-details-row">
                      <dt>Total Amount</dt>
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
                Track your order
              </Button>
              <Button
                type="button"
                variant="outline"
                className="order-confirmation-action w-full sm:w-auto"
                onClick={handleContinueShopping}
              >
                Continue shopping
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </>
  )
}
