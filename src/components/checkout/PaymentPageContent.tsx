// src/components/checkout/PaymentPageContent.tsx
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import {
  CART_PATH,
  CHECKOUT_PATH,
  HOME_PATH,
} from '../../config/routes'
import { usePaymentPage } from '../../hooks/usePaymentPage'
import { cn } from '../../lib/cn'
import { CartShippingBar } from '../cart/CartShippingBar'
import { OrderSummaryCard } from '../cart/OrderSummaryCard'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { focusRingClasses } from '../ui/interactionStyles'
import { CheckoutStepper } from './CheckoutStepper'
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
    governorates,
    districts,
    hasDistricts,
    billingForm,
    billingErrors,
    paymentMethod,
    setPaymentMethod,
    billingSameAsShipping,
    handleBillingSameChange,
    shippingPrice,
    shippingCompareAt,
    pageLoading,
    submitting,
    submitError,
    updateBillingField,
    handlePayNow,
    handleBack,
    totalCompareAt,
    primaryAddress,
    addressLoading,
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
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: t('nav.home'), href: HOME_PATH },
            { label: t('checkout.title'), href: CHECKOUT_PATH },
            { label: t('checkout.payment.title') },
          ]}
        />

        <button
          type="button"
          className={cn('payment-back-link', focusRingClasses, 'rounded-sm')}
          onClick={handleBack}
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
          {t('checkout.back')}
        </button>

        <header className="mb-5 sm:mb-6">
          <Heading variant="page" className="font-serif">
            {t('checkout.payment.title')}
          </Heading>
        </header>

        <CheckoutStepper currentStep="payment" className="sm:mb-6" />

        {loading || !cart ? (
          <PaymentPageSkeleton />
        ) : (
          <>
            <CartShippingBar
              address={primaryAddress}
              loading={addressLoading}
              className="mb-6 sm:mb-8"
            />

            {submitError && (
              <div className="mb-4">
                <FormMessage message={submitError} />
              </div>
            )}

            <div className="grid gap-8 payment-layout lg:items-start lg:gap-10">
              <div className="min-w-0">
                <PaymentMethodSection
                  phone={phone}
                  governorates={governorates}
                  districts={districts}
                  hasDistricts={hasDistricts}
                  billingForm={billingForm}
                  billingErrors={billingErrors}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  billingSameAsShipping={billingSameAsShipping}
                  handleBillingSameChange={handleBillingSameChange}
                  updateBillingField={updateBillingField}
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
                couponLoading={couponLoading}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                shippingAmount={shippingPrice}
                shippingCompareAt={shippingCompareAt}
                totalCompareAt={totalCompareAt}
                ctaLabel={t('cart.summary.payNow')}
                onCtaClick={() => void handlePayNow()}
                ctaDisabled={submitting}
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
