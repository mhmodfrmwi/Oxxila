// src/pages/admin/AdminSubcategoriesPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeleteSubcategoryDialog } from '../../components/admin/subcategories/DeleteSubcategoryDialog'
import { SubcategoriesCatalogTable } from '../../components/admin/subcategories/SubcategoriesCatalogTable'
import { SubcategoriesCatalogToolbar } from '../../components/admin/subcategories/SubcategoriesCatalogToolbar'
import { SubcategoryDrawer } from '../../components/admin/subcategories/SubcategoryDrawer'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminSubcategories } from '../../hooks/useAdminSubcategories'
import type { SubcategoryDrawerMode } from '../../hooks/useSubcategoryDrawer'
import { cn } from '../../lib/cn'
import type { AdminSubcategoryRow } from '../../types/adminSubcategories'

/**
 * Subcategories Manager — list, create/edit drawer, activate toggle, delete.
 * Mirrors Categories / Brands Manager architecture.
 */
export function AdminSubcategoriesPage() {
  const { t } = useTranslation()
  const catalog = useAdminSubcategories()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<SubcategoryDrawerMode>('create')
  const [editSubcategory, setEditSubcategory] =
    useState<AdminSubcategoryRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminSubcategoryRow | null>(
    null,
  )

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditSubcategory(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((subcategory: AdminSubcategoryRow) => {
    setDrawerMode('edit')
    setEditSubcategory(subcategory)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditSubcategory(null)
  }, [])

  const handleSaved = useCallback(
    (subcategory: AdminSubcategoryRow) => {
      catalog.upsertSubcategory(subcategory)
      catalog.reload()
    },
    [catalog],
  )

  const failed =
    Boolean(catalog.error) &&
    !catalog.loading &&
    catalog.subcategories.length === 0 &&
    catalog.allCount === 0
  const staleError = Boolean(catalog.error) && catalog.allCount > 0
  const currentPage = catalog.pagination.currentPage
  const totalPages = Math.max(catalog.pagination.numberOfPages, 1)
  const totalCount = catalog.pagination.totalDocuments
  const showingCount = catalog.subcategories.length

  const emptyTitle = catalog.hasActiveFilters
    ? t('admin.subcategories.emptyFilteredTitle')
    : t('admin.subcategories.emptyTitle')
  const emptyDescription = catalog.hasActiveFilters
    ? t('admin.subcategories.emptyFilteredDescription')
    : t('admin.subcategories.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.subcategories.title')}
        subtitle={t('admin.subcategories.subtitle')}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <SubcategoriesCatalogToolbar
              keyword={catalog.filters.keyword}
              onKeywordChange={catalog.setKeyword}
              category={catalog.filters.category}
              onCategoryChange={catalog.setCategoryFilter}
              categories={catalog.categories}
              categoriesLoading={catalog.categoriesLoading}
              disabled={catalog.loading && catalog.allCount === 0}
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
              aria-label={t('admin.subcategories.addSubcategory')}
            >
              <Plus size={13} aria-hidden />
              {t('admin.subcategories.addSubcategory')}
            </button>
          </div>
        }
      />

      {failed ? (
        <EmptyState
          title={t('admin.subcategories.loadErrorTitle')}
          description={
            catalog.error ?? t('admin.subcategories.loadErrorDescription')
          }
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void catalog.reload()}
            >
              {t('admin.subcategories.retry')}
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

          <SubcategoriesCatalogTable
            subcategories={catalog.subcategories}
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
                  {t('admin.subcategories.clearFilters')}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={openCreate}>
                  {t('admin.subcategories.addSubcategory')}
                </Button>
              )
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={catalog.setPage}
            togglingSubcategoryId={catalog.togglingSubcategoryId}
            deletingSubcategoryId={catalog.deletingSubcategoryId}
            onEditSubcategory={openEdit}
            onDeleteSubcategory={setDeleteTarget}
            onToggleActive={(id) => void catalog.toggleActive(id)}
          />
        </>
      )}

      <SubcategoryDrawer
        open={drawerOpen}
        mode={drawerMode}
        subcategory={editSubcategory}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <DeleteSubcategoryDialog
        open={Boolean(deleteTarget)}
        subcategory={deleteTarget}
        submitting={
          deleteTarget != null &&
          catalog.deletingSubcategoryId === deleteTarget.id
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={catalog.deleteSubcategory}
      />
    </>
  )
}
