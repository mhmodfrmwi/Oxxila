// src/components/checkout/TrackOrderPageContent.tsx
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { HOME_PATH, ACCOUNT_ORDERS_PATH, SHOP_PATH } from '../../config/routes'
import { useTrackOrderPage } from '../../hooks/useTrackOrderPage'
import { cn } from '../../lib/cn'
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
  const { t } = useTranslation()
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
    canReturn,
    handleCancelOrder,
    handleReturnOrder,
    handleContinueShopping,
  } = useTrackOrderPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  if (!loading && !order && !error) {
    return <Navigate to={SHOP_PATH} replace />
  }

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: t('nav.home'), href: HOME_PATH },
            { label: t('checkout.track.orders'), href: ACCOUNT_ORDERS_PATH },
            { label: t('checkout.track.title') },
          ]}
        />

        <Link
          to={ACCOUNT_ORDERS_PATH}
          className={cn('track-order-back-link', focusRingClasses, 'rounded-sm')}
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
          {t('checkout.back')}
        </Link>

        {loading ? (
          <TrackOrderSkeleton />
        ) : error ? (
          <FormMessage message={error} />
        ) : order ? (
          <div className="mx-auto max-w-4xl">
            <OrderPageHeader order={order} />

            <div className="order-confirmation-card track-order-stepper-card">
              <OrderStatusStepper order={order} variant="track" showTitle={false} />
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
                  recipientName={customerName || t('checkout.confirmation.customer')}
                  // The phone typed at checkout for this order; older orders fall back to the account phone.
                  phone={order.shippingAddress.phone || customerPhone}
                />

                {/* One action at a time: Cancel until it ships, Return after delivery (within the window). */}
                {canReturn && (
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    className="track-order-cancel-btn track-order-return-btn"
                    onClick={handleReturnOrder}
                  >
                    {t('checkout.track.returnOrder')}
                  </Button>
                )}

                {canCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    className="track-order-cancel-btn"
                    disabled={cancelling}
                    onClick={() => void handleCancelOrder()}
                  >
                    {cancelling
                      ? t('checkout.track.cancelling')
                      : t('checkout.track.cancelOrder')}
                  </Button>
                )}
              </div>

              <div className="track-order-summary-card">
                <OrderSummarySection
                  order={order}
                  totalLabel={t('checkout.track.totalPaid')}
                  footerNote={t('checkout.track.temperatureNote')}
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
