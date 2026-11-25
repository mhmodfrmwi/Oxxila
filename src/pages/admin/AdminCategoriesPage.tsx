// src/pages/admin/AdminCategoriesPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminCan } from '../../components/admin/AdminCan'
import { CategoriesCatalogToolbar } from '../../components/admin/categories/CategoriesCatalogToolbar'
import { CategoriesTreeTable } from '../../components/admin/categories/CategoriesTreeTable'
import { CategoryDrawer } from '../../components/admin/categories/CategoryDrawer'
import { DeleteCategoryDialog } from '../../components/admin/categories/DeleteCategoryDialog'
import { DeleteSubcategoryDialog } from '../../components/admin/subcategories/DeleteSubcategoryDialog'
import { SubcategoryDrawer } from '../../components/admin/subcategories/SubcategoryDrawer'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminCategoryTree } from '../../hooks/useAdminCategoryTree'
import type { CategoryDrawerMode } from '../../hooks/useCategoryDrawer'
import type { SubcategoryDrawerMode } from '../../hooks/useSubcategoryDrawer'
import { cn } from '../../lib/cn'
import type {
  AdminCategoryRow,
  AdminCategoryTreeRow,
  AdminCategoryTreeSubcategory,
} from '../../types/adminCategories'
import type { AdminSubcategoryRow } from '../../types/adminSubcategories'

function treeRowToCategoryRow(row: AdminCategoryTreeRow): AdminCategoryRow {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    slug: row.slug,
    image: row.image,
    isActive: row.isActive,
    subcategoryCount: row.subcategories.length,
  }
}

function treeSubcategoryToRow(
  category: AdminCategoryTreeRow,
  subcategory: AdminCategoryTreeSubcategory,
): AdminSubcategoryRow {
  return {
    id: subcategory.id,
    name: subcategory.name,
    nameEn: subcategory.nameEn,
    nameAr: subcategory.nameAr,
    slug: subcategory.slug,
    image: null,
    isActive: subcategory.isActive,
    categoryId: category.id,
    categoryName: category.name,
  }
}

function createSubcategoryStub(category: AdminCategoryTreeRow): AdminSubcategoryRow {
  return {
    id: '',
    name: '',
    nameEn: '',
    nameAr: '',
    slug: '',
    image: null,
    isActive: true,
    categoryId: category.id,
    categoryName: category.name,
  }
}

/**
 * Categories Manager — tree view with nested subcategories, create/edit drawers, visibility toggles, delete.
 */
export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const tree = useAdminCategoryTree()
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
  const [categoryDrawerMode, setCategoryDrawerMode] =
    useState<CategoryDrawerMode>('create')
  const [editCategory, setEditCategory] = useState<AdminCategoryRow | null>(
    null,
  )
  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<AdminCategoryRow | null>(null)
  const [subcategoryDrawerOpen, setSubcategoryDrawerOpen] = useState(false)
  const [subcategoryDrawerMode, setSubcategoryDrawerMode] =
    useState<SubcategoryDrawerMode>('create')
  const [editSubcategory, setEditSubcategory] =
    useState<AdminSubcategoryRow | null>(null)
  const [deleteSubcategoryTarget, setDeleteSubcategoryTarget] =
    useState<AdminSubcategoryRow | null>(null)

  const openCreateCategory = useCallback(() => {
    setCategoryDrawerMode('create')
    setEditCategory(null)
    setCategoryDrawerOpen(true)
  }, [])

  const openEditCategory = useCallback((category: AdminCategoryTreeRow) => {
    setCategoryDrawerMode('edit')
    setEditCategory(treeRowToCategoryRow(category))
    setCategoryDrawerOpen(true)
  }, [])

  const closeCategoryDrawer = useCallback(() => {
    setCategoryDrawerOpen(false)
    setEditCategory(null)
  }, [])

  const openCreateSubcategory = useCallback((category: AdminCategoryTreeRow) => {
    setSubcategoryDrawerMode('create')
    setEditSubcategory(createSubcategoryStub(category))
    setSubcategoryDrawerOpen(true)
  }, [])

  const openEditSubcategory = useCallback(
    (
      category: AdminCategoryTreeRow,
      subcategory: AdminCategoryTreeSubcategory,
    ) => {
      setSubcategoryDrawerMode('edit')
      setEditSubcategory(treeSubcategoryToRow(category, subcategory))
      setSubcategoryDrawerOpen(true)
    },
    [],
  )

  const closeSubcategoryDrawer = useCallback(() => {
    setSubcategoryDrawerOpen(false)
    setEditSubcategory(null)
  }, [])

  const handleCategorySaved = useCallback(
    (category: AdminCategoryRow) => {
      tree.upsertCategory(category)
      tree.reload()
    },
    [tree],
  )

  const handleSubcategorySaved = useCallback(() => {
    tree.reload()
  }, [tree])

  const handleDeleteSubcategory = useCallback(
    async (subcategoryId: string) => {
      if (!deleteSubcategoryTarget?.categoryId) return
      await tree.deleteSubcategory(
        deleteSubcategoryTarget.categoryId,
        subcategoryId,
      )
    },
    [deleteSubcategoryTarget?.categoryId, tree],
  )

  const failed =
    Boolean(tree.error) && !tree.loading && tree.categories.length === 0
  const staleError = Boolean(tree.error) && tree.categories.length > 0

  const emptyTitle = tree.hasActiveFilters
    ? t('admin.categories.emptyFilteredTitle')
    : t('admin.categories.emptyTitle')
  const emptyDescription = tree.hasActiveFilters
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
              keyword={tree.filters.keyword}
              onKeywordChange={tree.setKeyword}
              disabled={tree.loading && tree.categories.length === 0}
            />
            <AdminCan tab="categories" action="create">
              <button
                type="button"
                onClick={openCreateCategory}
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
            </AdminCan>
          </div>
        }
      />

      {failed ? (
        <EmptyState
          title={t('admin.categories.loadErrorTitle')}
          description={
            tree.error ?? t('admin.categories.loadErrorDescription')
          }
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void tree.reload()}
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
              {tree.error}
            </p>
          ) : null}

          <CategoriesTreeTable
            categories={tree.categories}
            loading={tree.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              tree.hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={tree.clearFilters}
                >
                  {t('admin.categories.clearFilters')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCreateCategory}
                >
                  {t('admin.categories.addCategory')}
                </Button>
              )
            }
            totalCount={tree.totalCount}
            togglingCategoryId={tree.togglingCategoryId}
            deletingCategoryId={tree.deletingCategoryId}
            togglingSubcategoryId={tree.togglingSubcategoryId}
            deletingSubcategoryId={tree.deletingSubcategoryId}
            onEditCategory={openEditCategory}
            onDeleteCategory={(category) =>
              setDeleteCategoryTarget(treeRowToCategoryRow(category))
            }
            onToggleCategoryActive={(id) => void tree.toggleCategoryActive(id)}
            onAddSubcategory={openCreateSubcategory}
            onEditSubcategory={openEditSubcategory}
            onDeleteSubcategory={(category, subcategory) =>
              setDeleteSubcategoryTarget(
                treeSubcategoryToRow(category, subcategory),
              )
            }
            onToggleSubcategoryActive={(categoryId, subcategoryId) =>
              void tree.toggleSubcategoryActive(categoryId, subcategoryId)
            }
          />
        </>
      )}

      <CategoryDrawer
        open={categoryDrawerOpen}
        mode={categoryDrawerMode}
        category={editCategory}
        onClose={closeCategoryDrawer}
        onSaved={handleCategorySaved}
      />

      <SubcategoryDrawer
        open={subcategoryDrawerOpen}
        mode={subcategoryDrawerMode}
        subcategory={editSubcategory}
        onClose={closeSubcategoryDrawer}
        onSaved={handleSubcategorySaved}
      />

      <DeleteCategoryDialog
        open={Boolean(deleteCategoryTarget)}
        category={deleteCategoryTarget}
        submitting={
          deleteCategoryTarget != null &&
          tree.deletingCategoryId === deleteCategoryTarget.id
        }
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={tree.deleteCategory}
      />

      <DeleteSubcategoryDialog
        open={Boolean(deleteSubcategoryTarget)}
        subcategory={deleteSubcategoryTarget}
        submitting={
          deleteSubcategoryTarget != null &&
          tree.deletingSubcategoryId === deleteSubcategoryTarget.id
        }
        onClose={() => setDeleteSubcategoryTarget(null)}
        onConfirm={handleDeleteSubcategory}
      />
    </>
  )
}
