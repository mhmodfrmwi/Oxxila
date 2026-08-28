// src/pages/PaymentCallbackPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { PaymentCallbackContent } from '../components/checkout/PaymentCallbackContent'

export function PaymentCallbackPage() {
  return (
    <Layout>
      <PageBleed>
        <PaymentCallbackContent />
      </PageBleed>
    </Layout>
  )
}
