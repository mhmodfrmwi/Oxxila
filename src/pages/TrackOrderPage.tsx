// src/pages/TrackOrderPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { TrackOrderPageContent } from '../components/checkout/TrackOrderPageContent'

export function TrackOrderPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 20 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <TrackOrderPageContent />
      </PageBleed>
    </Layout>
  )
}
