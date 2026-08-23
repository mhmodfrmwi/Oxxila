// src/components/admin/settings/AdminRolesManagerCard.tsx
import { Loader2, Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminRolesManager,
  type AdminRoleDrawerMode,
  type AdminRoleRow,
} from '../../../hooks/useAdminRolesManager'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { cn } from '../../../lib/cn'
import { AdminCan } from '../AdminCan'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { AdminRoleDrawer } from './AdminRoleDrawer'

function RoleRow({
  role,
  deleting,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  role: AdminRoleRow
  deleting: boolean
  canUpdate: boolean
  canDelete: boolean
  onEdit: (id: string) => void
  onDelete: (role: AdminRoleRow) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-[10.4px]">
      <button
        type="button"
        onClick={() => (canUpdate ? onEdit(role.id) : undefined)}
        disabled={!canUpdate}
        className={cn(
          'flex min-w-0 flex-1 flex-col items-start gap-1 text-start',
          focusRingClasses,
          'rounded-xl',
          !canUpdate && 'cursor-default',
        )}
      >
        <span className="truncate text-sm font-semibold text-white">
          {role.name}
        </span>
        {role.description ? (
          <span className="line-clamp-2 text-xs text-white/45">
            {role.description}
          </span>
        ) : null}
        {role.isSystem ? (
          <StatusBadge tone="neutral" className="mt-1 px-2 py-0.5 text-[7.2px] font-bold">
            {t('admin.roles.systemBadge')}
          </StatusBadge>
        ) : null}
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {canUpdate ? (
          <button
            type="button"
            onClick={() => onEdit(role.id)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-lg',
              'text-white/50 transition-colors hover:bg-white/10 hover:text-white',
              focusRingClasses,
            )}
            aria-label={t('admin.roles.editAria', { name: role.name })}
          >
            <Pencil size={13} aria-hidden />
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            disabled={deleting || role.isSystem}
            onClick={() => onDelete(role)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-lg',
              'text-white/50 transition-colors hover:bg-support-error/15 hover:text-support-error',
              'disabled:cursor-not-allowed disabled:opacity-40',
              focusRingClasses,
            )}
            aria-label={t('admin.roles.deleteAria', { name: role.name })}
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin" aria-hidden />
            ) : (
              <Trash2 size={13} aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** Permission role templates — CRUD matrix per admin tab. */
export function AdminRolesManagerCard() {
  const { t } = useTranslation()
  const { can } = useAdminPermissions()
  const canCreate = can('roles', 'create')
  const canUpdate = can('roles', 'update')
  const canDelete = can('roles', 'delete')
  const {
    roles,
    tabMeta,
    loading,
    error,
    deletingId,
    reload,
    removeRole,
  } = useAdminRolesManager()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<AdminRoleDrawerMode>('create')
  const [editRoleId, setEditRoleId] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditRoleId(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((roleId: string) => {
    setDrawerMode('edit')
    setEditRoleId(roleId)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditRoleId(null)
  }, [])

  const handleSaved = useCallback(() => {
    reload()
  }, [reload])

  const handleDelete = useCallback(
    (role: AdminRoleRow) => {
      void removeRole(role.id)
    },
    [removeRole],
  )

  const failed = Boolean(error) && !loading && roles.length === 0
  const staleError = Boolean(error) && roles.length > 0
  const empty = !loading && !error && roles.length === 0

  return (
    <>
      <GlassCard
        padding="lg"
        strong
        className="w-full rounded-[var(--admin-radius-2xl)]"
        aria-label={t('admin.roles.aria')}
        aria-busy={loading || undefined}
      >
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield size={19} className="text-[#a394ff]" aria-hidden />
            <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
              {t('admin.roles.title')}
            </h3>
          </div>
          <AdminCan tab="roles" action="create">
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-full',
                'bg-white/10 text-white transition-colors hover:bg-white/15',
                focusRingClasses,
              )}
              aria-label={t('admin.roles.addAria')}
            >
              <Plus size={13} aria-hidden />
            </button>
          </AdminCan>
        </div>


        {staleError ? (
          <p
            className="mb-4 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {loading && roles.length === 0 ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-[52.8px] w-full rounded-2xl" />
            <Skeleton className="h-[52.8px] w-full rounded-2xl" />
          </div>
        ) : null}

        {failed ? (
          <EmptyState
            bare
            className="py-8"
            title={t('admin.roles.loadErrorTitle')}
            description={error ?? t('admin.settings.loadErrorTitle')}
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
            title={t('admin.roles.emptyTitle')}
            description={t('admin.roles.emptyDescription')}
            action={
              canCreate ? (
                <Button type="button" variant="outline" onClick={openCreate}>
                  {t('admin.roles.addAria')}
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {roles.length > 0 ? (
          <div className={cn('flex flex-col gap-4', loading && 'opacity-60')}>
            {roles.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                deleting={deletingId === role.id}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : null}
      </GlassCard>

      {canCreate || canUpdate ? (
        <AdminRoleDrawer
          open={drawerOpen}
          mode={drawerMode}
          roleId={editRoleId}
          tabMeta={tabMeta}
          onClose={closeDrawer}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  )
}
