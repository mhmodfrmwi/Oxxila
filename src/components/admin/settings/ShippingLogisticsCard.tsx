// src/components/admin/settings/ShippingLogisticsCard.tsx
import { Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import hubsMap from '../../../assets/admin/distribution-hubs-map.jpg'
import { useAdminCarriers } from '../../../hooks/useAdminCarriers'
import { cn } from '../../../lib/cn'
import type { AdminCarrierRow } from '../../../types/adminShipping'
import { Button } from '../../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

function ProtocolRow({
  carrier,
  isLast,
}: {
  carrier: AdminCarrierRow
  isLast: boolean
}) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-2',
        !isLast && 'border-b border-white/5',
      )}
    >
      <p className="min-w-0 truncate text-sm font-normal leading-5 text-white">
        {carrier.name}
      </p>
      {carrier.isActive ? (
        <StatusBadge
          tone="accent"
          className="shrink-0 bg-[rgba(163,148,255,0.1)] px-2 py-0.5 text-[8px] font-bold text-[#a394ff]"
        >
          {t('admin.settings.shipping.active')}
        </StatusBadge>
      ) : (
        <StatusBadge
          tone="neutral"
          className="shrink-0 bg-white/5 px-2 py-0.5 text-[8px] font-bold text-white/20"
        >
          {t('admin.settings.shipping.disabled')}
        </StatusBadge>
      )}
    </div>
  )
}

/**
 * Shipping & Logistics — decorative hubs + carrier protocols (Phase 7F).
 * Figma Settings `937:21940`. Read-only; no edit, no fake hub coordinates.
 */
export function ShippingLogisticsCard() {
  const { t } = useTranslation()
  const { carriers, loading, error, reload } = useAdminCarriers()

  const failed = Boolean(error) && !loading && carriers.length === 0
  const staleError = Boolean(error) && carriers.length > 0
  const empty = !loading && !error && carriers.length === 0

  return (
    <GlassCard
      padding="lg"
      strong
      className="w-full rounded-[var(--admin-radius-2xl)]"
      aria-label={t('admin.settings.shipping.aria')}
      aria-busy={loading || undefined}
    >
      <div className="mb-8 flex items-center gap-3">
        <Truck size={19} className="text-[#a394ff]" aria-hidden />
        <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
          {t('admin.settings.shipping.title')}
        </h3>
      </div>

      {staleError ? (
        <p
          className="mb-4 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {failed ? (
        <EmptyState
          bare
          className="py-8"
          title={t('admin.settings.shipping.loadErrorTitle')}
          description={error ?? t('admin.settings.loadErrorTitle')}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.settings.retry')}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/40">
              {t('admin.settings.shipping.hubs')}
            </p>
            <div
              className="relative h-40 overflow-hidden rounded-2xl border border-white/10"
              role="img"
              aria-label={t('admin.settings.shipping.hubsArtwork')}
            >
              <img
                src={hubsMap}
                alt=""
                className="absolute inset-0 size-full object-cover object-center"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/40">
              {t('admin.settings.shipping.protocols')}
            </p>

            {loading && carriers.length === 0 ? (
              <div className="flex flex-col gap-3" aria-busy="true">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ) : null}

            {empty ? (
              <EmptyState
                bare
                className="py-6"
                title={t('admin.settings.shipping.emptyTitle')}
                description={t('admin.settings.shipping.emptyDescription')}
                action={
                  <Button type="button" variant="outline" onClick={reload}>
                    {t('admin.settings.retry')}
                  </Button>
                }
              />
            ) : null}

            {carriers.length > 0 ? (
              <div
                className={cn(
                  'flex flex-col gap-3',
                  loading && 'opacity-60',
                )}
              >
                {carriers.map((carrier, index) => (
                  <ProtocolRow
                    key={carrier.id}
                    carrier={carrier}
                    isLast={index === carriers.length - 1}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
