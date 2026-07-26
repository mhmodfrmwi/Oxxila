// src/components/admin/settings/PaymentGatewaysCard.tsx
import {
  Banknote,
  CreditCard,
  Loader2,
  PowerOff,
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

const GATEWAY_ICONS: Record<AdminPaymentGatewayCode, LucideIcon> = {
  stripe: CreditCard,
  paymob: Wallet,
  cod: Banknote,
}

function GatewayRow({
  gateway,
  mutating,
  onEnable,
  onDisable,
}: {
  gateway: AdminPaymentGatewayRow
  mutating: boolean
  onEnable: (code: AdminPaymentGatewayCode) => void
  onDisable: (code: AdminPaymentGatewayCode) => void
}) {
  const { t } = useTranslation()
  const Icon = GATEWAY_ICONS[gateway.code] ?? CreditCard

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-[17px]">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={cn(
            'inline-flex size-12 shrink-0 items-center justify-center rounded-xl',
            gateway.isEnabled ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40',
          )}
        >
          <Icon size={19} aria-hidden />
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              'truncate text-sm font-bold leading-5',
              gateway.isEnabled ? 'text-white' : 'text-white/40',
            )}
          >
            {gateway.name}
          </p>
          {gateway.isEnabled ? (
            <p className="text-[10px] font-semibold uppercase leading-[15px] text-[#00d492]">
              {t('admin.settings.payments.connected')}
            </p>
          ) : (
            <p className="text-[10px] font-normal uppercase leading-[15px] text-white/40">
              {t('admin.settings.payments.disconnected')}
            </p>
          )}
        </div>
      </div>

      {gateway.isEnabled ? (
        <div className="flex shrink-0 items-center gap-2">
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
          <button
            type="button"
            disabled={mutating}
            onClick={() => onDisable(gateway.code)}
            title={t('admin.settings.payments.disable')}
            aria-label={t('admin.settings.payments.disableAria', {
              name: gateway.name,
            })}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
              'transition-colors hover:bg-support-error/10 hover:text-support-error',
              'disabled:pointer-events-none disabled:opacity-40',
              focusRingClasses,
            )}
          >
            {mutating ? (
              <Loader2 size={13} className="animate-spin" aria-hidden />
            ) : (
              <PowerOff size={13} aria-hidden />
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={mutating}
          onClick={() => onEnable(gateway.code)}
          className={cn(
            'shrink-0 rounded-xl border border-[rgba(163,148,255,0.2)] bg-[rgba(163,148,255,0.2)]',
            'px-[17px] py-[9px] text-[10px] font-bold uppercase text-[#a394ff]',
            'transition-colors hover:bg-[rgba(163,148,255,0.28)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {mutating
            ? t('admin.settings.payments.enabling')
            : t('admin.settings.payments.enable')}
        </button>
      )}
    </div>
  )
}

/**
 * Payment Gateways card — Figma Enable/Configure layout + compact Disable.
 * Configure stays disabled (no credentials API). Enable/Disable use PATCH isEnabled.
 */
export function PaymentGatewaysCard() {
  const { t } = useTranslation()
  const {
    gateways,
    loading,
    error,
    mutatingCode,
    reload,
    enableGateway,
    disableGateway,
  } = usePaymentGateways()

  const failed = Boolean(error) && !loading && gateways.length === 0
  const staleError = Boolean(error) && gateways.length > 0
  const empty = !loading && !error && gateways.length === 0

  return (
    <GlassCard
      padding="lg"
      strong
      className="w-full rounded-[var(--admin-radius-2xl)]"
      aria-label={t('admin.settings.payments.aria')}
      aria-busy={loading || undefined}
    >
      <div className="mb-8 flex items-center gap-2">
        <CreditCard size={19} className="text-[#a394ff]" aria-hidden />
        <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
          {t('admin.settings.payments.title')}
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

      {loading && gateways.length === 0 ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
          <Skeleton className="h-[65.6px] w-full rounded-2xl" />
          <Skeleton className="h-[65.6px] w-full rounded-2xl" />
          <Skeleton className="h-[65.6px] w-full rounded-2xl" />
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
        <div className={cn('flex flex-col gap-4', loading && 'opacity-60')}>
          {gateways.map((gateway) => (
            <GatewayRow
              key={gateway.id}
              gateway={gateway}
              mutating={mutatingCode === gateway.code}
              onEnable={(code) => void enableGateway(code)}
              onDisable={(code) => void disableGateway(code)}
            />
          ))}
        </div>
      ) : null}
    </GlassCard>
  )
}
