// src/components/admin/shipping/ShippingMethodPanel.tsx
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShippingMethods } from '../../../hooks/useShippingMethods'
import { cn } from '../../../lib/cn'
import type {
  AdminShippingMethodRow,
  AdminShippingMethodType,
} from '../../../types/adminShipping'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

function methodCopyKey(type: AdminShippingMethodType): 'api' | 'known' | 'internal' {
  return type
}

function MethodToggle({
  checked,
  disabled,
  updating,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  updating?: boolean
  label: string
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled || updating}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-[#a394ff]' : 'bg-white/15',
        (disabled || updating) && 'cursor-not-allowed opacity-60',
        focusRingClasses,
      )}
    >
      {updating ? (
        <Loader2
          size={11}
          className="absolute inset-0 m-auto animate-spin text-white/80"
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5 rtl:-translate-x-5',
          )}
          aria-hidden
        />
      )}
    </button>
  )
}

function MethodCard({
  method,
  updating,
  onToggle,
}: {
  method: AdminShippingMethodRow
  updating: boolean
  onToggle: (type: AdminShippingMethodType, next: boolean) => void
}) {
  const { t } = useTranslation()
  const key = methodCopyKey(method.type)

  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4',
        method.isEnabled
          ? 'border-[#a394ff]/25 bg-[rgba(163,148,255,0.08)]'
          : 'border-white/5 bg-white/5',
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {t(`admin.shipping.method.types.${key}.label`)}
        </p>
        <p className="mt-0.5 text-xs text-white/40">
          {t(`admin.shipping.method.types.${key}.hint`)}
        </p>
      </div>
      <MethodToggle
        checked={method.isEnabled}
        updating={updating}
        label={t(`admin.shipping.method.types.${key}.toggleAria`)}
        onChange={() => onToggle(method.type, !method.isEnabled)}
      />
    </div>
  )
}

export function ShippingMethodPanel() {
  const { t } = useTranslation()
  const { methods, loading, error, updatingType, reload, toggleMethod } =
    useShippingMethods()

  const failed = Boolean(error) && !loading && methods.length === 0
  const staleError = Boolean(error) && methods.length > 0

  return (
    <GlassCard
      padding="lg"
      strong
      className="flex w-full flex-col gap-6 rounded-[var(--admin-radius-2xl)]"
      aria-label={t('admin.shipping.method.panelAria')}
      aria-busy={loading || undefined}
    >
      <div>
        <h3 className="font-[family-name:var(--admin-font-display)] text-lg font-normal text-white">
          {t('admin.shipping.method.title')}
        </h3>
        <p className="mt-1 text-sm text-white/40">
          {t('admin.shipping.method.subtitle')}
        </p>
      </div>

      {staleError ? (
        <p
          className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading && methods.length === 0 ? (
        <div
          className="grid grid-cols-1 gap-[var(--admin-content-gap-tight)] md:grid-cols-3"
          aria-busy="true"
        >
          <Skeleton className="h-[4.6rem] w-full rounded-2xl" />
          <Skeleton className="h-[4.6rem] w-full rounded-2xl" />
          <Skeleton className="h-[4.6rem] w-full rounded-2xl" />
        </div>
      ) : null}

      {failed ? (
        <EmptyState
          bare
          className="py-6"
          title={t('admin.shipping.method.loadErrorTitle')}
          description={error ?? undefined}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.shipping.retry')}
            </Button>
          }
        />
      ) : null}

      {methods.length > 0 ? (
        <div className="grid grid-cols-1 gap-[var(--admin-content-gap-tight)] md:grid-cols-3">
          {methods.map((method) => (
            <MethodCard
              key={method.type}
              method={method}
              updating={updatingType === method.type}
              onToggle={(type, next) => void toggleMethod(type, next)}
            />
          ))}
        </div>
      ) : null}
    </GlassCard>
  )
}
