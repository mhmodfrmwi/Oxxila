// src/components/admin/settings/BannerDrawer.tsx
import { Loader2, Upload } from 'lucide-react'
import { useCallback, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useBannerDrawer,
  type BannerDrawerMode,
} from '../../../hooks/useBannerDrawer'
import { cn } from '../../../lib/cn'
import type { AdminBannerLinkType, AdminBannerRow } from '../../../types/adminBanners'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface BannerDrawerProps {
  open: boolean
  mode: BannerDrawerMode
  banner: AdminBannerRow | null
  onClose: () => void
  onSaved: (banner: AdminBannerRow) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

const LINK_TYPES = ['none', 'product', 'category', 'url'] as const

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-support-error">{message}</p>
}

export function BannerDrawer({
  open,
  mode,
  banner,
  onClose,
  onSaved,
}: BannerDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const drawer = useBannerDrawer({
    open,
    mode,
    banner,
    onSaved: (saved) => {
      toast.success(
        mode === 'create'
          ? t('admin.settings.banners.drawer.createSuccess')
          : t('admin.settings.banners.drawer.updateSuccess'),
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
      ? t('admin.settings.banners.drawer.createTitle')
      : t('admin.settings.banners.drawer.editTitle')

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
            {t('admin.settings.banners.drawer.saving')}
          </>
        ) : (
          t('admin.settings.banners.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.settings.banners.drawer.subtitle')}
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
          title={t('admin.settings.banners.drawer.loadErrorTitle')}
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
            <p className={labelClass}>
              {t('admin.settings.banners.drawer.image')}
            </p>
            <button
              type="button"
              disabled={drawer.submitting}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'mt-2 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl',
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
                    {t('admin.settings.banners.drawer.uploadImage')}
                  </span>
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) =>
                drawer.setImage(event.target.files?.[0] ?? null)
              }
            />
            <FieldError message={drawer.errors.image} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-title`}>
              {t('admin.settings.banners.drawer.title')}
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              value={drawer.values.title}
              disabled={drawer.submitting}
              onChange={(event) => drawer.setField('title', event.target.value)}
              placeholder={t('admin.settings.banners.drawer.titleOptional')}
              maxLength={200}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.title} />
          </div>

          <div>
            <p className={labelClass}>
              {t('admin.settings.banners.drawer.linkType')}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LINK_TYPES.map((type) => {
                const active = drawer.values.linkType === type
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={drawer.submitting}
                    onClick={() =>
                      drawer.setField('linkType', type as AdminBannerLinkType)
                    }
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                      focusRingClasses,
                      active
                        ? 'border-[#a394ff]/40 bg-[rgba(163,148,255,0.15)] text-[#a394ff]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80',
                      drawer.submitting && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {t(`admin.settings.banners.drawer.linkTypes.${type}`)}
                  </button>
                )
              })}
            </div>
          </div>

          {drawer.values.linkType === 'product' ? (
            <div>
              <label className={labelClass} htmlFor={`${formId}-linkId`}>
                {t('admin.settings.banners.drawer.product')}
              </label>
              <select
                id={`${formId}-linkId`}
                value={drawer.values.linkId}
                disabled={drawer.submitting}
                onChange={(event) => drawer.setField('linkId', event.target.value)}
                className={cn(fieldClass, 'mt-2')}
              >
                <option value="">
                  {t('admin.settings.banners.drawer.selectProduct')}
                </option>
                {drawer.products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <FieldError message={drawer.errors.linkId} />
            </div>
          ) : null}

          {drawer.values.linkType === 'category' ? (
            <div>
              <label className={labelClass} htmlFor={`${formId}-linkId`}>
                {t('admin.settings.banners.drawer.category')}
              </label>
              <select
                id={`${formId}-linkId`}
                value={drawer.values.linkId}
                disabled={drawer.submitting}
                onChange={(event) => drawer.setField('linkId', event.target.value)}
                className={cn(fieldClass, 'mt-2')}
              >
                <option value="">
                  {t('admin.settings.banners.drawer.selectCategory')}
                </option>
                {drawer.categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={drawer.errors.linkId} />
            </div>
          ) : null}

          {drawer.values.linkType === 'url' ? (
            <div>
              <label className={labelClass} htmlFor={`${formId}-externalUrl`}>
                {t('admin.settings.banners.drawer.externalUrl')}
              </label>
              <input
                id={`${formId}-externalUrl`}
                type="url"
                value={drawer.values.externalUrl}
                disabled={drawer.submitting}
                onChange={(event) =>
                  drawer.setField('externalUrl', event.target.value)
                }
                placeholder="https://example.com"
                className={cn(fieldClass, 'mt-2')}
              />
              <FieldError message={drawer.errors.externalUrl} />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {t('admin.settings.banners.drawer.active')}
              </p>
              <p className="text-[8px] text-white/40">
                {t('admin.settings.banners.drawer.activeHint')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={drawer.values.isActive}
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

