// src/pages/admin/AdminCategoriesPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CategoriesCatalogTable } from '../../components/admin/categories/CategoriesCatalogTable'
import { CategoriesCatalogToolbar } from '../../components/admin/categories/CategoriesCatalogToolbar'
import { CategoryDrawer } from '../../components/admin/categories/CategoryDrawer'
import { DeleteCategoryDialog } from '../../components/admin/categories/DeleteCategoryDialog'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminCategories } from '../../hooks/useAdminCategories'
import type { CategoryDrawerMode } from '../../hooks/useCategoryDrawer'
import { cn } from '../../lib/cn'
import type { AdminCategoryRow } from '../../types/adminCategories'

/**
 * Categories Manager — list, create/edit drawer, activate toggle, delete.
 */
export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const catalog = useAdminCategories()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<CategoryDrawerMode>('create')
  const [editCategory, setEditCategory] = useState<AdminCategoryRow | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryRow | null>(
    null,
  )

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditCategory(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((category: AdminCategoryRow) => {
    setDrawerMode('edit')
    setEditCategory(category)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditCategory(null)
  }, [])

  const handleSaved = useCallback(
    (category: AdminCategoryRow) => {
      catalog.upsertCategory(category)
      catalog.reload()
    },
    [catalog],
  )

  const failed =
    Boolean(catalog.error) &&
    !catalog.loading &&
    catalog.categories.length === 0
  const staleError = Boolean(catalog.error) && catalog.categories.length > 0
  const currentPage = catalog.pagination?.currentPage ?? catalog.filters.page
  const totalPages = Math.max(catalog.pagination?.numberOfPages ?? 1, 1)
  const totalCount =
    catalog.pagination?.totalDocuments ?? catalog.categories.length
  const showingCount = catalog.categories.length

  const emptyTitle = catalog.hasActiveFilters
    ? t('admin.categories.emptyFilteredTitle')
    : t('admin.categories.emptyTitle')
  const emptyDescription = catalog.hasActiveFilters
    ? t('admin.categories.emptyFilteredDescription')
    : t('admin.categories.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.categories.title')}
        subtitle={t('admin.categories.subtitle')}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CategoriesCatalogToolbar
              keyword={catalog.filters.keyword}
              onKeywordChange={catalog.setKeyword}
              disabled={catalog.loading && catalog.categories.length === 0}
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
              aria-label={t('admin.categories.addCategory')}
            >
              <Plus size={13} aria-hidden />
              {t('admin.categories.addCategory')}
            </button>
          </div>
        }
      />

      {failed ? (
        <EmptyState
          title={t('admin.categories.loadErrorTitle')}
          description={
            catalog.error ?? t('admin.categories.loadErrorDescription')
          }
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void catalog.reload()}
            >
              {t('admin.categories.retry')}
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

          <CategoriesCatalogTable
            categories={catalog.categories}
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
                  {t('admin.categories.clearFilters')}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={openCreate}>
                  {t('admin.categories.addCategory')}
                </Button>
              )
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={catalog.setPage}
            togglingCategoryId={catalog.togglingCategoryId}
            deletingCategoryId={catalog.deletingCategoryId}
            onEditCategory={openEdit}
            onDeleteCategory={setDeleteTarget}
            onToggleActive={(id) => void catalog.toggleActive(id)}
          />
        </>
      )}

      <CategoryDrawer
        open={drawerOpen}
        mode={drawerMode}
        category={editCategory}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <DeleteCategoryDialog
        open={Boolean(deleteTarget)}
        category={deleteTarget}
        submitting={
          deleteTarget != null &&
          catalog.deletingCategoryId === deleteTarget.id
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={catalog.deleteCategory}
      />
    </>
  )
}
