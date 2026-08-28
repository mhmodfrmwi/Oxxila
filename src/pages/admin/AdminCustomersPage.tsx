// src/pages/admin/AdminCustomersPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChangeCustomerPasswordDialog } from '../../components/admin/customers/ChangeCustomerPasswordDialog'
import { CustomerDetailsDrawer } from '../../components/admin/customers/CustomerDetailsDrawer'
import { CustomerDrawer } from '../../components/admin/customers/CustomerDrawer'
import { CustomersCatalogTable } from '../../components/admin/customers/CustomersCatalogTable'
import { CustomersListToolbar } from '../../components/admin/customers/CustomersListToolbar'
import { CustomersSegmentTabs } from '../../components/admin/customers/CustomersSegmentTabs'
import { CustomersStatsRow } from '../../components/admin/customers/CustomersStatsRow'
import { DeleteCustomerDialog } from '../../components/admin/customers/DeleteCustomerDialog'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminCustomerStats } from '../../hooks/useAdminCustomerStats'
import { useAdminCustomers } from '../../hooks/useAdminCustomers'
import { useAdminUrlOpen } from '../../hooks/useAdminUrlOpen'
import type { CustomerDrawerMode } from '../../hooks/useCustomerDrawer'
import { cn } from '../../lib/cn'
import type { AdminCustomerRow } from '../../types/adminCustomers'

/**
 * Customer Intelligence — list, create/edit, activate/deactivate, delete, password.
 */
export function AdminCustomersPage() {
  const { t } = useTranslation()
  const list = useAdminCustomers()
  const stats = useAdminCustomerStats()
  const [drawerCustomerId, setDrawerCustomerId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<CustomerDrawerMode>('create')
  const [editCustomer, setEditCustomer] = useState<AdminCustomerRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCustomerRow | null>(null)
  const [passwordTarget, setPasswordTarget] =
    useState<AdminCustomerRow | null>(null)

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditCustomer(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((customer: AdminCustomerRow) => {
    setFormMode('edit')
    setEditCustomer(customer)
    setFormOpen(true)
  }, [])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditCustomer(null)
  }, [])

  const openDrawer = useCallback((customerId: string) => {
    setDrawerCustomerId(customerId)
  }, [])

  useAdminUrlOpen(openDrawer)

  const closeDrawer = useCallback(() => {
    setDrawerCustomerId(null)
  }, [])

  const handleSaved = useCallback(
    (customer: AdminCustomerRow) => {
      list.upsertCustomer(customer)
      list.reload()
      stats.reload()
    },
    [list, stats],
  )

  const handleDeleted = useCallback(
    async (customerId: string) => {
      await list.deleteCustomer(customerId)
      if (drawerCustomerId === customerId) {
        setDrawerCustomerId(null)
      }
      stats.reload()
    },
    [drawerCustomerId, list, stats],
  )

  const failed =
    Boolean(list.error) && !list.loading && list.customers.length === 0
  const staleError = Boolean(list.error) && list.customers.length > 0
  const currentPage = list.pagination?.currentPage ?? list.filters.page
  const totalPages = Math.max(list.pagination?.numberOfPages ?? 1, 1)
  const totalCount = list.pagination?.totalDocuments ?? list.customers.length
  const showingCount = list.customers.length

  const emptyTitle = list.hasActiveFilters
    ? t('admin.customers.emptyFilteredTitle')
    : t('admin.customers.emptyTitle')
  const emptyDescription = list.hasActiveFilters
    ? t('admin.customers.emptyFilteredDescription')
    : t('admin.customers.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.customers.title')}
        subtitle={t('admin.customers.subtitle')}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CustomersListToolbar
              keyword={list.filters.keyword}
              onKeywordChange={list.setKeyword}
              disabled={list.loading && list.customers.length === 0}
            />
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5',
                'bg-gradient-to-r from-accent to-[#7c69ff]',
                'text-sm font-bold text-white',
                'shadow-[0_8px_12.5px_rgb(163_148_255_/_0.3)]',
                'transition-opacity hover:opacity-95',
                focusRingClasses,
              )}
              aria-label={t('admin.customers.addCustomer')}
            >
              <Plus size={13} aria-hidden />
              {t('admin.customers.addCustomer')}
            </button>
          </div>
        }
      />

      <CustomersStatsRow
        stats={stats.stats}
        loading={stats.loading && !stats.stats}
      />

      <CustomersSegmentTabs
        active={list.filters.segmentTab}
        activeCount={totalCount}
        onChange={list.setSegmentTab}
        disabled={list.loading && list.customers.length === 0}
      />

      {failed ? (
        <EmptyState
          title={t('admin.customers.loadErrorTitle')}
          description={list.error ?? t('admin.customers.loadErrorDescription')}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                list.reload()
                stats.reload()
              }}
            >
              {t('admin.customers.retry')}
            </Button>
          }
        />
      ) : (
        <>
          {staleError ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {list.error}
            </p>
          ) : null}

          <CustomersCatalogTable
            customers={list.customers}
            loading={list.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              list.hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={list.clearFilters}>
                  {t('admin.customers.clearFilters')}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={openCreate}>
                  {t('admin.customers.addCustomer')}
                </Button>
              )
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={list.setPage}
            togglingCustomerId={list.togglingCustomerId}
            deletingCustomerId={list.deletingCustomerId}
            onOpenCustomer={openDrawer}
            onEditCustomer={openEdit}
            onDeleteCustomer={setDeleteTarget}
            onChangePassword={setPasswordTarget}
            onToggleActive={(id, active) =>
              void list.setCustomerActive(id, active)
            }
          />
        </>
      )}

      <CustomerDetailsDrawer
        open={Boolean(drawerCustomerId)}
        customerId={drawerCustomerId}
        togglingCustomerId={list.togglingCustomerId}
        onClose={closeDrawer}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onChangePassword={setPasswordTarget}
        onToggleActive={(id, active, seed) =>
          list.setCustomerActive(id, active, seed)
        }
      />

      <CustomerDrawer
        open={formOpen}
        mode={formMode}
        customer={editCustomer}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <DeleteCustomerDialog
        open={Boolean(deleteTarget)}
        customer={deleteTarget}
        submitting={
          deleteTarget != null && list.deletingCustomerId === deleteTarget.id
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleted}
      />

      <ChangeCustomerPasswordDialog
        open={Boolean(passwordTarget)}
        customer={passwordTarget}
        onClose={() => setPasswordTarget(null)}
      />
    </>
  )
}
