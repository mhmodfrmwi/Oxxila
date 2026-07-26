// src/components/admin/orders/OrderAssignPanel.tsx
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import {
  carrierDisabledReason,
  isBostaCarrier,
  type UseOrderAssignReturn,
} from '../../../hooks/useOrderAssign'
import { cn } from '../../../lib/cn'
import { Skeleton } from '../ui/Skeleton'

interface OrderAssignPanelProps {
  assign: UseOrderAssignReturn
  /** When true, Order Status is shown as a disabled readout of the current status. */
  orderStatusLabel: string
}

const SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'XLARGE'] as const

const fieldClass = cn(
  'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-[17px] py-[13px]',
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

/** Assign-carrier fields for Figma State 1 (before a carrier is committed). */
export function OrderAssignPanel({ assign, orderStatusLabel }: OrderAssignPanelProps) {
  const { t } = useTranslation()
  const formId = useId()

  if (assign.loading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-11 w-full rounded-xl" />
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

  return (
    <div className="flex w-full flex-col gap-4">
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
        <label className={labelClass} htmlFor={`${formId}-order-status`}>
          {t('admin.orders.details.orderStatus')}
        </label>
        <select
          id={`${formId}-order-status`}
          disabled
          value={orderStatusLabel}
          className={cn(fieldClass, 'mt-2')}
          aria-label={t('admin.orders.details.orderStatus')}
        >
          <option value={orderStatusLabel}>{orderStatusLabel}</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor={`${formId}-carrier`}>
          {t('admin.orders.details.assign.carrier')}
        </label>
        {assign.carriers.length === 0 ? (
          <p className="mt-2 text-xs text-white/40">
            {t('admin.orders.details.assign.noCarriers')}
          </p>
        ) : (
          <select
            id={`${formId}-carrier`}
            value={assign.form.carrierId}
            disabled={assign.submitting}
            onChange={(event) => assign.selectCarrier(event.target.value)}
            className={cn(fieldClass, 'mt-2')}
          >
            <option value="">{t('admin.orders.details.assign.carrierPlaceholder')}</option>
            {assign.carriers.map((carrier) => {
              const disabledReason = carrierDisabledReason(
                carrier,
                assign.districtCovered,
              )
              return (
                <option
                  key={carrier._id}
                  value={carrier._id}
                  disabled={Boolean(disabledReason)}
                >
                  {carrier.name}
                  {disabledReason
                    ? ` — ${t(
                        `admin.orders.details.assign.disabled${
                          disabledReason === 'coverage'
                            ? 'Coverage'
                            : disabledReason === 'pickups'
                              ? 'Pickups'
                              : 'District'
                        }`,
                      )}`
                    : ''}
                </option>
              )
            })}
          </select>
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
              placeholder={t('admin.orders.details.assign.driverNamePlaceholder')}
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
              placeholder={t('admin.orders.details.assign.driverPhonePlaceholder')}
              onChange={(event) => assign.setField('driverPhone', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={assign.formErrors.driverPhone} />
          </div>
        </>
      ) : null}

      <div>
        <label className={labelClass} htmlFor={`${formId}-notes`}>
          {t('admin.orders.details.assign.notes')}
        </label>
        <input
          id={`${formId}-notes`}
          type="text"
          value={assign.form.notes}
          disabled={assign.submitting}
          placeholder={t('admin.orders.details.assign.notesPlaceholder')}
          onChange={(event) => assign.setField('notes', event.target.value)}
          className={cn(fieldClass, 'mt-2')}
        />
      </div>
    </div>
  )
}
