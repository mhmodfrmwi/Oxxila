// src/components/admin/customers/CustomerDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useCustomerDrawer,
  type CustomerDrawerMode,
} from '../../../hooks/useCustomerDrawer'
import { cn } from '../../../lib/cn'
import type { AdminCustomerRow } from '../../../types/adminCustomers'
import {
  ADMIN_CUSTOMER_NAME_MAX,
  ADMIN_CUSTOMER_PASSWORD_MAX,
  ADMIN_CUSTOMER_PHONE_MAX,
} from '../../../utils/adminCustomersFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'

interface CustomerDrawerProps {
  open: boolean
  mode: CustomerDrawerMode
  customer: AdminCustomerRow | null
  onClose: () => void
  onSaved: (customer: AdminCustomerRow) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-support-error">{message}</p>
}

export function CustomerDrawer({
  open,
  mode,
  customer,
  onClose,
  onSaved,
}: CustomerDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()

  const drawer = useCustomerDrawer({
    open,
    mode,
    customer,
    onSaved: (saved) => {
      toast.success(
        mode === 'create'
          ? t('admin.customers.drawer.createSuccess')
          : t('admin.customers.drawer.updateSuccess'),
      )
      onSaved(saved)
      onClose()
    },
  })

  const handleClose = useCallback(() => {
    if (drawer.submitting) return
    onClose()
  }, [drawer.submitting, onClose])

  const title =
    mode === 'create'
      ? t('admin.customers.drawer.createTitle')
      : t('admin.customers.drawer.editTitle')

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.customers.drawer.subtitle')}
      onClose={handleClose}
      width="settings"
      footer={
        <button
          type="submit"
          form={formId}
          disabled={drawer.submitting}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3.5',
            'text-sm font-bold text-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {drawer.submitting ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden />
              {t('admin.customers.drawer.saving')}
            </>
          ) : (
            t('admin.customers.drawer.save')
          )}
        </button>
      }
    >
      <form
        id={formId}
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void drawer.submit()
        }}
      >
        {drawer.submitError ? (
          <p
            className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
            role="alert"
          >
            {drawer.submitError}
          </p>
        ) : null}

        <div>
          <label className={labelClass} htmlFor={`${formId}-name`}>
            {t('admin.customers.drawer.name')}
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={drawer.values.name}
            disabled={drawer.submitting}
            onChange={(event) => drawer.setField('name', event.target.value)}
            maxLength={ADMIN_CUSTOMER_NAME_MAX}
            className={cn(fieldClass, 'mt-2')}
            autoComplete="name"
          />
          <FieldError message={drawer.errors.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-email`}>
            {t('admin.customers.drawer.email')}
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            value={drawer.values.email}
            disabled={drawer.submitting}
            onChange={(event) => drawer.setField('email', event.target.value)}
            className={cn(fieldClass, 'mt-2')}
            autoComplete="email"
          />
          <FieldError message={drawer.errors.email} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-phone`}>
            {t('admin.customers.drawer.phone')}
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            value={drawer.values.phone}
            disabled={drawer.submitting}
            onChange={(event) => drawer.setField('phone', event.target.value)}
            maxLength={ADMIN_CUSTOMER_PHONE_MAX}
            className={cn(fieldClass, 'mt-2')}
            autoComplete="tel"
          />
          <p className="mt-1 text-[8px] text-white/40">
            {t('admin.customers.drawer.phoneOptional')}
          </p>
          <FieldError message={drawer.errors.phone} />
        </div>

        {mode === 'create' ? (
          <div>
            <label className={labelClass} htmlFor={`${formId}-password`}>
              {t('admin.customers.drawer.password')}
            </label>
            <input
              id={`${formId}-password`}
              type="password"
              value={drawer.values.password}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('password', event.target.value)
              }
              maxLength={ADMIN_CUSTOMER_PASSWORD_MAX}
              className={cn(fieldClass, 'mt-2')}
              autoComplete="new-password"
            />
            <p className="mt-1 text-[8px] text-white/40">
              {t('admin.customers.drawer.passwordHint')}
            </p>
            <FieldError message={drawer.errors.password} />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {t('admin.customers.drawer.active')}
            </p>
            <p className="text-[8px] text-white/40">
              {t('admin.customers.drawer.activeHint')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={drawer.values.active}
            aria-label={t('admin.customers.drawer.active')}
            disabled={drawer.submitting}
            onClick={() => drawer.setField('active', !drawer.values.active)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
              focusRingClasses,
              drawer.values.active ? 'bg-[#a394ff]' : 'bg-white/15',
              drawer.submitting && 'cursor-not-allowed opacity-60',
            )}
          >
            <span
              className={cn(
                'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
                drawer.values.active && 'translate-x-5 rtl:-translate-x-5',
              )}
              aria-hidden
            />
          </button>
        </div>
      </form>
    </Drawer>
  )
}
