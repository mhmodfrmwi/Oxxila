// src/components/admin/customers/CustomerDetailsDrawer.tsx
import { KeyRound, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCustomerDetailsDrawer } from '../../../hooks/useCustomerDetailsDrawer'
import { cn } from '../../../lib/cn'
import type {
  AdminCustomerDetail,
  AdminCustomerRow,
} from '../../../types/adminCustomers'
import {
  formatCustomerDate,
  formatCustomerMoney,
  formatUnavailableMetric,
} from '../../../utils/adminCustomersFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'

interface CustomerDetailsDrawerProps {
  open: boolean
  customerId: string | null
  togglingCustomerId?: string | null
  onClose: () => void
  onEdit?: (customer: AdminCustomerRow) => void
  onDelete?: (customer: AdminCustomerRow) => void
  onChangePassword?: (customer: AdminCustomerRow) => void
  onToggleActive?: (
    customerId: string,
    active: boolean,
    seed: AdminCustomerRow,
  ) => void | Promise<void>
}

function detailToRow(customer: AdminCustomerDetail): AdminCustomerRow {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email ?? '—',
    phone: customer.phone,
    avatar: customer.avatar,
    initials: customer.initials,
    active: customer.active,
    role: customer.role,
    createdAt: customer.createdAt ?? '',
    ordersCount: customer.ordersCount,
    totalSpend: customer.totalSpend,
    lastOrderAt: customer.lastOrderAt,
  }
}

function CustomerDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center gap-4 pt-2">
        <Skeleton className="size-[5.6rem] rounded-full" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-[140px] w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] uppercase leading-[12px] tracking-[0.1em] text-white/30">
        {label}
      </p>
      <p className="truncate text-sm font-medium leading-5 text-white" title={value}>
        {value}
      </p>
    </div>
  )
}

export function CustomerDetailsDrawer({
  open,
  customerId,
  togglingCustomerId = null,
  onClose,
  onEdit,
  onDelete,
  onChangePassword,
  onToggleActive,
}: CustomerDetailsDrawerProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const { customer, loading, error, reload } = useCustomerDetailsDrawer({
    open,
    customerId,
  })
  const unavailable = formatUnavailableMetric()
  const toggling = Boolean(customer && togglingCustomerId === customer.id)

  const statusLabel = customer
    ? customer.active
      ? t('admin.customers.details.statusActive')
      : t('admin.customers.details.statusInactive')
    : null

  const handleToggleActive = () => {
    if (!customer || toggling) return
    void (async () => {
      await onToggleActive?.(customer.id, !customer.active, detailToRow(customer))
      reload()
    })()
  }

  const footer =
    customer && !loading && !error ? (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            disabled={toggling}
            onClick={handleToggleActive}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-[13.6px]',
              'text-sm font-bold',
              customer.active
                ? 'border-support-error/40 bg-support-error/10 text-support-error'
                : 'border-accent/40 bg-accent/10 text-accent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            {toggling ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : null}
            {customer.active
              ? t('admin.customers.details.blockUser')
              : t('admin.customers.details.activateUser')}
          </button>
          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className={cn(
                'inline-flex flex-1 items-center justify-center rounded-2xl px-4 py-[13.6px]',
                'bg-gradient-to-r from-[#a394ff] to-[#8e7dff] text-sm font-bold text-white',
                'shadow-[0_10px_15px_-3px_rgba(163,148,255,0.2),0_4px_6px_-4px_rgba(163,148,255,0.2)]',
                'transition-opacity hover:opacity-95',
                focusRingClasses,
              )}
            >
              {t('admin.customers.details.contact')}
            </a>
          ) : (
            <button
              type="button"
              disabled
              title={t('admin.customers.details.contactUnavailable')}
              className={cn(
                'inline-flex flex-1 items-center justify-center rounded-2xl px-4 py-[13.6px]',
                'bg-gradient-to-r from-[#a394ff] to-[#8e7dff] text-sm font-bold text-white',
                'cursor-not-allowed opacity-50',
                focusRingClasses,
              )}
            >
              {t('admin.customers.details.contact')}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(detailToRow(customer))}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5',
              'text-xs font-semibold text-white/80 hover:bg-white/10',
              focusRingClasses,
            )}
          >
            <Pencil size={12} aria-hidden />
            {t('admin.customers.details.edit')}
          </button>
          <button
            type="button"
            onClick={() => onChangePassword?.(detailToRow(customer))}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5',
              'text-xs font-semibold text-white/80 hover:bg-white/10',
              focusRingClasses,
            )}
          >
            <KeyRound size={12} aria-hidden />
            {t('admin.customers.details.password')}
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(detailToRow(customer))}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-support-error/30 bg-support-error/10 px-3 py-2.5',
              'text-xs font-semibold text-support-error hover:bg-support-error/15',
              focusRingClasses,
            )}
          >
            <Trash2 size={12} aria-hidden />
            {t('admin.customers.details.delete')}
          </button>
        </div>
      </div>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={t('admin.customers.details.title')}
      description={t('admin.customers.details.subtitle')}
      onClose={onClose}
      width="customer"
      footer={footer}
    >
      {loading && !customer ? <CustomerDetailsSkeleton /> : null}

      {!loading && error ? (
        <EmptyState
          bare
          title={t('admin.customers.details.loadErrorTitle')}
          description={error}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.customers.retry')}
            </Button>
          }
        />
      ) : null}

      {!loading && !error && !customer ? (
        <EmptyState
          bare
          title={t('admin.customers.details.emptyTitle')}
          description={t('admin.customers.details.emptyDescription')}
        />
      ) : null}

      {customer && !error ? (
        <div className={cn('flex flex-col gap-10', loading && 'opacity-60')}>
          <div className="relative flex min-h-[8.8rem] flex-col items-center">
            <div className="relative">
              <span
                className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-[#a394ff] to-[#8e7dff] opacity-30 blur-[6.4px]"
                aria-hidden
              />
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt=""
                  className="relative size-[5.6rem] rounded-full border-4 border-[#1a1c29] object-cover"
                />
              ) : (
                <span
                  className="relative inline-flex size-[5.6rem] items-center justify-center rounded-full border-4 border-[#1a1c29] bg-[rgba(163,148,255,0.2)] text-xl font-bold text-[#a394ff]"
                  aria-hidden
                >
                  {customer.initials}
                </span>
              )}
              <span
                className={cn(
                  'absolute bottom-1 end-1 size-6 rounded-full border-4 border-[#1a1c29]',
                  customer.active ? 'bg-[#00d492]' : 'bg-white/30',
                )}
                title={statusLabel ?? undefined}
                aria-label={statusLabel ?? undefined}
              />
            </div>
            <h3 className="mt-4 text-center text-xl font-bold leading-7 text-white">
              {customer.name}
            </h3>
            <p className="mt-1 text-center text-sm font-medium leading-5 text-[#a394ff]">
              {statusLabel}
            </p>
          </div>

          <GlassCard
            className="flex h-[140px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-[13.6px] text-center"
            padding="none"
          >
            <p className="text-[8px] uppercase leading-[12px] tracking-[0.1em] text-white/40">
              {t('admin.customers.details.totalSpend')}
            </p>
            <p className="mt-2 text-2xl font-bold leading-8 text-white">
              {customer.totalSpend == null
                ? unavailable
                : formatCustomerMoney(customer.totalSpend, locale)}
            </p>
            <p className="mt-1 text-[8px] leading-[12px] text-white/30">
              {customer.ordersCount == null
                ? unavailable
                : t('admin.customers.details.ordersCount', {
                    count: customer.ordersCount,
                  })}
            </p>
          </GlassCard>

          <section className="flex flex-col gap-4" aria-labelledby="customer-contact-heading">
            <h4
              id="customer-contact-heading"
              className="text-sm font-bold leading-5 text-white"
            >
              {t('admin.customers.details.contactInfo')}
            </h4>
            <GlassCard
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2"
              padding="none"
            >
              <DetailField
                label={t('admin.customers.details.email')}
                value={customer.email ?? unavailable}
              />
              <DetailField
                label={t('admin.customers.details.phone')}
                value={customer.phone ?? unavailable}
              />
              <DetailField
                label={t('admin.customers.details.accountStatus')}
                value={statusLabel ?? unavailable}
              />
              <DetailField
                label={t('admin.customers.details.registered')}
                value={
                  customer.createdAt
                    ? formatCustomerDate(customer.createdAt, locale)
                    : unavailable
                }
              />
              <DetailField
                label={t('admin.customers.details.orders')}
                value={
                  customer.ordersCount == null
                    ? unavailable
                    : String(customer.ordersCount)
                }
              />
              <DetailField
                label={t('admin.customers.details.lastOrder')}
                value={
                  customer.lastOrderAt
                    ? formatCustomerDate(customer.lastOrderAt, locale)
                    : unavailable
                }
              />
            </GlassCard>
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="customer-addresses-heading">
            <h4
              id="customer-addresses-heading"
              className="text-sm font-bold leading-5 text-white"
            >
              {t('admin.customers.details.addresses')}
            </h4>
            {customer.addresses.length === 0 ? (
              <EmptyState
                bare
                className="rounded-2xl border border-white/10 bg-white/5 py-8"
                title={t('admin.customers.details.addressesEmpty')}
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {customer.addresses.map((address) => (
                  <li key={address.id}>
                    <GlassCard
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      padding="none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-white">
                          {address.label || t('admin.customers.details.addressFallback')}
                        </p>
                        {address.isDefault ? (
                          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[8px] font-medium uppercase tracking-wide text-accent">
                            {t('admin.customers.details.defaultAddress')}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-white/60">{address.line}</p>
                    </GlassCard>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  )
}
