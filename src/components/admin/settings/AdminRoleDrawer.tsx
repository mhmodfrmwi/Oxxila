// src/components/admin/settings/AdminRoleDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useAdminRoleDrawer,
  type AdminRoleDrawerMode,
  type AdminRoleRow,
} from '../../../hooks/useAdminRolesManager'
import { cn } from '../../../lib/cn'
import type {
  AdminCrudAction,
  AdminTabKey,
  ApiAdminRoleTabMeta,
} from '../../../types/adminPermissions'
import { ADMIN_TAB_KEYS } from '../../../types/adminPermissions'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface AdminRoleDrawerProps {
  open: boolean
  mode: AdminRoleDrawerMode
  roleId: string | null
  tabMeta: readonly ApiAdminRoleTabMeta[]
  onClose: () => void
  onSaved: (role: AdminRoleRow) => void
}

const CRUD_ACTIONS: AdminCrudAction[] = ['create', 'read', 'update', 'delete']

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

function tabLabel(
  tabMeta: readonly ApiAdminRoleTabMeta[],
  key: AdminTabKey,
): string {
  return tabMeta.find((entry) => entry.key === key)?.label ?? key
}

export function AdminRoleDrawer({
  open,
  mode,
  roleId,
  tabMeta,
  onClose,
  onSaved,
}: AdminRoleDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()

  const drawer = useAdminRoleDrawer({
    open,
    mode,
    roleId,
    tabMeta,
    onSaved: (role) => {
      toast.success(
        mode === 'create'
          ? t('admin.roles.drawer.createSuccess')
          : t('admin.roles.drawer.updateSuccess'),
      )
      onSaved(role)
      onClose()
    },
  })

  const handleClose = useCallback(() => {
    if (drawer.submitting) return
    onClose()
  }, [drawer.submitting, onClose])

  const title =
    mode === 'create'
      ? t('admin.roles.drawer.createTitle')
      : t('admin.roles.drawer.editTitle')

  const permissionsLocked = drawer.isSystemRole

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
            {t('admin.roles.drawer.saving')}
          </>
        ) : (
          t('admin.roles.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.roles.drawer.subtitle')}
      onClose={handleClose}
      width="formula"
      footer={footer}
    >
      {drawer.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : null}

      {!drawer.loading && drawer.loadError ? (
        <EmptyState
          bare
          title={t('admin.roles.drawer.loadErrorTitle')}
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

          {permissionsLocked ? (
            <p className="rounded-xl border border-[#a394ff]/30 bg-[#a394ff]/10 px-4 py-3 text-xs text-[#d4ccff]">
              {t('admin.roles.drawer.systemRoleHint')}
            </p>
          ) : null}

          <div>
            <label className={labelClass} htmlFor={`${formId}-name`}>
              {t('admin.roles.drawer.name')}
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={drawer.values.name}
              disabled={drawer.submitting || permissionsLocked}
              onChange={(event) => drawer.setField('name', event.target.value)}
              className={cn(fieldClass, 'mt-2')}
              maxLength={60}
            />
            <FieldError message={drawer.errors.name} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-description`}>
              {t('admin.roles.drawer.description')}
            </label>
            <textarea
              id={`${formId}-description`}
              value={drawer.values.description}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('description', event.target.value)
              }
              className={cn(fieldClass, 'mt-2 min-h-[88px] resize-y')}
              maxLength={500}
            />
            <FieldError message={drawer.errors.description} />
          </div>

          <fieldset
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            disabled={drawer.submitting || permissionsLocked}
          >
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
              {t('admin.roles.drawer.permissions')}
            </legend>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-2 py-2 text-start font-medium">
                      {t('admin.roles.drawer.tabColumn')}
                    </th>
                    {CRUD_ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="px-2 py-2 text-center font-medium capitalize"
                      >
                        {t(`admin.roles.actions.${action}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_TAB_KEYS.map((tab) => (
                    <tr key={tab} className="border-b border-white/5">
                      <td className="px-2 py-2 text-sm text-white/80">
                        {tabLabel(drawer.tabMeta, tab)}
                      </td>
                      {CRUD_ACTIONS.map((action) => (
                        <td key={action} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              drawer.values.permissions[tab]?.[action],
                            )}
                            disabled={drawer.submitting || permissionsLocked}
                            onChange={(event) =>
                              drawer.togglePermission(
                                tab,
                                action,
                                event.target.checked,
                              )
                            }
                            className="size-4 rounded border-white/20 bg-white/5 accent-[#a394ff]"
                            aria-label={`${tabLabel(drawer.tabMeta, tab)} ${action}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>
        </form>
      ) : null}
    </Drawer>
  )
}
