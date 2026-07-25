// src/components/admin/faqs/FaqDrawer.tsx
import { Loader2 } from 'lucide-react'
import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import {
  useFaqDrawer,
  type FaqDrawerMode,
} from '../../../hooks/useFaqDrawer'
import { cn } from '../../../lib/cn'
import type { AdminFaqRow } from '../../../types/adminFaqs'
import {
  ADMIN_FAQ_ANSWER_MAX,
  ADMIN_FAQ_QUESTION_MAX,
} from '../../../utils/adminFaqsFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

interface FaqDrawerProps {
  open: boolean
  mode: FaqDrawerMode
  faq: AdminFaqRow | null
  defaultProductId?: string
  onClose: () => void
  onSaved: (faq: AdminFaqRow) => void
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

export function FaqDrawer({
  open,
  mode,
  faq,
  defaultProductId = '',
  onClose,
  onSaved,
}: FaqDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()

  const drawer = useFaqDrawer({
    open,
    mode,
    faq,
    defaultProductId,
    onSaved: (saved) => {
      toast.success(
        mode === 'create'
          ? t('admin.faqs.drawer.createSuccess')
          : t('admin.faqs.drawer.updateSuccess'),
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
      ? t('admin.faqs.drawer.createTitle')
      : t('admin.faqs.drawer.editTitle')

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
            {t('admin.faqs.drawer.saving')}
          </>
        ) : (
          t('admin.faqs.drawer.save')
        )}
      </button>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.faqs.drawer.subtitle')}
      onClose={handleClose}
      width="settings"
      footer={footer}
    >
      {drawer.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : null}

      {!drawer.loading && drawer.loadError ? (
        <EmptyState
          bare
          title={t('admin.faqs.drawer.loadErrorTitle')}
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
            <label className={labelClass} htmlFor={`${formId}-product`}>
              {t('admin.faqs.drawer.product')}
            </label>
            {mode === 'edit' ? (
              <>
                <p className="mt-2 text-sm text-primary-text">
                  {faq?.productName || t('admin.faqs.noProduct')}
                </p>
                <p className="mt-1 text-[8px] text-white/40">
                  {t('admin.faqs.drawer.productLocked')}
                </p>
              </>
            ) : (
              <>
                <select
                  id={`${formId}-product`}
                  value={drawer.values.product}
                  disabled={drawer.submitting}
                  onChange={(event) =>
                    drawer.setField('product', event.target.value)
                  }
                  className={cn(fieldClass, 'mt-2')}
                >
                  <option value="">
                    {t('admin.faqs.drawer.selectProduct')}
                  </option>
                  {drawer.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[8px] text-white/40">
                  {t('admin.faqs.drawer.productRequired')}
                </p>
                <FieldError message={drawer.errors.product} />
              </>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-question`}>
              {t('admin.faqs.drawer.question')}
            </label>
            <input
              id={`${formId}-question`}
              type="text"
              value={drawer.values.question}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('question', event.target.value)
              }
              maxLength={ADMIN_FAQ_QUESTION_MAX}
              className={cn(fieldClass, 'mt-2')}
            />
            <FieldError message={drawer.errors.question} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${formId}-answer`}>
              {t('admin.faqs.drawer.answer')}
            </label>
            <textarea
              id={`${formId}-answer`}
              value={drawer.values.answer}
              disabled={drawer.submitting}
              onChange={(event) =>
                drawer.setField('answer', event.target.value)
              }
              rows={5}
              maxLength={ADMIN_FAQ_ANSWER_MAX}
              className={cn(fieldClass, 'mt-2 resize-none')}
            />
            <FieldError message={drawer.errors.answer} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {t('admin.faqs.drawer.active')}
              </p>
              <p className="text-[8px] text-white/40">
                {t('admin.faqs.drawer.activeHint')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={drawer.values.isActive}
              aria-label={t('admin.faqs.drawer.active')}
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
