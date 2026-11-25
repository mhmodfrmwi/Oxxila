import { BrandLoader } from '../ui/BrandLoader'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { formatOrderReferenceId } from '../../utils/orderFormat'
import type { PaymentCallbackStatus } from '../../hooks/usePaymentCallbackPage'
import type { ApiOrder } from '../../types/order'
import { Button } from '../ui/Button'
import { CheckoutStepper } from './CheckoutStepper'

interface PaymentCallbackViewProps {
  status: PaymentCallbackStatus
  sessionId?: string
  orderId?: string | null
  totalPrice?: number | null
  previewBanner?: string
  onRetry: () => void
  onGoHome: () => void
}

export function PaymentCallbackView({
  status,
  sessionId,
  orderId,
  totalPrice,
  previewBanner,
  onRetry,
  onGoHome,
}: PaymentCallbackViewProps) {
  const { t } = useTranslation()

  const orderLabel = orderId
    ? formatOrderReferenceId({ _id: orderId } as ApiOrder)
    : null

  return (
    <div className="container-content pb-8 sm:pb-10">
      {previewBanner && <p className="payment-callback-preview-banner">{previewBanner}</p>}

      <CheckoutStepper currentStep="payment" className="mb-6 sm:mb-8" />

      <section
        className="payment-callback-card"
        aria-live="polite"
        aria-label={t('checkout.callback.ariaLabel')}
      >
        {status === 'loading' && (
          <div className="payment-callback-state">
            <BrandLoader size="inline" message={t('checkout.callback.verifyingTitle')} />
            <p className="payment-callback-message">{t('checkout.callback.verifyingMessage')}</p>
            {sessionId && (
              <p className="payment-callback-session">{t('checkout.callback.session', { sessionId })}</p>
            )}
          </div>
        )}

        {status === 'success' && (
          <div className="payment-callback-state">
            <div className="payment-callback-icon payment-callback-icon--success" aria-hidden>
              <Check size={36} strokeWidth={2} />
            </div>
            <h1 className="payment-callback-title">{t('checkout.callback.successTitle')}</h1>
            <p className="payment-callback-message">{t('checkout.callback.successMessage')}</p>
            {(orderLabel || totalPrice != null) && (
              <dl className="payment-callback-summary">
                {orderLabel && (
                  <div className="payment-callback-summary-row">
                    <dt>{t('checkout.callback.orderNumber')}</dt>
                    <dd>{orderLabel}</dd>
                  </div>
                )}
                {totalPrice != null && (
                  <div className="payment-callback-summary-row">
                    <dt>{t('checkout.callback.total')}</dt>
                    <dd>{formatCartPrice(totalPrice)}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="payment-callback-state">
            <div className="payment-callback-icon payment-callback-icon--failed" aria-hidden>
              <X size={36} strokeWidth={2} />
            </div>
            <h1 className="payment-callback-title">{t('checkout.callback.failedTitle')}</h1>
            <p className="payment-callback-message">{t('checkout.callback.failedMessage')}</p>
            <div className="payment-callback-actions">
              <Button type="button" pill fullWidth onClick={onRetry}>
                {t('checkout.callback.retry')}
              </Button>
              <Button type="button" variant="outline" pill fullWidth onClick={onGoHome}>
                {t('checkout.callback.goHome')}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
