// src/components/admin/categories/CategoryDrawer.tsx
import { Loader2, Upload, X } from 'lucide-react'
import { useCallback, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useCategoryDrawer,
  type CategoryDrawerMode,
} from '../../../hooks/useCategoryDrawer'
import { cn } from '../../../lib/cn'
import type { AdminCategoryRow } from '../../../types/adminCategories'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'

interface CategoryDrawerProps {
  open: boolean
  mode: CategoryDrawerMode
  category: AdminCategoryRow | null
  onClose: () => void
  onSaved: (category: AdminCategoryRow) => void
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

export function CategoryDrawer({
  open,
  mode,
  category,
  onClose,
  onSaved,
}: CategoryDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const drawer = useCategoryDrawer({
    open,
    mode,
    category,
    onSaved: (saved) => {
      toast.success(
        mode === 'create'
          ? t('admin.categories.drawer.createSuccess')
          : t('admin.categories.drawer.updateSuccess'),
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
      ? t('admin.categories.drawer.createTitle')
      : t('admin.categories.drawer.editTitle')

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.categories.drawer.subtitle')}
      onClose={handleClose}
      width="settings"
      footer={
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
              {t('admin.categories.drawer.saving')}
            </>
          ) : (
            t('admin.categories.drawer.save')
          )}
        </button>
      }
    >
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
          <p className={labelClass}>{t('admin.categories.drawer.image')}</p>
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
                    {t('admin.categories.drawer.uploadImage')}
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
                aria-label={t('admin.categories.drawer.removeImage')}
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
            {t('admin.categories.drawer.imageHint')}
          </p>
          <FieldError message={drawer.errors.image} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-nameEn`}>
            {t('admin.categories.drawer.nameEn')}
          </label>
          <input
            id={`${formId}-nameEn`}
            type="text"
            value={drawer.values.nameEn}
            disabled={drawer.submitting}
            onChange={(event) => drawer.setField('nameEn', event.target.value)}
            maxLength={50}
            className={cn(fieldClass, 'mt-2')}
          />
          <FieldError message={drawer.errors.nameEn} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${formId}-nameAr`}>
            {t('admin.categories.drawer.nameAr')}
          </label>
          <input
            id={`${formId}-nameAr`}
            type="text"
            dir="rtl"
            value={drawer.values.nameAr}
            disabled={drawer.submitting}
            onChange={(event) => drawer.setField('nameAr', event.target.value)}
            maxLength={50}
            className={cn(fieldClass, 'mt-2')}
          />
          <FieldError message={drawer.errors.nameAr} />
        </div>

        {mode === 'edit' && category?.slug ? (
          <div>
            <p className={labelClass}>{t('admin.categories.drawer.slug')}</p>
            <p className="mt-2 font-mono text-sm text-secondary-text">
              {category.slug}
            </p>
            <p className="mt-1 text-[8px] text-white/40">
              {t('admin.categories.drawer.slugHint')}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {t('admin.categories.drawer.active')}
            </p>
            <p className="text-[8px] text-white/40">
              {t('admin.categories.drawer.activeHint')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={drawer.values.isActive}
            aria-label={t('admin.categories.drawer.active')}
            disabled={drawer.submitting}
            onClick={() => drawer.setField('isActive', !drawer.values.isActive)}
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
    </Drawer>
  )
}
