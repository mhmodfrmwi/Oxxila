// src/pages/admin/AdminFaqsPage.tsx
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeleteFaqDialog } from '../../components/admin/faqs/DeleteFaqDialog'
import { FaqDrawer } from '../../components/admin/faqs/FaqDrawer'
import { FaqsCatalogTable } from '../../components/admin/faqs/FaqsCatalogTable'
import { FaqsCatalogToolbar } from '../../components/admin/faqs/FaqsCatalogToolbar'
import { AdminPageHeader } from '../../components/admin/layout/AdminPageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { focusRingClasses } from '../../components/ui/interactionStyles'
import { useAdminFaqs } from '../../hooks/useAdminFaqs'
import type { FaqDrawerMode } from '../../hooks/useFaqDrawer'
import { cn } from '../../lib/cn'
import type { AdminFaqRow } from '../../types/adminFaqs'

/**
 * FAQs Manager — product-scoped list, create/edit drawer, activate toggle, delete.
 * Mirrors Categories / Brands / Subcategories architecture.
 */
export function AdminFaqsPage() {
  const { t } = useTranslation()
  const catalog = useAdminFaqs()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<FaqDrawerMode>('create')
  const [editFaq, setEditFaq] = useState<AdminFaqRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminFaqRow | null>(null)

  const openCreate = useCallback(() => {
    setDrawerMode('create')
    setEditFaq(null)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((faq: AdminFaqRow) => {
    setDrawerMode('edit')
    setEditFaq(faq)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditFaq(null)
  }, [])

  const handleSaved = useCallback(
    (faq: AdminFaqRow) => {
      if (
        catalog.filters.product &&
        faq.productId === catalog.filters.product
      ) {
        catalog.upsertFaq(faq)
      }
      catalog.reload()
    },
    [catalog],
  )

  const failed =
    Boolean(catalog.error) &&
    !catalog.loading &&
    !catalog.needsProduct &&
    catalog.allCount === 0
  const staleError = Boolean(catalog.error) && catalog.allCount > 0
  const currentPage = catalog.pagination.currentPage
  const totalPages = Math.max(catalog.pagination.numberOfPages, 1)
  const totalCount = catalog.pagination.totalDocuments
  const showingCount = catalog.faqs.length

  const emptyTitle = catalog.needsProduct
    ? t('admin.faqs.selectProductTitle')
    : catalog.filters.keyword
      ? t('admin.faqs.emptyFilteredTitle')
      : t('admin.faqs.emptyTitle')
  const emptyDescription = catalog.needsProduct
    ? t('admin.faqs.selectProductDescription')
    : catalog.filters.keyword
      ? t('admin.faqs.emptyFilteredDescription')
      : t('admin.faqs.emptyDescription')

  return (
    <>
      <AdminPageHeader
        title={t('admin.faqs.title')}
        subtitle={t('admin.faqs.subtitle')}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FaqsCatalogToolbar
              keyword={catalog.filters.keyword}
              onKeywordChange={catalog.setKeyword}
              product={catalog.filters.product}
              onProductChange={catalog.setProductFilter}
              products={catalog.products}
              productsLoading={catalog.productsLoading}
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
              aria-label={t('admin.faqs.addFaq')}
            >
              <Plus size={13} aria-hidden />
              {t('admin.faqs.addFaq')}
            </button>
          </div>
        }
      />

      {failed ? (
        <EmptyState
          title={t('admin.faqs.loadErrorTitle')}
          description={catalog.error ?? t('admin.faqs.loadErrorDescription')}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void catalog.reload()}
            >
              {t('admin.faqs.retry')}
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

          <FaqsCatalogTable
            faqs={catalog.faqs}
            loading={catalog.loading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={
              catalog.needsProduct ? null : catalog.filters.keyword ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => catalog.setKeyword('')}
                >
                  {t('admin.faqs.clearFilters')}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={openCreate}>
                  {t('admin.faqs.addFaq')}
                </Button>
              )
            }
            showingCount={showingCount}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={catalog.setPage}
            togglingFaqId={catalog.togglingFaqId}
            deletingFaqId={catalog.deletingFaqId}
            onEditFaq={openEdit}
            onDeleteFaq={setDeleteTarget}
            onToggleActive={(id) => void catalog.toggleActive(id)}
          />
        </>
      )}

      <FaqDrawer
        open={drawerOpen}
        mode={drawerMode}
        faq={editFaq}
        defaultProductId={catalog.filters.product}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <DeleteFaqDialog
        open={Boolean(deleteTarget)}
        faq={deleteTarget}
        submitting={
          deleteTarget != null && catalog.deletingFaqId === deleteTarget.id
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={catalog.deleteFaq}
      />
    </>
  )
}
