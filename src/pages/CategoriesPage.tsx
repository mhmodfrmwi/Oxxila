// src/pages/CategoriesPage.tsx
import { CategoryPageContent } from '../components/category/CategoryPageContent'
import { Layout } from '../components/layout/Layout'
import { PageBleed } from '../components/layout/PageBleed'

export function CategoriesPage() {
  return (
    <Layout
      utilityPromo={{
        title: 'Return within 30 days',
        subtitle: 'from purchase date',
      }}
    >
      <PageBleed>
        <CategoryPageContent />
      </PageBleed>
    </Layout>
  )
}
