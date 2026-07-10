import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CHECKOUT_PATH, HOME_PATH } from '../../config/routes'
import type { PaymentCallbackStatus } from '../../hooks/usePaymentCallbackPage'
import { Footer } from '../landing/footer/Footer'
import { PaymentCallbackView } from './PaymentCallbackView'

const PREVIEW_SESSION_ID = 'sess_preview_demo_12345'
const PREVIEW_ORDER_ID = '674a1b2c3d4e5f6789012345'
const PREVIEW_TOTAL = 450

function parsePreviewStatus(value: string | null): PaymentCallbackStatus {
  if (value === 'success' || value === 'failed') return value
  return 'loading'
}

export function PaymentCallbackPreviewContent() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const status = useMemo(
    () => parsePreviewStatus(searchParams.get('state')),
    [searchParams],
  )

  const previewBanner = t('checkout.callback.previewBanner', {
    state: t(`checkout.callback.previewState.${status}`),
  })

  return (
    <>
      <PaymentCallbackView
        status={status}
        sessionId={PREVIEW_SESSION_ID}
        orderId={status === 'success' ? PREVIEW_ORDER_ID : null}
        totalPrice={status === 'success' ? PREVIEW_TOTAL : null}
        previewBanner={previewBanner}
        onRetry={() => navigate(CHECKOUT_PATH)}
        onGoHome={() => navigate(HOME_PATH)}
      />
      <Footer />
    </>
  )
}
