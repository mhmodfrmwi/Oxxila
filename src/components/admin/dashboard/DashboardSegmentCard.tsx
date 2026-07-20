// src/components/admin/dashboard/DashboardSegmentCard.tsx
import { useTranslation } from 'react-i18next'
import type { DashboardCustomerSegments } from '../../../types/adminDashboard'
import { formatDashboardNumber } from '../../../utils/adminDashboardFormat'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { SegmentDonutChart } from './charts/SegmentDonutChart'

interface DashboardSegmentCardProps {
  segments: DashboardCustomerSegments | null
  loading?: boolean
}

export function DashboardSegmentCard({
  segments,
  loading = false,
}: DashboardSegmentCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const empty =
    !loading &&
    (!segments || segments.totalCustomersWithOrders === 0)

  return (
    <GlassCard
      padding="lg"
      className="flex min-h-[28rem] flex-col justify-between rounded-[var(--admin-radius-xl)]"
    >
      <div className="space-y-1">
        <h2 className="admin-section-title">
          {t('admin.dashboard.segments.title')}
        </h2>
        <p className="text-sm text-secondary-text">
          {t('admin.dashboard.segments.subtitle')}
        </p>
      </div>

      {loading || !segments ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          <Skeleton className="size-48 rounded-full" />
          <div className="w-full space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      ) : empty ? (
        <EmptyState
          title={t('admin.dashboard.segments.emptyTitle')}
          description={t('admin.dashboard.segments.emptyDescription')}
          className="my-auto"
        />
      ) : (
        <>
          <SegmentDonutChart
            returningPercent={segments.returningPercent}
            centerLabel={t('admin.dashboard.segments.returning')}
          />
          <div className="space-y-4 pt-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" aria-hidden />
                <span className="text-sm text-primary-text">
                  {t('admin.dashboard.segments.loyal')}
                </span>
              </div>
              <span className="text-sm font-semibold text-primary-text">
                {formatDashboardNumber(segments.loyalPatients, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-white/20" aria-hidden />
                <span className="text-sm text-primary-text">
                  {t('admin.dashboard.segments.new')}
                </span>
              </div>
              <span className="text-sm font-semibold text-primary-text">
                {formatDashboardNumber(segments.newClients, locale)}
              </span>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  )
}
