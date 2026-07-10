import { Navigate } from 'react-router-dom'
import { usePaymentCallbackPage } from '../../hooks/usePaymentCallbackPage'
import { Footer } from '../landing/footer/Footer'
import { PaymentCallbackView } from './PaymentCallbackView'

export function PaymentCallbackContent() {
  const {
    isAuthenticated,
    loginPath,
    sessionId,
    status,
    orderId,
    totalPrice,
    handleRetry,
    handleGoHome,
  } = usePaymentCallbackPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  return (
    <>
      <PaymentCallbackView
        status={status}
        sessionId={sessionId}
        orderId={orderId}
        totalPrice={totalPrice}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
      />
      <Footer />
    </>
  )
}
