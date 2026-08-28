// src/components/admin/products/FormulaSpecsDrawer.tsx
import {
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubCategories } from '../../../hooks/useSubCategories'
import {
  useFormulaSpecsDrawer,
  type FormulaSpecsMode,
} from '../../../hooks/useFormulaSpecsDrawer'
import { useFormulaSpecsFaqs } from '../../../hooks/useFormulaSpecsFaqs'
import type { ApiCategory, ApiProduct } from '../../../types/catalog'
import {
  ADMIN_PRODUCT_CONCERNS,
  ADMIN_PRODUCT_IMAGES_MAX,
} from '../../../utils/adminProductValidation'
import { cn } from '../../../lib/cn'
import { useToast } from '../../../context/ToastContext'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'
import { Drawer } from '../ui/Drawer'
import { Select } from '../ui/Select'
import { Skeleton } from '../ui/Skeleton'
import { FormulaSpecsFaqPanel } from './FormulaSpecsFaqPanel'

type FormulaSpecsTab = 'details' | 'faq'

interface FormulaSpecsDrawerProps {
  open: boolean
  mode: FormulaSpecsMode
  productId: string | null
  categories: readonly ApiCategory[]
  onClose: () => void
  onSaved: (product: ApiProduct) => void
  onArchived: (productId: string) => void
  onRestored: (productId: string) => void
  onDeleted: (productId: string) => void
}

function LocalImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(file)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [file])
  if (!url) return <div className="size-full rounded-xl bg-white/5" />
  return <img src={url} alt="" className="size-full rounded-xl object-cover" />
}

const fieldClass = cn(
  'w-full rounded-xl border border-border-subtle bg-input px-4 py-3 text-sm text-primary-text',
  'placeholder:text-placeholder-text',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

export function FormulaSpecsDrawer({
  open,
  mode,
  productId,
  categories,
  onClose,
  onSaved,
  onArchived,
  onRestored,
  onDeleted,
}: FormulaSpecsDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const tabsId = useId()
  const [discardOpen, setDiscardOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FormulaSpecsTab>('details')

  const drawer = useFormulaSpecsDrawer({
    open,
    mode,
    productId,
    onSaved: (product) => {
      toast.success(
        mode === 'create'
          ? t('admin.products.formula.createSuccess')
          : t('admin.products.formula.updateSuccess'),
      )
      onSaved(product)
    },
    onArchived: (id) => {
      toast.success(t('admin.products.formula.archiveSuccess'))
      onArchived(id)
    },
    onRestored: (id) => {
      toast.success(t('admin.products.formula.restoreSuccess'))
      onRestored(id)
    },
    onDeleted: (id) => {
      toast.success(t('admin.products.formula.deleteSuccess'))
      onDeleted(id)
    },
  })

  const faqs = useFormulaSpecsFaqs({
    open,
    productId,
    productName: drawer.values.name || null,
  })

  useEffect(() => {
    if (!open) setActiveTab('details')
  }, [open])

  const { subcategories, loading: subLoading } = useSubCategories(
    drawer.values.category || undefined,
    open && Boolean(drawer.values.category),
  )

  useEffect(() => {
    if (!drawer.values.category) return
    const stillValid = subcategories.some((item) => item._id === drawer.values.subCategory)
    if (drawer.values.subCategory && !subLoading && subcategories.length > 0 && !stillValid) {
      drawer.setField('subCategory', '')
    }
    // Intentionally depend on category/sub list changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid reset loops from drawer identity
  }, [drawer.values.category, drawer.values.subCategory, subcategories, subLoading])

  const requestClose = useCallback(() => {
    if (
      drawer.submitting ||
      drawer.archiving ||
      drawer.restoring ||
      drawer.deleting ||
      faqs.submitting
    ) {
      return
    }
    const faqDirty = Boolean(faqs.question.trim() || faqs.answer.trim())
    if (drawer.dirty || faqDirty) {
      setDiscardOpen(true)
      return
    }
    onClose()
  }, [
    drawer.submitting,
    drawer.archiving,
    drawer.restoring,
    drawer.deleting,
    drawer.dirty,
    faqs.submitting,
    faqs.question,
    faqs.answer,
    onClose,
  ])

  const handleDrawerClose = useCallback(() => {
    if (discardOpen || archiveOpen || restoreOpen || deleteOpen) return
    requestClose()
  }, [discardOpen, archiveOpen, restoreOpen, deleteOpen, requestClose])

  const handleSave = async () => {
    const result = await drawer.save()
    if (!result.ok) {
      toast.error(t('admin.products.formula.saveFailed'), result.message)
    }
  }

  const handleArchive = async () => {
    const result = await drawer.archive()
    setArchiveOpen(false)
    if (!result.ok) {
      toast.error(t('admin.products.formula.archiveFailed'), result.message)
    }
  }

  const handleRestore = async () => {
    const result = await drawer.restore()
    setRestoreOpen(false)
    if (!result.ok) {
      toast.error(t('admin.products.formula.restoreFailed'), result.message)
    }
  }

  const handleDelete = async () => {
    const result = await drawer.deleteProduct()
    setDeleteOpen(false)
    if (!result.ok) {
      toast.error(t('admin.products.formula.deleteFailed'), result.message)
    }
  }

  const title = t('admin.products.formula.title')
  const description =
    mode === 'edit' && drawer.slug
      ? t('admin.products.formula.ref', { ref: drawer.slug })
      : mode === 'create'
        ? t('admin.products.formula.refNew')
        : t('admin.products.formula.refUnavailable')

  const busy =
    drawer.submitting ||
    drawer.archiving ||
    drawer.restoring ||
    drawer.deleting ||
    faqs.submitting
  const showDetailsFooter = activeTab === 'details' && !drawer.loadError
  const showFaqFooter = activeTab === 'faq' && !drawer.loadError && faqs.canCreate

  const footerActionClass = cn(
    'inline-flex min-h-11 items-center justify-center px-5',
    'text-xs font-bold uppercase tracking-[0.12em]',
    'rounded-full transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    focusRingClasses,
  )

  const handleFaqSubmit = async () => {
    const ok = await faqs.submit()
    if (ok) {
      toast.success(t('admin.products.formula.faq.createSuccess'))
    }
  }

  const handleFaqEditSubmit = async () => {
    const ok = await faqs.submitEdit()
    if (ok) {
      toast.success(t('admin.products.formula.faq.updateSuccess'))
    }
  }

  const faqFormId = `${formId}-faq`

  return (
    <>
      <Drawer
        open={open}
        title={title}
        description={description}
        onClose={handleDrawerClose}
        width="formula"
        footer={
          showDetailsFooter ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {mode === 'edit' ? (
                <div className="flex flex-wrap items-center gap-2">
                  {drawer.isActive ? (
                    <button
                      type="button"
                      disabled={busy || drawer.loadingProduct}
                      onClick={() => setArchiveOpen(true)}
                      className={cn(
                        footerActionClass,
                        'border border-white/15 bg-white/5 text-primary-text hover:bg-white/10',
                      )}
                    >
                      {t('admin.products.formula.archive')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || drawer.loadingProduct}
                      onClick={() => setRestoreOpen(true)}
                      className={cn(
                        footerActionClass,
                        'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/15',
                      )}
                    >
                      {t('admin.products.formula.restore')}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy || drawer.loadingProduct}
                    onClick={() => setDeleteOpen(true)}
                    className={cn(
                      footerActionClass,
                      'border border-support-error/45 bg-transparent text-support-error hover:bg-support-error/10',
                    )}
                  >
                    {t('admin.products.formula.delete')}
                  </button>
                </div>
              ) : (
                <div className="hidden sm:block" />
              )}
              <button
                type="submit"
                form={formId}
                disabled={busy || drawer.loadingProduct || Boolean(drawer.loadError)}
                className={cn(
                  footerActionClass,
                  'w-full px-8 sm:ms-auto sm:w-auto',
                  'bg-gradient-to-r from-accent to-[#7c69ff] text-white',
                  'shadow-[0_8px_20px_rgb(163_148_255_/_0.28)]',
                )}
              >
                {drawer.submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={11} className="animate-spin" aria-hidden />
                    {t('admin.products.formula.saving')}
                  </span>
                ) : (
                  t('admin.products.formula.save')
                )}
              </button>
            </div>
          ) : showFaqFooter ? (
            <button
              type="submit"
              form={faqFormId}
              disabled={faqs.submitting}
              className={cn(
                footerActionClass,
                'w-full px-8',
                'bg-gradient-to-r from-accent to-[#7c69ff] text-white',
                'shadow-[0_8px_20px_rgb(163_148_255_/_0.28)]',
              )}
            >
              {faqs.submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={11} className="animate-spin" aria-hidden />
                  {t('admin.products.formula.faq.adding')}
                </span>
              ) : (
                t('admin.products.formula.faq.add')
              )}
            </button>
          ) : undefined
        }
      >
        {drawer.loadingProduct ? (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="aspect-square rounded-2xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : drawer.loadError ? (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-support-error">{drawer.loadError}</p>
            <Button type="button" variant="outline" onClick={handleDrawerClose}>
              {t('admin.products.formula.close')}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div
              className="flex gap-2"
              role="tablist"
              aria-label={t('admin.products.formula.tabsAria')}
            >
              {(
                [
                  ['details', 'admin.products.formula.tabs.details'],
                  ['faq', 'admin.products.formula.tabs.faq'],
                ] as const
              ).map(([tab, labelKey]) => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`${tabsId}-${tab}`}
                    aria-selected={isActive}
                    aria-controls={`${tabsId}-panel-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'rounded-lg px-4 py-[7px] text-xs font-semibold leading-4 transition-colors',
                      focusRingClasses,
                      isActive
                        ? 'border border-white/10 bg-white/10 text-white'
                        : 'bg-white/5 text-white/40 hover:text-white/60',
                    )}
                  >
                    {t(labelKey)}
                  </button>
                )
              })}
            </div>

            <div
              id={`${tabsId}-panel-details`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-details`}
              hidden={activeTab !== 'details'}
            >
          <form
            id={formId}
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSave()
            }}
          >
            {/* Visual Identity Gallery */}
            <section className="space-y-3">
              <h3 className="admin-label text-[8px] tracking-[0.2em] text-white/30">
                {t('admin.products.formula.gallery')}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {drawer.existingImages.map((url) => (
                  <div
                    key={url}
                    className="admin-glass relative aspect-square overflow-hidden rounded-2xl p-1.5"
                  >
                    <img src={url} alt="" className="size-full rounded-xl object-cover" />
                    <button
                      type="button"
                      className={cn(
                        'absolute end-2 top-2 rounded-full bg-black/60 p-1 text-white',
                        focusRingClasses,
                      )}
                      aria-label={t('admin.products.formula.removeImage')}
                      onClick={() => drawer.removeExistingImage(url)}
                    >
                      <X size={10} aria-hidden />
                    </button>
                  </div>
                ))}
                {drawer.newImages.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="admin-glass relative aspect-square overflow-hidden rounded-2xl p-1.5"
                  >
                    <LocalImagePreview file={file} />
                    <button
                      type="button"
                      className={cn(
                        'absolute end-2 top-2 rounded-full bg-black/60 p-1 text-white',
                        focusRingClasses,
                      )}
                      aria-label={t('admin.products.formula.removeImage')}
                      onClick={() => drawer.removeNewImage(index)}
                    >
                      <X size={10} aria-hidden />
                    </button>
                  </div>
                ))}
                {drawer.canUploadMore ? (
                  <label
                    className={cn(
                      'flex aspect-square cursor-pointer flex-col items-center justify-center gap-2',
                      'rounded-2xl border border-dashed border-white/20 bg-white/[0.03]',
                      'text-center text-[8px] font-bold uppercase tracking-[0.12em] text-white/45',
                      'hover:bg-white/[0.06]',
                      focusRingClasses,
                    )}
                  >
                    <ImagePlus size={16} aria-hidden />
                    {t('admin.products.formula.uploadAsset')}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        drawer.addImages(event.target.files)
                        event.target.value = ''
                      }}
                    />
                  </label>
                ) : null}
              </div>
              <p className="text-xs text-secondary-text">
                {t('admin.products.formula.galleryHint', {
                  count: drawer.imageSlotsUsed,
                  max: ADMIN_PRODUCT_IMAGES_MAX,
                })}
              </p>
              {drawer.errors.images ? (
                <p className="text-xs text-support-error" role="alert">
                  {drawer.errors.images}
                </p>
              ) : null}
            </section>

            {/* Meta title (= product name) */}
            <div className="space-y-2">
              <label htmlFor={`${formId}-name`} className={labelClass}>
                {t('admin.products.formula.metaTitle')}
              </label>
              <input
                id={`${formId}-name`}
                className={cn(fieldClass, drawer.errors.name && 'border-support-error')}
                value={drawer.values.name}
                onChange={(event) => drawer.setField('name', event.target.value)}
                maxLength={200}
                aria-invalid={drawer.errors.name ? true : undefined}
              />
              {drawer.errors.name ? (
                <p className="text-xs text-support-error" role="alert">
                  {drawer.errors.name}
                </p>
              ) : null}
            </div>

            {/* Sensitive skin */}
            <fieldset className="space-y-3">
              <legend className={labelClass}>{t('admin.products.formula.sensitivity')}</legend>
              <label className="inline-flex items-center gap-3 text-sm text-primary-text">
                <input
                  type="checkbox"
                  className="size-5 rounded border-border-subtle bg-input accent-accent"
                  checked={drawer.values.isSensitiveSkin}
                  onChange={(event) =>
                    drawer.setField('isSensitiveSkin', event.target.checked)
                  }
                />
                {t('admin.products.formula.sensitiveSkin')}
              </label>
            </fieldset>

            {/* Pricing & inventory */}
            <section className="space-y-4">
              <h3 className="admin-label text-[8px] tracking-[0.2em] text-white/30">
                {t('admin.products.formula.clinical')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor={`${formId}-price`} className={labelClass}>
                    {t('admin.products.formula.price')}
                  </label>
                  <input
                    id={`${formId}-price`}
                    type="number"
                    min={0}
                    step="0.01"
                    className={cn(fieldClass, drawer.errors.price && 'border-support-error')}
                    value={drawer.values.price}
                    onChange={(event) => drawer.setField('price', event.target.value)}
                    aria-invalid={drawer.errors.price ? true : undefined}
                  />
                  {drawer.errors.price ? (
                    <p className="text-xs text-support-error" role="alert">
                      {drawer.errors.price}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${formId}-stock`} className={labelClass}>
                    {t('admin.products.formula.stock')}
                  </label>
                  <input
                    id={`${formId}-stock`}
                    type="number"
                    min={0}
                    step={1}
                    className={cn(fieldClass, drawer.errors.stock && 'border-support-error')}
                    value={drawer.values.stock}
                    onChange={(event) => drawer.setField('stock', event.target.value)}
                    aria-invalid={drawer.errors.stock ? true : undefined}
                  />
                  {drawer.errors.stock ? (
                    <p className="text-xs text-support-error" role="alert">
                      {drawer.errors.stock}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${formId}-category`} className={labelClass}>
                    {t('admin.products.formula.category')}
                  </label>
                  <Select
                    id={`${formId}-category`}
                    value={drawer.values.category}
                    onValueChange={(next) => {
                      drawer.setField('category', next)
                      drawer.setField('subCategory', '')
                    }}
                    aria-invalid={Boolean(drawer.errors.category)}
                    triggerClassName={drawer.errors.category ? 'border-support-error' : undefined}
                    placeholder={t('admin.products.formula.selectCategory')}
                    options={[
                      { value: '', label: t('admin.products.formula.selectCategory') },
                      ...categories.map((category) => ({
                        value: category._id,
                        label: category.name,
                      })),
                    ]}
                  />
                  {drawer.errors.category ? (
                    <p className="text-xs text-support-error" role="alert">
                      {drawer.errors.category}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${formId}-subCategory`} className={labelClass}>
                    {t('admin.products.formula.subCategory')}
                  </label>
                  <Select
                    id={`${formId}-subCategory`}
                    value={drawer.values.subCategory}
                    disabled={!drawer.values.category || subLoading}
                    onValueChange={(next) => drawer.setField('subCategory', next)}
                    aria-invalid={Boolean(drawer.errors.subCategory)}
                    triggerClassName={
                      drawer.errors.subCategory ? 'border-support-error' : undefined
                    }
                    placeholder={
                      subLoading
                        ? t('admin.products.formula.loadingSubcategories')
                        : t('admin.products.formula.selectSubCategory')
                    }
                    options={[
                      {
                        value: '',
                        label: subLoading
                          ? t('admin.products.formula.loadingSubcategories')
                          : t('admin.products.formula.selectSubCategory'),
                      },
                      ...subcategories.map((item) => ({
                        value: item._id,
                        label: item.name,
                      })),
                    ]}
                  />
                  {drawer.errors.subCategory ? (
                    <p className="text-xs text-support-error" role="alert">
                      {drawer.errors.subCategory}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Concerns */}
            <fieldset className="space-y-3">
              <legend className={labelClass}>{t('admin.products.formula.concerns')}</legend>
              <div className="space-y-3">
                {ADMIN_PRODUCT_CONCERNS.map((concern) => (
                  <label
                    key={concern}
                    className="flex items-center gap-3 text-sm text-primary-text"
                  >
                    <input
                      type="checkbox"
                      className="size-5 rounded border-border-subtle bg-input accent-accent"
                      checked={drawer.values.concerns.includes(concern)}
                      onChange={() => drawer.toggleConcern(concern)}
                    />
                    {t(`admin.products.formula.concernOptions.${concern}`)}
                  </label>
                ))}
              </div>
              {drawer.errors.concerns ? (
                <p className="text-xs text-support-error" role="alert">
                  {drawer.errors.concerns}
                </p>
              ) : null}
            </fieldset>

            {/* Text areas */}
            {(
              [
                ['description', 'descPlaceholder'],
                ['advantages', 'advPlaceholder'],
                ['composition', 'compPlaceholder'],
              ] as const
            ).map(([field, placeholderKey]) => (
              <div key={field} className="space-y-2">
                <label htmlFor={`${formId}-${field}`} className={labelClass}>
                  {t(`admin.products.formula.${field}`)}
                </label>
                <textarea
                  id={`${formId}-${field}`}
                  rows={field === 'composition' ? 3 : 4}
                  maxLength={2000}
                  className={cn(
                    fieldClass,
                    'min-h-[4rem] resize-y',
                    drawer.errors[field] && 'border-support-error',
                  )}
                  placeholder={t(`admin.products.formula.${placeholderKey}`)}
                  value={drawer.values[field]}
                  onChange={(event) => drawer.setField(field, event.target.value)}
                  aria-invalid={drawer.errors[field] ? true : undefined}
                />
                {drawer.errors[field] ? (
                  <p className="text-xs text-support-error" role="alert">
                    {drawer.errors[field]}
                  </p>
                ) : null}
              </div>
            ))}

            {/* Catalog upload */}
            <section className="space-y-3">
              <h3 className={labelClass}>{t('admin.products.formula.catalog')}</h3>
              {drawer.existingCatalog && !drawer.removeCatalog && !drawer.catalogFile ? (
                <div className="admin-glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                  <a
                    href={drawer.existingCatalog}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm text-accent hover:text-accent-soft"
                  >
                    {t('admin.products.formula.viewCatalog')}
                  </a>
                  <button
                    type="button"
                    className={cn('rounded-lg p-2 text-secondary-text hover:text-support-error', focusRingClasses)}
                    aria-label={t('admin.products.formula.removeCatalog')}
                    onClick={drawer.clearCatalog}
                  >
                    <Trash2 size={13} aria-hidden />
                  </button>
                </div>
              ) : null}
              {drawer.catalogFile ? (
                <div className="admin-glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                  <span className="truncate text-sm text-primary-text">
                    {drawer.catalogFile.name}
                  </span>
                  <button
                    type="button"
                    className={cn('rounded-lg p-2 text-secondary-text hover:text-support-error', focusRingClasses)}
                    aria-label={t('admin.products.formula.removeCatalog')}
                    onClick={() => drawer.setCatalog(null)}
                  >
                    <Trash2 size={13} aria-hidden />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex min-h-[4.4rem] cursor-pointer flex-col items-center justify-center gap-2',
                    'rounded-2xl border border-dashed border-white/20 bg-white/[0.03]',
                    'text-[8px] font-bold uppercase tracking-[0.12em] text-white/45',
                    'hover:bg-white/[0.06]',
                    focusRingClasses,
                  )}
                >
                  <Upload size={14} aria-hidden />
                  {t('admin.products.formula.uploadFile')}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      drawer.setCatalog(file)
                      event.target.value = ''
                    }}
                  />
                </label>
              )}
              {drawer.errors.catalog ? (
                <p className="text-xs text-support-error" role="alert">
                  {drawer.errors.catalog}
                </p>
              ) : null}
            </section>
          </form>
            </div>

            <div
              id={`${tabsId}-panel-faq`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-faq`}
              hidden={activeTab !== 'faq'}
            >
              <FormulaSpecsFaqPanel
                formId={faqFormId}
                faqs={faqs.faqs}
                loading={faqs.loading}
                loadError={faqs.loadError}
                question={faqs.question}
                answer={faqs.answer}
                errors={faqs.errors}
                submitting={faqs.submitting}
                submitError={faqs.submitError}
                expandedId={faqs.expandedId}
                canCreate={faqs.canCreate}
                editingFaq={faqs.editingFaq}
                editQuestion={faqs.editQuestion}
                editAnswer={faqs.editAnswer}
                editErrors={faqs.editErrors}
                editSubmitting={faqs.editSubmitting}
                editSubmitError={faqs.editSubmitError}
                onQuestionChange={faqs.setQuestion}
                onAnswerChange={faqs.setAnswer}
                onToggleExpanded={faqs.toggleExpanded}
                onOpenEdit={faqs.openEdit}
                onCloseEdit={faqs.closeEdit}
                onEditQuestionChange={faqs.setEditQuestion}
                onEditAnswerChange={faqs.setEditAnswer}
                onSubmitEdit={() => {
                  void handleFaqEditSubmit()
                }}
                onSubmit={() => {
                  void handleFaqSubmit()
                }}
              />
            </div>
          </div>
        )}
      </Drawer>

      <Dialog
        open={discardOpen}
        title={t('admin.products.formula.discardTitle')}
        description={t('admin.products.formula.discardDescription')}
        onClose={() => setDiscardOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDiscardOpen(false)}>
              {t('admin.products.formula.keepEditing')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDiscardOpen(false)
                onClose()
              }}
            >
              {t('admin.products.formula.discardConfirm')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-secondary-text">
          {t('admin.products.formula.discardBody')}
        </p>
      </Dialog>

      <Dialog
        open={archiveOpen}
        title={t('admin.products.formula.archiveTitle')}
        description={t('admin.products.formula.archiveDescription')}
        onClose={() => setArchiveOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setArchiveOpen(false)}>
              {t('admin.products.formula.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={drawer.archiving}
              onClick={() => void handleArchive()}
            >
              {drawer.archiving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={11} className="animate-spin" aria-hidden />
                  {t('admin.products.formula.archiving')}
                </span>
              ) : (
                t('admin.products.formula.archiveConfirm')
              )}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-secondary-text">
          {t('admin.products.formula.archiveBody')}
        </p>
      </Dialog>

      <Dialog
        open={restoreOpen}
        title={t('admin.products.formula.restoreTitle')}
        description={t('admin.products.formula.restoreDescription')}
        onClose={() => setRestoreOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRestoreOpen(false)}>
              {t('admin.products.formula.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={drawer.restoring}
              onClick={() => void handleRestore()}
            >
              {drawer.restoring ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={11} className="animate-spin" aria-hidden />
                  {t('admin.products.formula.restoring')}
                </span>
              ) : (
                t('admin.products.formula.restoreConfirm')
              )}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-secondary-text">
          {t('admin.products.formula.restoreBody')}
        </p>
      </Dialog>

      <Dialog
        open={deleteOpen}
        title={t('admin.products.formula.deleteTitle')}
        description={t('admin.products.formula.deleteDescription')}
        onClose={() => setDeleteOpen(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
              {t('admin.products.formula.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={drawer.deleting}
              className="border-support-error/40 text-support-error hover:bg-support-error/10"
              onClick={() => void handleDelete()}
            >
              {drawer.deleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={11} className="animate-spin" aria-hidden />
                  {t('admin.products.formula.deleting')}
                </span>
              ) : (
                t('admin.products.formula.deleteConfirm')
              )}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-secondary-text">
          {t('admin.products.formula.deleteBody')}
        </p>
      </Dialog>
    </>
  )
}
