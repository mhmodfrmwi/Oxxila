// src/components/checkout/TrackOrderPageContent.tsx
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { HOME_PATH, MY_ACCOUNT_PATH, SHOP_PATH } from '../../config/routes'
import { useTrackOrderPage } from '../../hooks/useTrackOrderPage'
import { cn } from '../../lib/cn'
import { getOrderTrackingNumber } from '../../utils/orderFormat'
import { OrderDeliveryBanner } from '../order/OrderDeliveryBanner'
import { OrderPageHeader } from '../order/OrderPageHeader'
import { OrderShippingInfoCard } from '../order/OrderShippingInfoCard'
import { OrderSummarySection } from '../order/OrderSummarySection'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Button } from '../ui/Button'
import { focusRingClasses } from '../ui/interactionStyles'
import { OrderStatusStepper } from './OrderStatusStepper'

const TEMPERATURE_NOTE =
  'This package contains temperature-sensitive ingredients. Please unbox and store at room temperature upon delivery.'

function TrackOrderSkeleton() {
  return (
    <div className="order-confirmation-skeleton mx-auto max-w-5xl space-y-6" aria-hidden>
      <div className="h-10 w-64 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-20 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  )
}

export function TrackOrderPageContent() {
  const {
    isAuthenticated,
    loginPath,
    order,
    customerName,
    customerPhone,
    loading,
    cancelling,
    error,
    actionError,
    canCancel,
    handleCancelOrder,
    handleContinueShopping,
  } = useTrackOrderPage()

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
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: 'Home', href: HOME_PATH },
            { label: 'Orders', href: MY_ACCOUNT_PATH },
            { label: 'Track Order' },
          ]}
        />

        <Link
          to={MY_ACCOUNT_PATH}
          className={cn('track-order-back-link', focusRingClasses, 'rounded-sm')}
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
          Back
        </Link>

        {loading ? (
          <TrackOrderSkeleton />
        ) : error ? (
          <FormMessage message={error} />
        ) : order ? (
          <div className="mx-auto max-w-5xl">
            <OrderPageHeader order={order} trackingNumber={trackingNumber} />

            <div className="order-confirmation-card track-order-stepper-card">
              <OrderStatusStepper
                order={order}
                variant="track"
                showTitle={false}
              />
            </div>

            <OrderDeliveryBanner order={order} />

            {actionError && (
              <div className="mb-4">
                <FormMessage message={actionError} />
              </div>
            )}

            <div className="track-order-layout">
              <div>
                <OrderShippingInfoCard
                  order={order}
                  recipientName={customerName || 'Customer'}
                  phone={customerPhone}
                />

                {canCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    className="track-order-cancel-btn"
                    disabled={cancelling}
                    onClick={() => void handleCancelOrder()}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                )}
              </div>

              <div className="track-order-summary-card">
                <OrderSummarySection
                  order={order}
                  totalLabel="Total Paid"
                  footerNote={TEMPERATURE_NOTE}
                />
              </div>
            </div>

            <div className="track-order-actions">
              <Button
                type="button"
                variant="primary"
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
