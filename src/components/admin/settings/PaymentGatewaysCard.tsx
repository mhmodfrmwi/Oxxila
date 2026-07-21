// src/components/admin/settings/PaymentGatewaysCard.tsx
import {
  Banknote,
  CreditCard,
  Plus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePaymentGateways } from '../../../hooks/usePaymentGateways'
import { cn } from '../../../lib/cn'
import type {
  AdminPaymentGatewayCode,
  AdminPaymentGatewayRow,
} from '../../../types/adminPaymentGateways'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

const GATEWAY_ICONS: Record<AdminPaymentGatewayCode, LucideIcon> = {
  stripe: CreditCard,
  paymob: Wallet,
  cod: Banknote,
}

function GatewayRow({
  gateway,
  enabling,
  onEnable,
}: {
  gateway: AdminPaymentGatewayRow
  enabling: boolean
  onEnable: (code: AdminPaymentGatewayCode) => void
}) {
  const { t } = useTranslation()
  const Icon = GATEWAY_ICONS[gateway.code] ?? CreditCard

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-[17px]">
      <div className="flex min-w-0 items-center gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
          <Icon size={24} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-5 text-white">
            {gateway.name}
          </p>
          {gateway.isEnabled ? (
            <p className="text-[10px] font-semibold uppercase leading-[15px] text-[#00d492]">
              {t('admin.settings.payments.connected')}
            </p>
          ) : (
            <StatusBadge
              tone="neutral"
              className="mt-0.5 border border-current/20 px-2 py-0.5 text-[9px] font-semibold"
            >
              {t('admin.settings.payments.disconnected')}
            </StatusBadge>
          )}
        </div>
      </div>

      {gateway.isEnabled ? (
        <button
          type="button"
          disabled
          title={t('admin.settings.payments.configureSoon')}
          className={cn(
            'shrink-0 rounded-xl border border-white/10 bg-white/5 px-[17px] py-[9px]',
            'text-[10px] font-bold uppercase text-white',
            'cursor-not-allowed opacity-50',
            focusRingClasses,
          )}
        >
          {t('admin.settings.payments.configure')}
        </button>
      ) : (
        <button
          type="button"
          disabled={enabling}
          onClick={() => onEnable(gateway.code)}
          className={cn(
            'shrink-0 rounded-xl border border-white/10 bg-white/5 px-[17px] py-[9px]',
            'text-[10px] font-bold uppercase text-white',
            'transition-colors hover:bg-white/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {enabling
            ? t('admin.settings.payments.enabling')
            : t('admin.settings.payments.enable')}
        </button>
      )}
    </div>
  )
}

/**
 * Payment Gateways card — list from GET /payments/gateways (Phase 7B).
 * Configure disabled (no credentials API). Enable uses PATCH isEnabled.
 * New Payment deferred.
 */
export function PaymentGatewaysCard() {
  const { t } = useTranslation()
  const { gateways, loading, error, enablingCode, reload, enableGateway } =
    usePaymentGateways()

  const failed = Boolean(error) && !loading && gateways.length === 0
  const staleError = Boolean(error) && gateways.length > 0
  const empty = !loading && !error && gateways.length === 0

  return (
    <GlassCard
      padding="none"
      className="rounded-[2rem] border border-white/10 bg-white/5 p-[33px]"
      aria-label={t('admin.settings.payments.aria')}
      aria-busy={loading || undefined}
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={24} className="text-[#a394ff]" aria-hidden />
          <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
            {t('admin.settings.payments.title')}
          </h3>
        </div>
        <button
          type="button"
          disabled
          title={t('admin.settings.payments.newPaymentSoon')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a394ff] to-[#8274d6]',
            'px-5 py-2.5 text-sm font-semibold text-white',
            'cursor-not-allowed opacity-50 shadow-[0_0_10px_rgba(163,148,255,0.3)]',
            focusRingClasses,
          )}
        >
          <Plus size={16} aria-hidden />
          {t('admin.settings.payments.newPayment')}
        </button>
      </div>

      {staleError ? (
        <p
          className="mb-4 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading && gateways.length === 0 ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
          <Skeleton className="h-[82px] w-full rounded-2xl" />
          <Skeleton className="h-[82px] w-full rounded-2xl" />
          <Skeleton className="h-[82px] w-full rounded-2xl" />
        </div>
      ) : null}

      {failed ? (
        <EmptyState
          bare
          className="py-8"
          title={t('admin.settings.payments.loadErrorTitle')}
          description={error ?? t('admin.settings.payments.emptyDescription')}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.settings.retry')}
            </Button>
          }
        />
      ) : null}

      {empty ? (
        <EmptyState
          bare
          className="py-8"
          title={t('admin.settings.payments.emptyTitle')}
          description={t('admin.settings.payments.emptyDescription')}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.settings.retry')}
            </Button>
          }
        />
      ) : null}

      {gateways.length > 0 ? (
        <div
          className={cn('flex flex-col gap-4', loading && 'opacity-60')}
        >
          {gateways.map((gateway) => (
            <GatewayRow
              key={gateway.id}
              gateway={gateway}
              enabling={enablingCode === gateway.code}
              onEnable={enableGateway}
            />
          ))}
        </div>
      ) : null}
    </GlassCard>
  )
}
