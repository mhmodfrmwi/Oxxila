// src/components/checkout/PaymentPageContent.tsx
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { CART_PATH } from '../../config/routes'
import { usePaymentPage } from '../../hooks/usePaymentPage'
import { cn } from '../../lib/cn'
import { OrderSummaryCard } from '../cart/OrderSummaryCard'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { focusRingClasses } from '../ui/interactionStyles'
import { PaymentMethodSection } from './PaymentMethodSection'

function PaymentPageSkeleton() {
  return (
    <div className="grid gap-8 payment-layout lg:items-start" aria-hidden>
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-16 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-16 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  )
}

export function PaymentPageContent() {
  const { t } = useTranslation()
  const {
    isAuthenticated,
    loginPath,
    cart,
    cartLoading,
    couponLoading,
    applyCoupon,
    removeCoupon,
    phone,
    addresses,
    selectedAddressId,
    addressLoading,
    selectAddress,
    showNewAddressForm,
    openNewAddressForm,
    newAddressForm,
    newAddressErrors,
    updateNewAddressField,
    handleCreateAddress,
    savingAddress,
    governorates,
    districts,
    hasDistricts,
    paymentMethod,
    setPaymentMethod,
    pageLoading,
    submitting,
    submitError,
    handlePayNow,
    handleBack,
  } = usePaymentPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  if (!cartLoading && cart && cart.items.length === 0) {
    return <Navigate to={CART_PATH} replace />
  }

  const loading = cartLoading || pageLoading

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <button
          type="button"
          className={cn('payment-back-link', focusRingClasses, 'rounded-sm')}
          onClick={handleBack}
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
          {t('checkout.back')}
        </button>

        <header className="payment-page-header">
          <Heading variant="page" className="font-serif">
            {t('checkout.payment.title')}
          </Heading>
        </header>

        {loading || !cart ? (
          <PaymentPageSkeleton />
        ) : (
          <>
            {submitError && (
              <div className="mb-4">
                <FormMessage message={submitError} />
              </div>
            )}

            <div className="grid gap-8 payment-layout lg:items-start lg:gap-10">
              <div className="min-w-0">
                <PaymentMethodSection
                  phone={phone}
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  addressLoading={addressLoading}
                  selectAddress={selectAddress}
                  showNewAddressForm={showNewAddressForm}
                  openNewAddressForm={openNewAddressForm}
                  newAddressForm={newAddressForm}
                  newAddressErrors={newAddressErrors}
                  updateNewAddressField={updateNewAddressField}
                  handleCreateAddress={handleCreateAddress}
                  savingAddress={savingAddress}
                  governorates={governorates}
                  districts={districts}
                  hasDistricts={hasDistricts}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="mt-4 lg:hidden"
                  onClick={handleBack}
                >
                  {t('checkout.back')}
                </Button>
              </div>

              <OrderSummaryCard
                cart={cart}
                mode="review"
                className="payment-order-summary"
                couponLoading={couponLoading}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                ctaLabel={t('cart.summary.payNow')}
                onCtaClick={() => void handlePayNow()}
                ctaDisabled={submitting || !selectedAddressId}
                showPromo={false}
                trustBadgeVariant="payment"
                footerNote={t('checkout.payment.securityNote')}
              />
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  )
}
