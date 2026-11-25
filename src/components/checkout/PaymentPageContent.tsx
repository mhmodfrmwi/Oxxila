// src/components/checkout/PaymentPageContent.tsx
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { CART_PATH, PAYMENT_PATH } from '../../config/routes'
import { rememberReturnTo } from '../../utils/authReturnTo'
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
    cartLoadError,
    refreshCart,
    couponLoading,
    applyCoupon,
    removeCoupon,
    addresses,
    selectedAddressId,
    addressLoading,
    addressLoadError,
    retryAddresses,
    selectAddress,
    showNewAddressForm,
    openNewAddressForm,
    newAddressForm,
    newAddressErrors,
    updateNewAddressField,
    governorates,
    districts,
    hasDistricts,
    paymentMethod,
    setPaymentMethod,
    enabledPaymentMethods,
    pageLoading,
    submitting,
    submitError,
    zonesError,
    shippingPrice,
    handlePayNow,
    handleBack,
  } = usePaymentPage()

  if (!isAuthenticated) {
    // Come back here after sign-in; the guest cart merges into the account on login.
    rememberReturnTo(PAYMENT_PATH)
    return <Navigate to={loginPath} replace state={{ from: PAYMENT_PATH, reason: 'checkout' }} />
  }

  if (!cartLoading && !cartLoadError && cart && cart.items.length === 0) {
    return <Navigate to={CART_PATH} replace />
  }

  const loading = cartLoading || pageLoading
  // The server applies store credit AFTER shipping, so recompute with shipping included
  // (cart.totalPrice only knows the pre-shipping credit and over-charges when credit is large).
  const effectiveShipping = cart?.freeShipping ? 0 : shippingPrice
  const summaryCart =
    cart && typeof effectiveShipping === 'number'
      ? (() => {
          const base = Math.max(0, cart.subtotal - (cart.discountAmount ?? 0) + effectiveShipping)
          const credit = Math.min(cart.storeCreditBalance ?? 0, base)
          return { ...cart, storeCreditApplied: credit, totalPrice: Math.max(0, base - credit) }
        })()
      : cart
  const payableTotal = summaryCart && typeof effectiveShipping === 'number' ? summaryCart.totalPrice : undefined

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
          <Heading variant="page">
            {t('checkout.payment.title')}
          </Heading>
        </header>

        {loading && !cartLoadError ? (
          <PaymentPageSkeleton />
        ) : cartLoadError && !cart ? (
          <div className="space-y-4" role="alert">
            <FormMessage message={cartLoadError || t('cart.loadError')} />
            <Button type="button" variant="outline" onClick={() => void refreshCart()}>
              {t('cart.retry')}
            </Button>
          </div>
        ) : !cart ? (
          <PaymentPageSkeleton />
        ) : (
          <>
            {submitError && (
              <div className="mb-4">
                <FormMessage message={submitError} />
              </div>
            )}
            {!submitError && zonesError && showNewAddressForm && (
              <div className="mb-4">
                <FormMessage message={zonesError} />
              </div>
            )}

            <div className="grid gap-8 payment-layout lg:items-start lg:gap-10">
              <div className="min-w-0">
                <PaymentMethodSection
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  addressLoading={addressLoading}
                  addressLoadError={addressLoadError}
                  retryAddresses={retryAddresses}
                  selectAddress={selectAddress}
                  showNewAddressForm={showNewAddressForm}
                  openNewAddressForm={openNewAddressForm}
                  newAddressForm={newAddressForm}
                  newAddressErrors={newAddressErrors}
                  updateNewAddressField={updateNewAddressField}
                  governorates={governorates}
                  districts={districts}
                  hasDistricts={hasDistricts}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  enabledPaymentMethods={enabledPaymentMethods}
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
                cart={summaryCart ?? cart}
                mode="review"
                className="payment-order-summary"
                shippingPrice={effectiveShipping}
                totalPrice={payableTotal}
                couponLoading={couponLoading}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                ctaLabel={t('cart.summary.payNow')}
                onCtaClick={() => void handlePayNow()}
                ctaDisabled={submitting || !(selectedAddressId || showNewAddressForm) || !paymentMethod}
                showPromo
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
