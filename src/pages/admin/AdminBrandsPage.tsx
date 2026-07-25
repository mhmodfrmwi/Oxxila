// src/pages/admin/AdminBrandsPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrandDrawer } from '../../components/admin/brands/BrandDrawer'
import { BrandsCatalogTable } from '../../components/admin/brands/BrandsCatalogTable'
import { BrandsCatalogToolbar } from '../../components/admin/brands/BrandsCatalogToolbar'
import { DeleteBrandDialog } from '../../components/admin/brands/DeleteBrandDialog'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminBrands } from '../../hooks/useAdminBrands'
import type { BrandDrawerMode } from '../../hooks/useBrandDrawer'
import { cn } from '../../lib/cn'
import type { AdminBrandRow } from '../../types/adminBrands'

/**
 * Brands Manager — list, create/edit drawer, activate toggle, delete.
 * Mirrors Categories Manager architecture.
 */
export function AdminBrandsPage() {
  const { t } = useTranslation()
  const catalog = useAdminBrands()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<BrandDrawerMode>('create')
  const [editBrand, setEditBrand] = useState<AdminBrandRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminBrandRow | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditBrand(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((brand: AdminBrandRow) => {
    setDrawerMode('edit')
    setEditBrand(brand)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditBrand(null)
  }, [])

  const handleSaved = useCallback(
    (brand: AdminBrandRow) => {
      catalog.upsertBrand(brand)
      catalog.reload()
    },
    [catalog],
  )

  const failed =
    Boolean(catalog.error) && !catalog.loading && catalog.brands.length === 0
  const staleError = Boolean(catalog.error) && catalog.brands.length > 0
  const currentPage = catalog.pagination?.currentPage ?? catalog.filters.page
  const totalPages = Math.max(catalog.pagination?.numberOfPages ?? 1, 1)
  const totalCount =
    catalog.pagination?.totalDocuments ?? catalog.brands.length
  const showingCount = catalog.brands.length

  const emptyTitle = catalog.hasActiveFilters
    ? t('admin.brands.emptyFilteredTitle')
    : t('admin.brands.emptyTitle')
  const emptyDescription = catalog.hasActiveFilters
    ? t('admin.brands.emptyFilteredDescription')
    : t('admin.brands.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.brands.title')}
        subtitle={t('admin.brands.subtitle')}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <BrandsCatalogToolbar
              keyword={catalog.filters.keyword}
              onKeywordChange={catalog.setKeyword}
              disabled={catalog.loading && catalog.brands.length === 0}
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
              aria-label={t('admin.brands.addBrand')}
            >
              <Plus size={13} aria-hidden />
              {t('admin.brands.addBrand')}
            </button>
          </div>
        }
      />

      {failed ? (
        <EmptyState
          title={t('admin.brands.loadErrorTitle')}
          description={catalog.error ?? t('admin.brands.loadErrorDescription')}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void catalog.reload()}
            >
              {t('admin.brands.retry')}
            </Button>
          }
        />
      ) : (
        <>
          {staleError ? (
            <p
              className="mb-3 rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {catalog.error}
            </p>
          ) : null}

          <BrandsCatalogTable
            brands={catalog.brands}
            loading={catalog.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              catalog.hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={catalog.clearFilters}
                >
                  {t('admin.brands.clearFilters')}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={openCreate}>
                  {t('admin.brands.addBrand')}
                </Button>
              )
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={catalog.setPage}
            togglingBrandId={catalog.togglingBrandId}
            deletingBrandId={catalog.deletingBrandId}
            onEditBrand={openEdit}
            onDeleteBrand={setDeleteTarget}
            onToggleActive={(id) => void catalog.toggleActive(id)}
          />
        </>
      )}

      <BrandDrawer
        open={drawerOpen}
        mode={drawerMode}
        brand={editBrand}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <DeleteBrandDialog
        open={Boolean(deleteTarget)}
        brand={deleteTarget}
        submitting={
          deleteTarget != null && catalog.deletingBrandId === deleteTarget.id
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={catalog.deleteBrand}
      />
    </>
  )
}
