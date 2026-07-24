// src/components/admin/settings/CartRecoveryCard.tsx
import { useTranslation } from 'react-i18next'
import { useCartRecovery } from '../../../hooks/useCartRecovery'
import { cn } from '../../../lib/cn'
import type { CartRecoveryMetrics } from '../../../types/adminCartRecovery'
import { formatDashboardMoney } from '../../../utils/adminDashboardFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Button } from '../../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

const PLACEHOLDER = '—'

function formatRevenue(value: number | null, locale: string): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER
  return formatDashboardMoney(value, locale)
}

/** Empty donut track — no fabricated recovery percentage. */
function RecoveryDonutPlaceholder({
  rateLabel,
  recoveredLabel,
}: {
  rateLabel: string
  recoveredLabel: string
}) {
  const size = 128 // 160 × 0.8
  const stroke = 9.6 // 12 × 0.8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div
      className="relative mx-auto size-40"
      role="img"
      aria-label={`${rateLabel}: ${PLACEHOLDER}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Track only — no progress arc until API provides a rate. */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(163,148,255,0.2)"
          strokeWidth={stroke}
          strokeDasharray={`0 ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[24px] font-bold leading-9 text-white">{PLACEHOLDER}</p>
        <p className="text-[8px] font-normal uppercase tracking-[0.1em] text-white/40">
          {recoveredLabel}
        </p>
      </div>
    </div>
  )
}

function RecoveryDonut({
  percent,
  recoveredLabel,
}: {
  percent: number
  recoveredLabel: string
}) {
  const size = 128 // 160 × 0.8
  const stroke = 9.6 // 12 × 0.8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(percent, 0), 100)
  const dash = (clamped / 100) * circumference

  return (
    <div
      className="relative mx-auto size-40"
      role="img"
      aria-label={`${Math.round(clamped)}% ${recoveredLabel}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#a394ff"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          className="drop-shadow-[0_0_9.6px_rgba(163,148,255,0.35)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[24px] font-bold leading-9 text-white">
          {Math.round(clamped)}%
        </p>
        <p className="text-[8px] font-normal uppercase tracking-[0.1em] text-white/40">
          {recoveredLabel}
        </p>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-normal text-white/60">{label}</span>
      <span
        className={cn(
          'text-sm font-semibold text-white',
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  )
}

function RecoveryBody({
  metrics,
  locale,
}: {
  metrics: CartRecoveryMetrics
  locale: string
}) {
  const { t } = useTranslation()
  const rate = metrics.recoveryRatePercent
  const hasRate = rate != null && Number.isFinite(rate)

  return (
    <>
      <div className="flex flex-col items-center justify-center py-4">
        {hasRate ? (
          <RecoveryDonut
            percent={rate}
            recoveredLabel={t('admin.settings.recovery.recovered')}
          />
        ) : (
          <RecoveryDonutPlaceholder
            rateLabel={t('admin.settings.recovery.recoveryRate')}
            recoveredLabel={t('admin.settings.recovery.recovered')}
          />
        )}
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <MetricRow
          label={t('admin.settings.recovery.abandonedRevenue')}
          value={formatRevenue(metrics.abandonedRevenue, locale)}
        />
        <MetricRow
          label={t('admin.settings.recovery.recoveredRevenue')}
          value={formatRevenue(metrics.recoveredRevenue, locale)}
          valueClassName={
            metrics.recoveredRevenue != null
              ? 'font-bold text-[#00d492]'
              : undefined
          }
        />

        <button
          type="button"
          disabled
          title={t('admin.settings.recovery.automateSoon')}
          className={cn(
            'mt-2 flex w-full items-center justify-center rounded-2xl',
            'border border-white/10 bg-white/5 px-4 py-[10.4px]',
            'text-xs font-bold text-white',
            'cursor-not-allowed opacity-50',
            focusRingClasses,
          )}
        >
          {t('admin.settings.recovery.automate')}
        </button>
      </div>
    </>
  )
}

/**
 * Cart Recovery — Figma Settings `941:24676`.
 * Wired to GET /payments/cart-recovery; renders — while loading/on error.
 */
export function CartRecoveryCard() {
  const { t, i18n } = useTranslation()
  const { metrics, loading, error, reload } = useCartRecovery()
  const locale = i18n.language

  const failed = Boolean(error) && !loading

  return (
    <GlassCard
      padding="lg"
      strong
      className="relative min-h-[25rem] w-full overflow-hidden rounded-[var(--admin-radius-xl)]"
      aria-label={t('admin.settings.recovery.aria')}
      aria-busy={loading || undefined}
    >
      <div
        className="pointer-events-none absolute -bottom-10 -end-10 size-48 rounded-full bg-[rgba(163,148,255,0.1)] blur-[25.6px]"
        aria-hidden
      />

      <div className="relative mb-2">
        <h3 className="text-lg font-bold leading-7 text-white">
          {t('admin.settings.recovery.title')}
        </h3>
        <p className="mt-1 text-xs font-normal leading-4 text-white/40">
          {t('admin.settings.recovery.subtitle')}
        </p>
      </div>

      <div className="relative flex min-h-[17.6rem] flex-col">
        {loading ? (
          <div
            className="flex flex-1 flex-col items-center gap-6 py-6"
            aria-busy="true"
          >
            <Skeleton className="size-40 rounded-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : null}

        {failed ? (
          <EmptyState
            bare
            className="my-auto py-8"
            title={t('admin.settings.recovery.loadErrorTitle')}
            description={error ?? t('admin.settings.loadErrorTitle')}
            action={
              <Button type="button" variant="outline" onClick={reload}>
                {t('admin.settings.retry')}
              </Button>
            }
          />
        ) : null}

        {!loading && !failed ? (
          <RecoveryBody metrics={metrics} locale={locale} />
        ) : null}
      </div>
    </GlassCard>
  )
}
