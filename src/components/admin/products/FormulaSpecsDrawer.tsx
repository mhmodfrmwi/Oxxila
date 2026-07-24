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
import { Skeleton } from '../ui/Skeleton'

interface FormulaSpecsDrawerProps {
  open: boolean
  mode: FormulaSpecsMode
  productId: string | null
  categories: readonly ApiCategory[]
  onClose: () => void
  onSaved: (product: ApiProduct) => void
  onArchived: (productId: string) => void
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

const labelClass = 'block text-sm font-medium text-primary-text'

export function FormulaSpecsDrawer({
  open,
  mode,
  productId,
  categories,
  onClose,
  onSaved,
  onArchived,
}: FormulaSpecsDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const [discardOpen, setDiscardOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

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
  })

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
    if (drawer.submitting || drawer.archiving) return
    if (drawer.dirty) {
      setDiscardOpen(true)
      return
    }
    onClose()
  }, [drawer.submitting, drawer.archiving, drawer.dirty, onClose])

  const handleDrawerClose = useCallback(() => {
    if (discardOpen || archiveOpen) return
    requestClose()
  }, [discardOpen, archiveOpen, requestClose])

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

  const title = t('admin.products.formula.title')
  const description =
    mode === 'edit' && drawer.slug
      ? t('admin.products.formula.ref', { ref: drawer.slug })
      : mode === 'create'
        ? t('admin.products.formula.refNew')
        : t('admin.products.formula.refUnavailable')

  const busy = drawer.submitting || drawer.archiving

  return (
    <>
      <Drawer
        open={open}
        title={title}
        description={description}
        onClose={handleDrawerClose}
        width="formula"
        footer={
          <div className="flex items-center gap-3">
            {mode === 'edit' ? (
              <button
                type="button"
                disabled={busy || drawer.loadingProduct}
                onClick={() => setArchiveOpen(true)}
                className={cn(
                  'min-h-11 flex-1 rounded-xl border border-border-subtle bg-white/5 px-4',
                  'text-xs font-bold uppercase tracking-[0.12em] text-primary-text',
                  'hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50',
                  focusRingClasses,
                )}
              >
                {t('admin.products.formula.archive')}
              </button>
            ) : (
              <div className="flex-1" />
            )}
            <button
              type="submit"
              form={formId}
              disabled={busy || drawer.loadingProduct || Boolean(drawer.loadError)}
              className={cn(
                'min-h-11 flex-[1.4] rounded-xl px-4',
                'bg-gradient-to-r from-accent to-[#7c69ff] text-xs font-bold uppercase tracking-[0.12em] text-white',
                'shadow-[0_8px_20px_rgb(163_148_255_/_0.28)]',
                'disabled:pointer-events-none disabled:opacity-50',
                focusRingClasses,
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

            {/* Clinical configuration */}
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
                  <select
                    id={`${formId}-category`}
                    className={cn(fieldClass, drawer.errors.category && 'border-support-error')}
                    value={drawer.values.category}
                    onChange={(event) => {
                      drawer.setField('category', event.target.value)
                      drawer.setField('subCategory', '')
                    }}
                    aria-invalid={drawer.errors.category ? true : undefined}
                  >
                    <option value="">{t('admin.products.formula.selectCategory')}</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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
                  <select
                    id={`${formId}-subCategory`}
                    className={cn(
                      fieldClass,
                      drawer.errors.subCategory && 'border-support-error',
                    )}
                    value={drawer.values.subCategory}
                    disabled={!drawer.values.category || subLoading}
                    onChange={(event) => drawer.setField('subCategory', event.target.value)}
                    aria-invalid={drawer.errors.subCategory ? true : undefined}
                  >
                    <option value="">
                      {subLoading
                        ? t('admin.products.formula.loadingSubcategories')
                        : t('admin.products.formula.selectSubCategory')}
                    </option>
                    {subcategories.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
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
    </>
  )
}
