// src/components/admin/settings/AdminRolesCard.tsx
import { Lock, LockOpen, Loader2, Plus, Shield } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminUsers } from '../../../hooks/useAdminUsers'
import type { AdminUserDrawerMode } from '../../../hooks/useAdminUserDrawer'
import { cn } from '../../../lib/cn'
import type { AdminUserRow } from '../../../types/adminUsers'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { AdminUserDrawer } from './AdminUserDrawer'

const AVATAR_COLORS = ['bg-[#314158]', 'bg-[#45556c]', 'bg-[#3d4f66]'] as const

function AdminRow({
  admin,
  index,
  locking,
  isSelf,
  onEdit,
  onToggleLock,
}: {
  admin: AdminUserRow
  index: number
  locking: boolean
  isSelf: boolean
  onEdit: (id: string) => void
  onToggleLock: (admin: AdminUserRow) => void
}) {
  const { t } = useTranslation()
  const lockDisabled = locking || (isSelf && admin.active)

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-[10.4px]">
      <button
        type="button"
        onClick={() => onEdit(admin.id)}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-4 text-start',
          focusRingClasses,
          'rounded-xl',
        )}
      >
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
            'text-[8px] font-bold text-white',
            AVATAR_COLORS[index % AVATAR_COLORS.length],
          )}
          aria-hidden
        >
          {admin.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5 text-white">
            {admin.name}
          </p>
          <p
            className={cn(
              'truncate text-[8px] uppercase leading-[12px]',
              admin.active ? 'text-[#a394ff]' : 'text-white/30',
            )}
          >
            {admin.titleLabel}
          </p>
          <StatusBadge
            tone={admin.active ? 'success' : 'neutral'}
            className="mt-1 px-2 py-0.5 text-[7.2px] font-bold"
          >
            {admin.active
              ? t('admin.settings.admins.active')
              : t('admin.settings.admins.disabled')}
          </StatusBadge>
        </div>
      </button>

      <button
        type="button"
        disabled={lockDisabled}
        onClick={() => onToggleLock(admin)}
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
          'text-white/50 transition-colors hover:bg-white/10 hover:text-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClasses,
        )}
        aria-label={
          isSelf && admin.active
            ? 'You cannot lock your own account'
            : admin.active
              ? t('admin.settings.admins.lockAria', { name: admin.name })
              : t('admin.settings.admins.unlockAria', { name: admin.name })
        }
        title={
          isSelf && admin.active
            ? 'You cannot lock your own account'
            : admin.active
              ? t('admin.settings.admins.lock')
              : t('admin.settings.admins.unlock')
        }
      >
        {locking ? (
          <Loader2 size={13} className="animate-spin" aria-hidden />
        ) : admin.active ? (
          <Lock size={13} aria-hidden />
        ) : (
          <LockOpen size={13} aria-hidden />
        )}
      </button>
    </div>
  )
}

/**
 * Admin Roles — list + create/edit drawer + lock/unlock (Phase 7E).
 * Figma Settings `937:22011`. Lock/unlock maps to backend `active`.
 */
export function AdminRolesCard() {
  const { t } = useTranslation()
  const {
    admins,
    loading,
    error,
    lockingId,
    currentUserId,
    reload,
    upsertAdmin,
    setActive,
  } = useAdminUsers()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<AdminUserDrawerMode>('create')
  const [editAdminId, setEditAdminId] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditAdminId(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((adminId: string) => {
    setDrawerMode('edit')
    setEditAdminId(adminId)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditAdminId(null)
  }, [])

  const handleSaved = useCallback(
    (admin: AdminUserRow) => {
      upsertAdmin(admin)
      if (drawerMode === 'create') {
        reload()
      }
    },
    [drawerMode, reload, upsertAdmin],
  )

  const handleToggleLock = useCallback(
    (admin: AdminUserRow) => {
      void setActive(admin.id, !admin.active)
    },
    [setActive],
  )

  const failed = Boolean(error) && !loading && admins.length === 0
  const staleError = Boolean(error) && admins.length > 0
  const empty = !loading && !error && admins.length === 0

  return (
    <>
      <GlassCard
        padding="lg"
        strong
        className="w-full rounded-[var(--admin-radius-2xl)]"
        aria-label={t('admin.settings.admins.aria')}
        aria-busy={loading || undefined}
      >
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield size={19} className="text-[#a394ff]" aria-hidden />
            <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
              {t('admin.settings.admins.title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-full',
              'bg-white/10 text-white transition-colors hover:bg-white/15',
              focusRingClasses,
            )}
            aria-label={t('admin.settings.admins.addAria')}
          >
            <Plus size={13} aria-hidden />
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

        {loading && admins.length === 0 ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-[52.8px] w-full rounded-2xl" />
            <Skeleton className="h-[52.8px] w-full rounded-2xl" />
          </div>
        ) : null}

        {failed ? (
          <EmptyState
            bare
            className="py-8"
            title={t('admin.settings.admins.loadErrorTitle')}
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
            title={t('admin.settings.admins.emptyTitle')}
            description={t('admin.settings.admins.emptyDescription')}
            action={
              <Button type="button" variant="outline" onClick={reload}>
                {t('admin.settings.retry')}
              </Button>
            }
          />
        ) : null}

        {admins.length > 0 ? (
          <div
            className={cn('flex flex-col gap-4', loading && 'opacity-60')}
          >
            {admins.map((admin, index) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                index={index}
                locking={lockingId === admin.id}
                isSelf={Boolean(currentUserId && admin.id === currentUserId)}
                onEdit={openEdit}
                onToggleLock={handleToggleLock}
              />
            ))}
          </div>
        ) : null}
      </GlassCard>

      <AdminUserDrawer
        open={drawerOpen}
        mode={drawerMode}
        adminId={editAdminId}
        isSelf={Boolean(
          editAdminId && currentUserId && editAdminId === currentUserId,
        )}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />
    </>
  )
}
