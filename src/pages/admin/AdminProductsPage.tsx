// src/pages/admin/AdminProductsPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { FormulaSpecsDrawer } from '../../components/admin/products/FormulaSpecsDrawer'
import { ProductsCatalogTable } from '../../components/admin/products/ProductsCatalogTable'
import { ProductsCatalogToolbar } from '../../components/admin/products/ProductsCatalogToolbar'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { useAdminProducts } from '../../hooks/useAdminProducts'
import type { FormulaSpecsMode } from '../../hooks/useFormulaSpecsDrawer'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../../components/ui/interactionStyles'

/**
 * Products Catalog + Formula Specs drawer (Phase 2A/2B).
 */
export function AdminProductsPage() {
  const { t } = useTranslation()
  const catalog = useAdminProducts()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<FormulaSpecsMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!filtersOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (drawerOpen) return
      setFiltersOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [filtersOpen, drawerOpen])

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditingId(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((productId: string) => {
    setDrawerMode('edit')
    setEditingId(productId)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditingId(null)
  }, [])

  const handleSaved = useCallback(() => {
    closeDrawer()
    catalog.reload()
  }, [catalog, closeDrawer])

  const handleArchived = useCallback(() => {
    closeDrawer()
    catalog.reload()
  }, [catalog, closeDrawer])

  const handleDeleted = useCallback(() => {
    closeDrawer()
    catalog.reload()
  }, [catalog, closeDrawer])

  const failed = Boolean(catalog.error) && !catalog.loading && catalog.products.length === 0
  const staleError = Boolean(catalog.error) && catalog.products.length > 0
  const currentPage = catalog.pagination?.currentPage ?? catalog.filters.page
  const totalPages = Math.max(catalog.pagination?.numberOfPages ?? 1, 1)
  const totalCount = catalog.pagination?.totalDocuments ?? catalog.products.length
  const showingCount = catalog.products.length

  const emptyTitle = catalog.hasActiveFilters
    ? t('admin.products.emptyFilteredTitle')
    : t('admin.products.emptyTitle')
  const emptyDescription = catalog.hasActiveFilters
    ? t('admin.products.emptyFilteredDescription')
    : t('admin.products.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.products.title')}
        subtitle={t('admin.products.subtitle')}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-8 py-3.5',
              'bg-gradient-to-r from-accent to-[#7c69ff]',
              'text-sm font-bold text-white',
              'shadow-[0_8px_12.5px_rgb(163_148_255_/_0.3)]',
              'transition-opacity hover:opacity-95',
              focusRingClasses,
            )}
            aria-label={t('admin.products.addFormula')}
          >
            <Plus size={13} aria-hidden />
            {t('admin.products.addFormula')}
          </button>
        }
      />

      {failed ? (
        <EmptyState
          title={t('admin.products.loadErrorTitle')}
          description={catalog.error ?? t('admin.products.loadErrorDescription')}
          action={
            <Button type="button" variant="outline" onClick={() => catalog.reload()}>
              {t('admin.products.retry')}
            </Button>
          }
        />
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-8">
          {staleError ? (
            <div
              role="alert"
              className="admin-glass flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-support-error">
                {catalog.error ?? t('admin.products.loadErrorDescription')}
              </p>
              <Button type="button" variant="outline" onClick={() => catalog.reload()}>
                {t('admin.products.retry')}
              </Button>
            </div>
          ) : null}

          <ProductsCatalogToolbar
            keyword={catalog.filters.keyword}
            onKeywordChange={catalog.setKeyword}
            category={catalog.filters.category}
            onCategoryChange={catalog.setCategory}
            categories={catalog.categories}
            categoriesLoading={catalog.categoriesLoading}
            filtersOpen={filtersOpen}
            onFiltersOpenChange={setFiltersOpen}
          />

          <ProductsCatalogTable
            products={catalog.products}
            loading={catalog.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              catalog.hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={catalog.clearFilters}>
                  {t('admin.products.clearFilters')}
                </Button>
              ) : undefined
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={catalog.setPage}
            onEditProduct={openEdit}
            togglingBestSellerId={catalog.togglingBestSellerId}
            onToggleBestSeller={(productId) => void catalog.toggleBestSeller(productId)}
          />
        </div>
      )}

      <FormulaSpecsDrawer
        open={drawerOpen}
        mode={drawerMode}
        productId={editingId}
        categories={catalog.categories}
        onClose={closeDrawer}
        onSaved={handleSaved}
        onArchived={handleArchived}
        onDeleted={handleDeleted}
      />
    </>
  )
}
