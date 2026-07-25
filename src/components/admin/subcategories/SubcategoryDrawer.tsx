// src/components/admin/subcategories/SubcategoryDrawer.tsx
import { Loader2, Upload, X } from 'lucide-react'
import { useCallback, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useSubcategoryDrawer,
  type SubcategoryDrawerMode,
} from '../../../hooks/useSubcategoryDrawer'
import { cn } from '../../../lib/cn'
import type { AdminSubcategoryRow } from '../../../types/adminSubcategories'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface SubcategoryDrawerProps {
  open: boolean
  mode: SubcategoryDrawerMode
  subcategory: AdminSubcategoryRow | null
  onClose: () => void
  onSaved: (subcategory: AdminSubcategoryRow) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-support-error">{message}</p>
}

export function SubcategoryDrawer({
  open,
  mode,
  subcategory,
  onClose,
  onSaved,
}: SubcategoryDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const drawer = useSubcategoryDrawer({
    open,
    mode,
    subcategory,
    onSaved: (saved) => {
      toast.success(
        mode === 'create'
          ? t('admin.subcategories.drawer.createSuccess')
          : t('admin.subcategories.drawer.updateSuccess'),
      )
      onSaved(saved)
      onClose()
    },
  })

  const handleClose = useCallback(() => {
    if (drawer.submitting) return
    onClose()
  }, [drawer.submitting, onClose])

  const title =
    mode === 'create'
      ? t('admin.subcategories.drawer.createTitle')
      : t('admin.subcategories.drawer.editTitle')

  const footer =
    !drawer.loading && !drawer.loadError ? (
      <button
        type="submit"
        form={formId}
        disabled={drawer.submitting}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-2xl',
          'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3.5',
          'text-sm font-bold text-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClasses,
        )}
      >
        {drawer.submitting ? (
          <>
            <Loader2 size={13} className="animate-spin" aria-hidden />
            {t('admin.subcategories.drawer.saving')}
          </>
        ) : (
          t('admin.subcategories.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.subcategories.drawer.subtitle')}
      onClose={handleClose}
      width="settings"
      footer={footer}
    >
      {drawer.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : null}

      {!drawer.loading && drawer.loadError ? (
        <EmptyState
          bare
          title={t('admin.subcategories.drawer.loadErrorTitle')}
          description={drawer.loadError}
        />
      ) : null}

      {!drawer.loading && !drawer.loadError ? (
        <form
          id={formId}
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void drawer.submit()
          }}
        >
          {drawer.submitError ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {drawer.submitError}
            </p>
          ) : null}

          <div>
            <p className={labelClass}>{t('admin.subcategories.drawer.image')}</p>
            <div className="relative mt-2">
              <button
                type="button"
                disabled={drawer.submitting}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex h-32 w-full items-center justify-center overflow-hidden rounded-xl',
                  'border border-dashed border-white/15 bg-white/5',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  focusRingClasses,
                )}
              >
                {drawer.imagePreview ? (
                  <img
                    src={drawer.imagePreview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-white/40">
                    <Upload size={18} aria-hidden />
                    <span className="text-xs font-medium">
                      {t('admin.subcategories.drawer.uploadImage')}
                    </span>
                  </span>
                )}
              </button>
              {drawer.imageFile ? (
                <button
                  type="button"
                  disabled={drawer.submitting}
                  onClick={drawer.clearImage}
                  className={cn(
                    'absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-lg',
                    'border border-white/10 bg-black/50 text-white/80 hover:bg-black/70',
                    focusRingClasses,
                  )}
                  aria-label={t('admin.subcategories.drawer.removeImage')}
                >
                  <X size={14} aria-hidden />
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={(event) =>
                drawer.setImage(event.target.files?.[0] ?? null)
              }
            />
            <p className="mt-1 text-[8px] text-white/40">
              {t('admin.subcategories.drawer.imageHint')}
            </p>
            <FieldError message={drawer.errors.image} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-name`}>
              {t('admin.subcategories.drawer.name')}
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={drawer.values.name}
              disabled={drawer.submitting}
              onChange={(event) => drawer.setField('name', event.target.value)}
              maxLength={50}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.name} />
          </div>

          {mode === 'edit' && subcategory?.slug ? (
            <div>
              <p className={labelClass}>{t('admin.subcategories.drawer.slug')}</p>
              <p className="mt-2 font-mono text-sm text-secondary-text">
                {subcategory.slug}
              </p>
              <p className="mt-1 text-[8px] text-white/40">
                {t('admin.subcategories.drawer.slugHint')}
              </p>
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor={`${formId}-category`}>
              {t('admin.subcategories.drawer.category')}
            </label>
            <select
              id={`${formId}-category`}
              value={drawer.values.category}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('category', event.target.value)
              }
              className={cn(fieldClass, 'mt-2')}
            >
              <option value="">
                {t('admin.subcategories.drawer.selectCategory')}
              </option>
              {drawer.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[8px] text-white/40">
              {t('admin.subcategories.drawer.categoryRequired')}
            </p>
            <FieldError message={drawer.errors.category} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {t('admin.subcategories.drawer.active')}
              </p>
              <p className="text-[8px] text-white/40">
                {t('admin.subcategories.drawer.activeHint')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={drawer.values.isActive}
              aria-label={t('admin.subcategories.drawer.active')}
              disabled={drawer.submitting}
              onClick={() =>
                drawer.setField('isActive', !drawer.values.isActive)
              }
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
                focusRingClasses,
                drawer.values.isActive ? 'bg-[#a394ff]' : 'bg-white/15',
                drawer.submitting && 'cursor-not-allowed opacity-60',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 start-1 size-4 rounded-full bg-white shadow transition-transform',
                  drawer.values.isActive && 'translate-x-5 rtl:-translate-x-5',
                )}
                aria-hidden
              />
            </button>
          </div>
        </form>
      ) : null}
    </Drawer>
  )
}
