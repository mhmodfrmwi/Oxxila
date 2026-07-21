// src/pages/admin/AdminComingSoonPage.tsx
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'

/**
 * Generic coming-soon stub for unbuilt admin modules.
 */
export function AdminComingSoonPage() {
  const { t } = useTranslation()

  return (
    <>
      <AdminPageHeader
        title={t('admin.foundation.title')}
        subtitle={t('admin.comingSoon.subtitle')}
      />
      <EmptyState
        title={t('admin.comingSoon.title')}
        description={t('admin.comingSoon.description')}
      />
    </>
  )
}
