// src/components/admin/brands/BrandDrawer.tsx
import { Loader2, Upload, X } from 'lucide-react'
import { useCallback, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useBrandDrawer,
  type BrandDrawerMode,
} from '../../../hooks/useBrandDrawer'
import { cn } from '../../../lib/cn'
import type { AdminBrandRow } from '../../../types/adminBrands'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Select } from '../ui/Select'
import { Skeleton } from '../ui/Skeleton'

interface BrandDrawerProps {
  open: boolean
  mode: BrandDrawerMode
  brand: AdminBrandRow | null
  onClose: () => void
  onSaved: (brand: AdminBrandRow) => void
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

export function BrandDrawer({
  open,
  mode,
  brand,
  onClose,
  onSaved,
}: BrandDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const drawer = useBrandDrawer({
    open,
    mode,
    brand,
    onSaved: (saved) => {
      toast.success(
        mode === 'create'
          ? t('admin.brands.drawer.createSuccess')
          : t('admin.brands.drawer.updateSuccess'),
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
      ? t('admin.brands.drawer.createTitle')
      : t('admin.brands.drawer.editTitle')

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
            {t('admin.brands.drawer.saving')}
          </>
        ) : (
          t('admin.brands.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.brands.drawer.subtitle')}
      onClose={handleClose}
      width="settings"
      footer={footer}
    >
      {drawer.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : null}

      {!drawer.loading && drawer.loadError ? (
        <EmptyState
          bare
          title={t('admin.brands.drawer.loadErrorTitle')}
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
            <p className={labelClass}>{t('admin.brands.drawer.logo')}</p>
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
                {drawer.logoPreview ? (
                  <img
                    src={drawer.logoPreview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-white/40">
                    <Upload size={18} aria-hidden />
                    <span className="text-xs font-medium">
                      {t('admin.brands.drawer.uploadLogo')}
                    </span>
                  </span>
                )}
              </button>
              {drawer.logoFile ? (
                <button
                  type="button"
                  disabled={drawer.submitting}
                  onClick={drawer.clearLogo}
                  className={cn(
                    'absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-lg',
                    'border border-white/10 bg-black/50 text-white/80 hover:bg-black/70',
                    focusRingClasses,
                  )}
                  aria-label={t('admin.brands.drawer.removeLogo')}
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
                drawer.setLogo(event.target.files?.[0] ?? null)
              }
            />
            <p className="mt-1 text-[8px] text-white/40">
              {t('admin.brands.drawer.logoHint')}
            </p>
            <FieldError message={drawer.errors.logo} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-nameEn`}>
              {t('admin.brands.drawer.nameEn')}
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
              {t('admin.brands.drawer.nameAr')}
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

          {mode === 'edit' && brand?.slug ? (
            <div>
              <p className={labelClass}>{t('admin.brands.drawer.slug')}</p>
              <p className="mt-2 font-mono text-sm text-secondary-text">
                {brand.slug}
              </p>
              <p className="mt-1 text-[8px] text-white/40">
                {t('admin.brands.drawer.slugHint')}
              </p>
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor={`${formId}-category`}>
              {t('admin.brands.drawer.category')}
            </label>
            <Select
              id={`${formId}-category`}
              value={drawer.values.category}
              disabled={drawer.submitting}
              onValueChange={(next) => drawer.setField('category', next)}
              triggerClassName="mt-2"
              placeholder={t('admin.brands.drawer.selectCategory')}
              options={[
                { value: '', label: t('admin.brands.drawer.selectCategory') },
                ...drawer.categories.map((category) => ({
                  value: category._id,
                  label: category.name,
                })),
              ]}
            />
            <p className="mt-1 text-[8px] text-white/40">
              {t('admin.brands.drawer.categoryOptional')}
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-description`}>
              {t('admin.brands.drawer.description')}
            </label>
            <textarea
              id={`${formId}-description`}
              value={drawer.values.description}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('description', event.target.value)
              }
              rows={3}
              maxLength={500}
              placeholder={t('admin.brands.drawer.descriptionOptional')}
              className={cn(fieldClass, 'mt-2 resize-none')}
            />
            <FieldError message={drawer.errors.description} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {t('admin.brands.drawer.active')}
              </p>
              <p className="text-[8px] text-white/40">
                {t('admin.brands.drawer.activeHint')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={drawer.values.isActive}
              aria-label={t('admin.brands.drawer.active')}
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
