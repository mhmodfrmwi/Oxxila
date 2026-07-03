// src/pages/PaymentPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { PaymentPageContent } from '../components/checkout/PaymentPageContent'

export function PaymentPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 20 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <PaymentPageContent />
      </PageBleed>
    </Layout>
  )
}
