// src/pages/admin/AdminFoundationPage.tsx
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { GlassCard } from '../../components/admin/ui/GlassCard'
import { StatusBadge } from '../../components/admin/ui/StatusBadge'

/**
 * Temporary Phase 0 landing page under `/admin`.
 * Confirms shell + primitives mount; no feature widgets or API calls.
 */
export function AdminFoundationPage() {
  const { t } = useTranslation()

  return (
    <>
      <AdminPageHeader
        title={t('admin.foundation.title')}
        subtitle={t('admin.foundation.subtitle')}
        actions={<StatusBadge tone="accent">{t('admin.foundation.phaseBadge')}</StatusBadge>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <p className="admin-label mb-2">{t('admin.foundation.shellLabel')}</p>
          <p className="text-sm text-secondary-text">{t('admin.foundation.shellBody')}</p>
        </GlassCard>
        <EmptyState
          title={t('admin.foundation.emptyTitle')}
          description={t('admin.foundation.emptyDescription')}
        />
      </div>
    </>
  )
}
