// src/components/admin/settings/BannersManagerCard.tsx
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useAdminBanners } from '../../../hooks/useAdminBanners'
import type { BannerDrawerMode } from '../../../hooks/useBannerDrawer'
import { useAdminUrlOpen } from '../../../hooks/useAdminUrlOpen'
import { cn } from '../../../lib/cn'
import { ApiError } from '../../../lib/api'
import type { AdminBannerRow } from '../../../types/adminBanners'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { Dialog } from '../ui/Dialog'
import { EmptyState } from '../ui/EmptyState'
import { BannerDrawer } from './BannerDrawer'

function BannerThumbnail({ image, title }: { image: string; title: string }) {
  return (
    <div className="flex min-w-[10rem] items-center gap-3">
      {image ? (
        <img
          src={image}
          alt=""
          className="size-10 shrink-0 rounded-lg border border-white/10 object-cover"
        />
      ) : (
        <span
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[8px] font-bold text-[#a394ff]"
          aria-hidden
        />
      )}
      <span className="truncate text-sm font-bold text-white" title={title}>
        {title || '—'}
      </span>
    </div>
  )
}

/**
 * Banners Manager — list + create/edit drawer + delete confirmation.
 * FRONTEND_ADMIN_DASHBOARD.md §9. Settings main column, after Coupons/Offers.
 */
export function BannersManagerCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    banners,
    loading,
    error,
    reload,
    upsertBanner,
    toggleActive,
    deleteBanner,
  } = useAdminBanners()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<BannerDrawerMode>('create')
  const [editBanner, setEditBanner] = useState<AdminBannerRow | null>(null)

  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminBannerRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pendingBannerOpenId, setPendingBannerOpenId] = useState<string | null>(null)

  useAdminUrlOpen(setPendingBannerOpenId)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditBanner(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((banner: AdminBannerRow) => {
    setDrawerMode('edit')
    setEditBanner(banner)
    setDrawerOpen(true)
  }, [])

  useEffect(() => {
    if (!pendingBannerOpenId || loading) return
    const banner = banners.find((row) => row.id === pendingBannerOpenId)
    if (banner) {
      openEdit(banner)
      setPendingBannerOpenId(null)
    }
  }, [banners, loading, openEdit, pendingBannerOpenId])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditBanner(null)
  }, [])

  const handleSaved = useCallback(
    (banner: AdminBannerRow) => {
      upsertBanner(banner)
    },
    [upsertBanner],
  )

  const handleToggle = useCallback(
    async (banner: AdminBannerRow) => {
      const nextActive = !banner.isActive
      setTogglingId(banner.id)
      try {
        await toggleActive(banner.id, nextActive)
        toast.success(
          nextActive
            ? t('admin.settings.banners.toggleOnSuccess')
            : t('admin.settings.banners.toggleOffSuccess'),
        )
      } catch (err) {
        toast.error(
          t('admin.settings.banners.toggleError'),
          err instanceof ApiError ? err.message : undefined,
        )
      } finally {
        setTogglingId(null)
      }
    },
    [t, toast, toggleActive],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteBanner(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : t('admin.settings.banners.deleteError'),
      )
    } finally {
      setDeleting(false)
    }
  }, [deleteBanner, deleteTarget, t])

  const columns = useMemo<DataTableColumn<AdminBannerRow>[]>(
    () => [
      {
        id: 'banner',
        header: t('admin.settings.banners.columns.banner'),
        cell: (row) => <BannerThumbnail image={row.image} title={row.title} />,
      },
      {
        id: 'linkType',
        header: t('admin.settings.banners.columns.link'),
        cell: (row) => (
          <span className="text-sm text-white/60">
            {row.linkType === 'url' && row.externalUrl
              ? row.externalUrl
              : t(`admin.settings.banners.linkTypes.${row.linkType}`)}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.settings.banners.columns.status'),
        headerClassName: 'text-center',
        className: 'text-center',
        cell: (row) => (
          <button
            type="button"
            role="switch"
            aria-checked={row.isActive}
            disabled={togglingId === row.id}
            onClick={() => void handleToggle(row)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
              focusRingClasses,
              row.isActive ? 'bg-[#a394ff]' : 'bg-white/15',
              togglingId === row.id && 'cursor-not-allowed opacity-60',
            )}
            aria-label={t('admin.settings.banners.toggleAria', {
              title: row.title || row.id,
            })}
          >
            <span
              className={cn(
                'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
                row.isActive && 'translate-x-5 rtl:-translate-x-5',
              )}
              aria-hidden
            />
          </button>
        ),
      },
      {
        id: 'action',
        header: t('admin.settings.banners.columns.action'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                'transition-colors hover:bg-white/10 hover:text-white',
                focusRingClasses,
              )}
              aria-label={t('admin.settings.banners.editAria', {
                title: row.title || row.id,
              })}
            >
              <Pencil size={13} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                'transition-colors hover:bg-support-error/10 hover:text-support-error',
                focusRingClasses,
              )}
              aria-label={t('admin.settings.banners.deleteAria', {
                title: row.title || row.id,
              })}
            >
              <Trash2 size={13} aria-hidden />
            </button>
          </div>
        ),
      },
    ],
    [handleToggle, openEdit, t, togglingId],
  )

  const failed = Boolean(error) && !loading && banners.length === 0
  const staleError = Boolean(error) && banners.length > 0

  if (failed) {
    return (
      <EmptyState
        title={t('admin.settings.banners.loadErrorTitle')}
        description={error ?? t('admin.settings.loadErrorTitle')}
        className="rounded-[2rem]"
        action={
          <Button type="button" variant="outline" onClick={reload}>
            {t('admin.settings.retry')}
          </Button>
        }
      />
    )
  }

  return (
    <>
      {staleError ? (
        <p
          className="mb-3 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={banners}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle={t('admin.settings.banners.emptyTitle')}
        emptyDescription={t('admin.settings.banners.emptyDescription')}
        emptyAction={
          <Button type="button" variant="outline" onClick={reload}>
            {t('admin.settings.retry')}
          </Button>
        }
        aria-label={t('admin.settings.banners.aria')}
        className="rounded-[2rem]"
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
              {t('admin.settings.banners.title')}
            </h3>
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-semibold text-[#a394ff]',
                'transition-opacity hover:opacity-80',
                focusRingClasses,
              )}
            >
              <Plus size={13} aria-hidden />
              {t('admin.settings.banners.addBanner')}
            </button>
          </div>
        }
      />

      <BannerDrawer
        open={drawerOpen}
        mode={drawerMode}
        banner={editBanner}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        title={t('admin.settings.banners.deleteTitle')}
        description={
          deleteTarget
            ? t('admin.settings.banners.deleteDescription', {
                title: deleteTarget.title || deleteTarget.id,
              })
            : undefined
        }
        onClose={() => {
          if (deleting) return
          setDeleteTarget(null)
          setDeleteError(null)
        }}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              {t('admin.settings.banners.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? (
                <Loader2 size={13} className="animate-spin" aria-hidden />
              ) : null}
              {t('admin.settings.banners.confirmDelete')}
            </Button>
          </div>
        }
      >
        {deleteError ? (
          <p
            className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
            role="alert"
          >
            {deleteError}
          </p>
        ) : (
          <p className="text-sm text-white/60">
            {t('admin.settings.banners.deleteWarning')}
          </p>
        )}
      </Dialog>
    </>
  )
}
