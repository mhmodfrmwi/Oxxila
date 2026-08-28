// src/pages/ReturnsHistoryPage.tsx
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'
import { ReturnsHistoryPageContent } from '../components/returns/ReturnsHistoryPageContent'

export function ReturnsHistoryPage() {
  return (
    <Layout>
      <PageBleed>
        <ReturnsHistoryPageContent />
      </PageBleed>
    </Layout>
  )
}
