// src/pages/PaymentPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { PaymentPageContent } from '../components/checkout/PaymentPageContent'

export function PaymentPage() {
  return (
    <Layout>
      <PageBleed>
        <PaymentPageContent />
      </PageBleed>
    </Layout>
  )
}
