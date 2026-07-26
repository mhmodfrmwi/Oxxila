// src/pages/admin/AdminShippingPage.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteAdminCarrier } from '../../api/admin/carriers'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { CarrierDrawer } from '../../components/admin/shipping/CarrierDrawer'
import { CourierCompaniesTable } from '../../components/admin/shipping/CourierCompaniesTable'
import { ShippingMethodPanel } from '../../components/admin/shipping/ShippingMethodPanel'
import { ZoneManager } from '../../components/admin/shipping/ZoneManager'
import { Dialog } from '../../components/admin/ui/Dialog'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'
import type { CarrierDrawerMode } from '../../hooks/useCarrierForm'
import { useAdminShipping } from '../../hooks/useAdminShipping'
import { ApiError } from '../../lib/api'
import type { AdminCarrierRow } from '../../types/adminShipping'

/**
 * Shipping Management — Methods → Carriers → Zones.
 * Carrier assignment to orders lives on the Orders page, not here.
 */
export function AdminShippingPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const list = useAdminShipping()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<CarrierDrawerMode>('create')
  const [editingCarrier, setEditingCarrier] = useState<AdminCarrierRow | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<AdminCarrierRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditingCarrier(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((carrier: AdminCarrierRow) => {
    setDrawerMode('edit')
    setEditingCarrier(carrier)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const handleSaved = useCallback(
    (carrier: AdminCarrierRow) => {
      list.upsertCarrier(carrier)
      setEditingCarrier(carrier)
      toast.success(
        drawerMode === 'create'
          ? t('admin.shipping.carriers.drawer.createSuccess')
          : t('admin.shipping.carriers.drawer.updateSuccess'),
      )
    },
    [drawerMode, list, t, toast],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAdminCarrier(deleteTarget.id)
      list.removeCarrier(deleteTarget.id)
      toast.success(t('admin.shipping.carriers.deleteSuccess'))
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(
        error instanceof ApiError
          ? error.message
          : t('admin.shipping.carriers.deleteError'),
      )
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, list, t, toast])

  const carriersFailed =
    Boolean(list.error) && !list.loading && list.allCarriers.length === 0

  const emptyTitle = list.hasActiveFilters
    ? t('admin.shipping.carriers.emptyFilteredTitle')
    : t('admin.shipping.carriers.emptyTitle')
  const emptyDescription = list.hasActiveFilters
    ? t('admin.shipping.carriers.emptyFilteredDescription')
    : t('admin.shipping.carriers.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.shipping.title')}
        subtitle={t('admin.shipping.subtitle')}
      />

      {carriersFailed ? (
        <EmptyState
          title={t('admin.shipping.loadErrorTitle')}
          description={list.error ?? t('admin.shipping.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={list.reload}>
              {t('admin.shipping.retry')}
            </Button>
          }
        />
      ) : (
        <div className="flex w-full flex-col gap-[var(--admin-content-gap)]">
          <ShippingMethodPanel />

          {list.error && list.allCarriers.length > 0 ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {list.error}
            </p>
          ) : null}

          <CourierCompaniesTable
            carriers={list.carriers}
            loading={list.loading}
            keyword={list.keyword}
            typeFilter={list.typeFilter}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              list.hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={list.clearFilters}
                >
                  {t('admin.shipping.clearFilters')}
                </Button>
              ) : undefined
            }
            deletingId={deleting ? deleteTarget?.id ?? null : null}
            filtersDisabled={list.loading && list.allCarriers.length === 0}
            onKeywordChange={list.setKeyword}
            onTypeFilterChange={list.setTypeFilter}
            onAdd={openCreate}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />

          <ZoneManager />
        </div>
      )}

      <CarrierDrawer
        open={drawerOpen}
        mode={drawerMode}
        carrier={editingCarrier}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        title={t('admin.shipping.carriers.deleteTitle')}
        description={
          deleteTarget
            ? t('admin.shipping.carriers.deleteDescription', {
                name: deleteTarget.name,
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
              {t('admin.shipping.carriers.cancel')}
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
              {t('admin.shipping.carriers.confirmDelete')}
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
            {t('admin.shipping.carriers.deleteWarning')}
          </p>
        )}
      </Dialog>
    </>
  )
}
