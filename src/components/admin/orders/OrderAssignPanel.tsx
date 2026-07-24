// src/components/admin/orders/OrderAssignPanel.tsx
import { Loader2, Truck } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  carrierDisabledReason,
  isBostaCarrier,
  type UseOrderAssignReturn,
} from '../../../hooks/useOrderAssign'
import { cn } from '../../../lib/cn'
import type { AdminCarrierType } from '../../../types/adminShipping'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Skeleton } from '../ui/Skeleton'

interface OrderAssignPanelProps {
  assign: UseOrderAssignReturn
  hasAssignedCarrier: boolean
  carrierType: AdminCarrierType | null
  /** Called after a successful assign/status update (reload drawer + list). */
  onSuccess: () => void
}

const SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'XLARGE'] as const
const MANUAL_STATUSES = [
  'processing',
  'shipped',
  'out_for_delivery',
  'failed_attempt',
  'delivered',
  'returned',
  'cancelled',
] as const

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function FieldError({ message }: { message?: string }) {
  const { t } = useTranslation()
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-support-error">
      {t(`admin.orders.details.assign.errors.${message}`, { defaultValue: message })}
    </p>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Truck size={13} className="text-[#a394ff]" aria-hidden />
      <h3 className="text-sm font-bold leading-5 text-white">{children}</h3>
    </div>
  )
}

export function OrderAssignPanel({
  assign,
  hasAssignedCarrier,
  carrierType,
  onSuccess,
}: OrderAssignPanelProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()

  const handleAssign = async () => {
    const ok = await assign.submitAssign()
    if (ok) {
      toast.success(t('admin.orders.details.assign.success'))
      onSuccess()
    }
  }

  const handleManualStatus = async () => {
    const ok = await assign.submitManualStatus()
    if (ok) {
      toast.success(t('admin.orders.details.manualStatus.success'))
      onSuccess()
    }
  }

  if (assign.loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    )
  }

  if (assign.loadError) {
    return (
      <p
        className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
        role="alert"
      >
        {assign.loadError}
      </p>
    )
  }

  if (hasAssignedCarrier) {
    if (carrierType === 'api') {
      return (
        <section className="flex w-full flex-col gap-3">
          <SectionHeading>{t('admin.orders.details.manualStatus.title')}</SectionHeading>
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
            {t('admin.orders.details.manualStatus.bostaNote')}
          </p>
        </section>
      )
    }

    return (
      <section className="flex w-full flex-col gap-4">
        <SectionHeading>{t('admin.orders.details.manualStatus.title')}</SectionHeading>
        <p className="text-xs text-white/40">
          {t('admin.orders.details.manualStatus.subtitle')}
        </p>

        {assign.manualError ? (
          <p
            className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
            role="alert"
          >
            {assign.manualError}
          </p>
        ) : null}

        <div>
          <label className={labelClass} htmlFor={`${formId}-manual-status`}>
            {t('admin.orders.details.manualStatus.label')}
          </label>
          <select
            id={`${formId}-manual-status`}
            value={assign.manualStatus}
            disabled={assign.manualSubmitting}
            onChange={(event) =>
              assign.setManualStatus(
                event.target.value as (typeof MANUAL_STATUSES)[number],
              )
            }
            className={cn(fieldClass, 'mt-2')}
          >
            {MANUAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`admin.orders.orderStatus.${status}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-manual-notes`}>
            {t('admin.orders.details.manualStatus.notes')}
          </label>
          <textarea
            id={`${formId}-manual-notes`}
            value={assign.manualNotes}
            disabled={assign.manualSubmitting}
            onChange={(event) => assign.setManualNotes(event.target.value)}
            rows={2}
            className={cn(fieldClass, 'mt-2 resize-none')}
          />
        </div>

        <button
          type="button"
          disabled={assign.manualSubmitting}
          onClick={() => void handleManualStatus()}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3',
            'text-sm font-bold text-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {assign.manualSubmitting ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden />
              {t('admin.orders.details.manualStatus.submitting')}
            </>
          ) : (
            t('admin.orders.details.manualStatus.submit')
          )}
        </button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <SectionHeading>{t('admin.orders.details.assign.title')}</SectionHeading>
      <p className="text-xs text-white/40">{t('admin.orders.details.assign.subtitle')}</p>

      {assign.submitError ? (
        <p
          className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {assign.submitError}
        </p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor={`${formId}-size`}>
          {t('admin.orders.details.assign.packageSize')}
        </label>
        <select
          id={`${formId}-size`}
          value={assign.form.size}
          disabled={assign.submitting}
          onChange={(event) =>
            assign.setField('size', event.target.value as (typeof SIZES)[number])
          }
          className={cn(fieldClass, 'mt-2')}
        >
          {SIZES.map((size) => (
            <option key={size} value={size}>
              {t(`admin.orders.details.assign.sizes.${size}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className={labelClass}>{t('admin.orders.details.assign.carrier')}</p>
        {assign.carriers.length === 0 ? (
          <p className="mt-2 text-xs text-white/40">
            {t('admin.orders.details.assign.noCarriers')}
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {assign.carriers.map((carrier) => {
              const disabledReason = carrierDisabledReason(carrier, assign.districtCovered)
              const disabled = Boolean(disabledReason) || assign.submitting
              const active = assign.form.carrierId === carrier._id
              return (
                <label
                  key={carrier._id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                    focusRingClasses,
                    active
                      ? 'border-[#a394ff]/50 bg-[rgba(163,148,255,0.12)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/[0.07]',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="radio"
                    name={`${formId}-carrier`}
                    value={carrier._id}
                    checked={active}
                    disabled={disabled}
                    onChange={() => assign.selectCarrier(carrier._id)}
                    className="mt-1 accent-[#a394ff]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">
                      {carrier.name}{' '}
                      <span className="text-xs font-normal text-white/40">
                        ({carrier.type})
                      </span>
                    </span>
                    {disabledReason ? (
                      <span className="block text-xs text-support-error">
                        {t(`admin.orders.details.assign.disabled${
                          disabledReason === 'coverage'
                            ? 'Coverage'
                            : disabledReason === 'pickups'
                              ? 'Pickups'
                              : 'District'
                        }`)}
                      </span>
                    ) : null}
                  </span>
                </label>
              )
            })}
          </div>
        )}
        <FieldError message={assign.formErrors.carrierId} />
      </div>

      {assign.form.carrierId && isBostaCarrier(assign.selectedCarrier) ? (
        <div>
          <label className={labelClass} htmlFor={`${formId}-pickup`}>
            {t('admin.orders.details.assign.pickup')}
          </label>
          <select
            id={`${formId}-pickup`}
            value={assign.form.pickupId}
            disabled={assign.submitting}
            onChange={(event) => assign.setField('pickupId', event.target.value)}
            className={cn(fieldClass, 'mt-2')}
          >
            <option value="">{t('admin.orders.details.assign.pickupPlaceholder')}</option>
            {assign.pickupOptions.map((pickup) => (
              <option key={pickup._id} value={pickup._id}>
                {pickup.locationName}
                {pickup.isDefault ? ' ★' : ''}
              </option>
            ))}
          </select>
          <FieldError message={assign.formErrors.pickupId} />
        </div>
      ) : null}

      {assign.form.carrierId && !isBostaCarrier(assign.selectedCarrier) ? (
        <>
          <div>
            <label className={labelClass} htmlFor={`${formId}-driver-name`}>
              {t('admin.orders.details.assign.driverName')}
            </label>
            <input
              id={`${formId}-driver-name`}
              type="text"
              value={assign.form.driverName}
              disabled={assign.submitting}
              onChange={(event) => assign.setField('driverName', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={assign.formErrors.driverName} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${formId}-driver-phone`}>
              {t('admin.orders.details.assign.driverPhone')}
            </label>
            <input
              id={`${formId}-driver-phone`}
              type="tel"
              value={assign.form.driverPhone}
              disabled={assign.submitting}
              onChange={(event) => assign.setField('driverPhone', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={assign.formErrors.driverPhone} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${formId}-tracking`}>
              {t('admin.orders.details.assign.trackingNumber')}
            </label>
            <input
              id={`${formId}-tracking`}
              type="text"
              value={assign.form.trackingNumber}
              disabled={assign.submitting}
              onChange={(event) => assign.setField('trackingNumber', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
          </div>
        </>
      ) : null}

      <div>
        <label className={labelClass} htmlFor={`${formId}-notes`}>
          {t('admin.orders.details.assign.notes')}
        </label>
        <textarea
          id={`${formId}-notes`}
          value={assign.form.notes}
          disabled={assign.submitting}
          onChange={(event) => assign.setField('notes', event.target.value)}
          rows={2}
          className={cn(fieldClass, 'mt-2 resize-none')}
        />
      </div>

      <button
        type="button"
        disabled={assign.submitting}
        onClick={() => void handleAssign()}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-2xl',
          'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3',
          'text-sm font-bold text-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClasses,
        )}
      >
        {assign.submitting ? (
          <>
            <Loader2 size={13} className="animate-spin" aria-hidden />
            {t('admin.orders.details.assign.submitting')}
          </>
        ) : (
          t('admin.orders.details.assign.submit')
        )}
      </button>
    </section>
  )
}
