// src/components/admin/settings/AdminUserDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useAdminUserDrawer,
  type AdminUserDrawerMode,
} from '../../../hooks/useAdminUserDrawer'
import { cn } from '../../../lib/cn'
import type { AdminUserRow } from '../../../types/adminUsers'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Select } from '../ui/Select'
import { Skeleton } from '../ui/Skeleton'

interface AdminUserDrawerProps {
  open: boolean
  mode: AdminUserDrawerMode
  adminId: string | null
  /** When true, Active cannot be turned off (self-lockout guard). */
  isSelf?: boolean
  onClose: () => void
  onSaved: (admin: AdminUserRow) => void
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

export function AdminUserDrawer({
  open,
  mode,
  adminId,
  isSelf = false,
  onClose,
  onSaved,
}: AdminUserDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()

  const drawer = useAdminUserDrawer({
    open,
    mode,
    adminId,
    isSelf,
    onSaved: (admin) => {
      toast.success(
        mode === 'create'
          ? t('admin.settings.admins.drawer.createSuccess')
          : t('admin.settings.admins.drawer.updateSuccess'),
      )
      onSaved(admin)
      onClose()
    },
  })

  const handleClose = useCallback(() => {
    if (drawer.submitting) return
    onClose()
  }, [drawer.submitting, onClose])

  const title =
    mode === 'create'
      ? t('admin.settings.admins.drawer.createTitle')
      : t('admin.settings.admins.drawer.editTitle')

  const footer =
    !drawer.loading && !drawer.loadError ? (
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
            {t('admin.settings.admins.drawer.saving')}
          </>
        ) : (
          t('admin.settings.admins.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.settings.admins.drawer.subtitle')}
      onClose={handleClose}
      width="formula"
      footer={footer}
    >
      {drawer.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : null}

      {!drawer.loading && drawer.loadError ? (
        <EmptyState
          bare
          title={t('admin.settings.admins.drawer.loadErrorTitle')}
          description={drawer.loadError}
        />
      ) : null}

      {!drawer.loading && !drawer.loadError ? (
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
              {t('admin.settings.admins.drawer.name')}
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              autoComplete="name"
              value={drawer.values.name}
              disabled={drawer.submitting}
              onChange={(event) => drawer.setField('name', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
              maxLength={60}
            />
            <FieldError message={drawer.errors.name} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-email`}>
              {t('admin.settings.admins.drawer.email')}
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              value={drawer.values.email}
              disabled={drawer.submitting}
              onChange={(event) => drawer.setField('email', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.email} />
          </div>

          {mode === 'create' ? (
            <div>
              <label className={labelClass} htmlFor={`${formId}-password`}>
                {t('admin.settings.admins.drawer.password')}
              </label>
              <input
                id={`${formId}-password`}
                type="password"
                autoComplete="new-password"
                value={drawer.values.password}
                disabled={drawer.submitting}
                onChange={(event) =>
                  drawer.setField('password', event.target.value)
                }
                className={cn(fieldClass, 'mt-2')}
                maxLength={128}
              />
              <FieldError message={drawer.errors.password} />
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor={`${formId}-adminRole`}>
              {t('admin.settings.admins.drawer.adminRole')}
              {mode === 'edit' ? (
                <span className="ms-1 font-normal text-white/40">
                  ({t('admin.settings.admins.drawer.adminRoleOptional')})
                </span>
              ) : null}
            </label>
            <Select
              id={`${formId}-adminRole`}
              value={drawer.values.adminRole}
              onValueChange={(value) => drawer.setField('adminRole', value)}
              options={drawer.roles.map((role) => ({
                value: role._id,
                label: role.name,
              }))}
              placeholder={
                drawer.rolesLoading
                  ? t('admin.settings.admins.drawer.adminRoleLoading')
                  : t('admin.settings.admins.drawer.adminRolePlaceholder')
              }
              disabled={drawer.submitting || drawer.rolesLoading}
              triggerClassName="mt-2"
              aria-invalid={Boolean(drawer.errors.adminRole)}
            />
            <FieldError message={drawer.errors.adminRole} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-title`}>
              {t('admin.settings.admins.drawer.adminTitle')}
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              value={drawer.values.adminTitle}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('adminTitle', event.target.value)
              }
              placeholder={t('admin.settings.admins.drawer.adminTitleOptional')}
              className={cn(fieldClass, 'mt-2')}
              maxLength={80}
            />
            <FieldError message={drawer.errors.adminTitle} />
          </div>

          {mode === 'edit' ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {t('admin.settings.admins.drawer.active')}
                </p>
                <p className="text-[8px] text-white/40">
                  {isSelf
                    ? 'You cannot disable your own account.'
                    : t('admin.settings.admins.drawer.activeHint')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={drawer.values.active}
                disabled={drawer.submitting || isSelf}
                onClick={() =>
                  drawer.setField('active', !drawer.values.active)
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
                  focusRingClasses,
                  drawer.values.active ? 'bg-[#a394ff]' : 'bg-white/15',
                  (drawer.submitting || isSelf) &&
                    'cursor-not-allowed opacity-60',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
                    drawer.values.active &&
                      'translate-x-5 rtl:-translate-x-5',
                  )}
                  aria-hidden
                />
              </button>
            </div>
          ) : null}
        </form>
      ) : null}
    </Drawer>
  )
}
