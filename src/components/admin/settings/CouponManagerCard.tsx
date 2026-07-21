// src/components/admin/settings/CouponManagerCard.tsx
import { Pencil } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminCoupons } from '../../../hooks/useAdminCoupons'
import type { CouponDrawerMode } from '../../../hooks/useCouponDrawer'
import { cn } from '../../../lib/cn'
import type { AdminCouponRow } from '../../../types/adminCoupons'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { EmptyState } from '../ui/EmptyState'
import { StatusBadge } from '../ui/StatusBadge'
import { CouponDrawer } from './CouponDrawer'

/**
 * Coupon Manager — list + create/edit drawer (Phase 7C).
 * Figma Settings `937:21865` Coupon Manager card.
 */
export function CouponManagerCard() {
  const { t } = useTranslation()
  const {
    coupons,
    pagination,
    loading,
    error,
    page,
    setPage,
    reload,
    upsertCoupon,
  } = useAdminCoupons()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<CouponDrawerMode>('create')
  const [editCouponId, setEditCouponId] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditCouponId(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((couponId: string) => {
    setDrawerMode('edit')
    setEditCouponId(couponId)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditCouponId(null)
  }, [])

  const handleSaved = useCallback(
    (coupon: AdminCouponRow) => {
      upsertCoupon(coupon)
      if (drawerMode === 'create') {
        reload()
      }
    },
    [drawerMode, reload, upsertCoupon],
  )

  const columns = useMemo<DataTableColumn<AdminCouponRow>[]>(
    () => [
      {
        id: 'code',
        header: t('admin.settings.coupons.columns.code'),
        cell: (row) => (
          <span className="text-sm font-bold tracking-[0.05em] text-[#e2e2e2]">
            {row.code}
          </span>
        ),
      },
      {
        id: 'discount',
        header: t('admin.settings.coupons.columns.discount'),
        cell: (row) => (
          <span className="text-sm font-semibold text-[#a394ff]">
            {row.discountLabel}
          </span>
        ),
      },
      {
        id: 'usage',
        header: t('admin.settings.coupons.columns.usage'),
        cell: (row) => (
          <span className="text-sm font-medium tabular-nums text-[#e2e2e2]">
            {row.usageLabel}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.settings.coupons.columns.status'),
        cell: (row) => (
          <StatusBadge
            tone={row.isActive ? 'success' : 'neutral'}
            className="px-2 py-0.5 text-[10px] font-bold"
          >
            {row.isActive
              ? t('admin.settings.coupons.active')
              : t('admin.settings.coupons.inactive')}
          </StatusBadge>
        ),
      },
      {
        id: 'action',
        header: t('admin.settings.coupons.columns.action'),
        headerClassName: 'text-end',
        className: 'text-end',
        cell: (row) => (
          <button
            type="button"
            onClick={() => openEdit(row.id)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
              'transition-colors hover:bg-white/10 hover:text-white',
              focusRingClasses,
            )}
            aria-label={t('admin.settings.coupons.editAria', { code: row.code })}
          >
            <Pencil size={16} aria-hidden />
          </button>
        ),
      },
    ],
    [openEdit, t],
  )

  const failed = Boolean(error) && !loading && coupons.length === 0
  const staleError = Boolean(error) && coupons.length > 0
  const currentPage = pagination?.currentPage ?? page
  const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages && totalPages > 1

  if (failed) {
    return (
      <EmptyState
        title={t('admin.settings.coupons.loadErrorTitle')}
        description={error ?? t('admin.settings.loadErrorTitle')}
        className="rounded-[2.5rem]"
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
        rows={coupons}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle={t('admin.settings.coupons.emptyTitle')}
        emptyDescription={t('admin.settings.coupons.emptyDescription')}
        emptyAction={
          <Button type="button" variant="outline" onClick={reload}>
            {t('admin.settings.retry')}
          </Button>
        }
        aria-label={t('admin.settings.coupons.aria')}
        className="rounded-[2.5rem]"
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-[family-name:var(--admin-font-display)] text-xl font-normal text-white">
              {t('admin.settings.coupons.title')}
            </h3>
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                'text-sm font-semibold text-[#a394ff]',
                'transition-opacity hover:opacity-80',
                focusRingClasses,
              )}
            >
              {t('admin.settings.coupons.createCode')}
            </button>
          </div>
        }
        footer={
          totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={!canGoPrev || loading}
                onClick={() => setPage(currentPage - 1)}
                className={cn(
                  'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/50',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  focusRingClasses,
                )}
              >
                {t('admin.settings.coupons.prev')}
              </button>
              <button
                type="button"
                disabled={!canGoNext || loading}
                onClick={() => setPage(currentPage + 1)}
                className={cn(
                  'rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  focusRingClasses,
                )}
              >
                {t('admin.settings.coupons.next')}
              </button>
            </div>
          ) : undefined
        }
      />

      <CouponDrawer
        open={drawerOpen}
        mode={drawerMode}
        couponId={editCouponId}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />
    </>
  )
}
