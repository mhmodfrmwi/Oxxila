// src/components/admin/products/FormulaSpecsFaqPanel.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminFaqFormErrors, AdminFaqRow } from '../../../types/adminFaqs'
import {
  ADMIN_FAQ_ANSWER_MAX,
  ADMIN_FAQ_QUESTION_MAX,
} from '../../../utils/adminFaqsFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[17px] py-[13px]',
  'text-xs leading-5 text-primary-text placeholder:text-[#6b6b6b]',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

const iconButtonClass = cn(
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
  'text-white/50 transition-colors hover:bg-white/10 hover:text-white',
  focusRingClasses,
)

interface FormulaSpecsFaqPanelProps {
  formId: string
  faqs: AdminFaqRow[]
  loading: boolean
  loadError: string | null
  question: string
  answer: string
  errors: { question?: string; answer?: string }
  submitting: boolean
  submitError: string | null
  expandedId: string | null
  canCreate: boolean
  editingFaq: AdminFaqRow | null
  editQuestion: string
  editAnswer: string
  editErrors: AdminFaqFormErrors
  editSubmitting: boolean
  editSubmitError: string | null
  onQuestionChange: (value: string) => void
  onAnswerChange: (value: string) => void
  onToggleExpanded: (faqId: string) => void
  onOpenEdit: (faq: AdminFaqRow) => void
  onCloseEdit: () => void
  onEditQuestionChange: (value: string) => void
  onEditAnswerChange: (value: string) => void
  onSubmitEdit: () => void
  onSubmit: () => void
}

export function FormulaSpecsFaqPanel({
  formId,
  faqs,
  loading,
  loadError,
  question,
  answer,
  errors,
  submitting,
  submitError,
  expandedId,
  canCreate,
  editingFaq,
  editQuestion,
  editAnswer,
  editErrors,
  editSubmitting,
  editSubmitError,
  onQuestionChange,
  onAnswerChange,
  onToggleExpanded,
  onOpenEdit,
  onCloseEdit,
  onEditQuestionChange,
  onEditAnswerChange,
  onSubmitEdit,
  onSubmit,
}: FormulaSpecsFaqPanelProps) {
  const { t } = useTranslation()
  const editFormId = `${formId}-edit`

  if (!canCreate) {
    return (
      <EmptyState
        bare
        title={t('admin.products.formula.faq.saveProductFirstTitle')}
        description={t('admin.products.formula.faq.saveProductFirst')}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <form
          id={formId}
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          {submitError ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className={labelClass} htmlFor={`${formId}-question`}>
              {t('admin.products.formula.faq.question')}
            </label>
            <input
              id={`${formId}-question`}
              type="text"
              value={question}
              disabled={submitting}
              maxLength={ADMIN_FAQ_QUESTION_MAX}
              placeholder={t('admin.products.formula.faq.questionPlaceholder')}
              onChange={(event) => onQuestionChange(event.target.value)}
              className={cn(
                fieldClass,
                'h-[45px]',
                errors.question && 'border-support-error',
              )}
              aria-invalid={errors.question ? true : undefined}
            />
            {errors.question ? (
              <p className="text-xs text-support-error" role="alert">
                {errors.question}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor={`${formId}-answer`}>
              {t('admin.products.formula.faq.answer')}
            </label>
            <textarea
              id={`${formId}-answer`}
              value={answer}
              disabled={submitting}
              rows={5}
              maxLength={ADMIN_FAQ_ANSWER_MAX}
              placeholder={t('admin.products.formula.faq.answerPlaceholder')}
              onChange={(event) => onAnswerChange(event.target.value)}
              className={cn(
                fieldClass,
                'h-[115px] resize-none',
                errors.answer && 'border-support-error',
              )}
              aria-invalid={errors.answer ? true : undefined}
            />
            {errors.answer ? (
              <p className="text-xs text-support-error" role="alert">
                {errors.answer}
              </p>
            ) : null}
          </div>
        </form>

        <section className="flex flex-col gap-3" aria-labelledby={`${formId}-previous`}>
          <h3 id={`${formId}-previous`} className={labelClass}>
            {t('admin.products.formula.faq.previous')}
          </h3>

          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : null}

          {!loading && loadError ? (
            <p className="text-sm text-support-error" role="alert">
              {loadError}
            </p>
          ) : null}

          {!loading && !loadError && faqs.length === 0 ? (
            <p className="text-sm text-secondary-text">
              {t('admin.products.formula.faq.empty')}
            </p>
          ) : null}

          {!loading && !loadError && faqs.length > 0 ? (
            <div
              className="flex flex-col gap-3"
              role="region"
              aria-label={t('admin.products.formula.faq.previousAria')}
            >
              {faqs.map((faq) => {
                const isOpen = expandedId === faq.id
                return (
                  <article
                    key={faq.id}
                    className={cn(
                      'overflow-hidden rounded-xl border transition-colors duration-300',
                      isOpen
                        ? 'border-white/10 bg-white/5'
                        : 'border-white/5 bg-[#272832]',
                    )}
                  >
                    <div className="flex items-start gap-2 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-5 text-primary-text">
                          {faq.question}
                        </p>
                        {!isOpen ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-secondary-text">
                            {faq.answer}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
                        <button
                          type="button"
                          className={cn(
                            iconButtonClass,
                            isOpen && 'bg-white/10 text-white',
                          )}
                          aria-expanded={isOpen}
                          aria-label={
                            isOpen
                              ? t('admin.products.formula.faq.collapseAria', {
                                  question: faq.question,
                                })
                              : t('admin.products.formula.faq.expandAria', {
                                  question: faq.question,
                                })
                          }
                          onClick={() => onToggleExpanded(faq.id)}
                        >
                          <ChevronDown
                            size={14}
                            className={cn(
                              'transition-transform duration-300',
                              isOpen && 'rotate-180',
                            )}
                            aria-hidden
                          />
                        </button>
                        <button
                          type="button"
                          className={iconButtonClass}
                          aria-label={t('admin.products.formula.faq.editAria', {
                            question: faq.question,
                          })}
                          onClick={() => onOpenEdit(faq)}
                        >
                          <Pencil size={13} aria-hidden />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <p className="border-t border-white/5 px-4 pb-3 pt-2 text-xs leading-5 text-secondary-text">
                            {faq.answer}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </article>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>

      <Dialog
        open={Boolean(editingFaq)}
        title={t('admin.products.formula.faq.editTitle')}
        description={t('admin.products.formula.faq.editDescription')}
        onClose={() => {
          if (editSubmitting) return
          onCloseEdit()
        }}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={editSubmitting}
              onClick={onCloseEdit}
            >
              {t('admin.products.formula.faq.editCancel')}
            </Button>
            <Button
              type="submit"
              form={editFormId}
              disabled={editSubmitting}
            >
              {editSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" aria-hidden />
                  {t('admin.products.formula.faq.editSaving')}
                </span>
              ) : (
                t('admin.products.formula.faq.editSave')
              )}
            </Button>
          </div>
        }
      >
        <form
          id={editFormId}
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmitEdit()
          }}
        >
          {editSubmitError ? (
            <p
              className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
              role="alert"
            >
              {editSubmitError}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className={labelClass} htmlFor={`${editFormId}-question`}>
              {t('admin.products.formula.faq.question')}
            </label>
            <input
              id={`${editFormId}-question`}
              type="text"
              value={editQuestion}
              disabled={editSubmitting}
              maxLength={ADMIN_FAQ_QUESTION_MAX}
              placeholder={t('admin.products.formula.faq.questionPlaceholder')}
              onChange={(event) => onEditQuestionChange(event.target.value)}
              className={cn(
                fieldClass,
                editErrors.question && 'border-support-error',
              )}
              aria-invalid={editErrors.question ? true : undefined}
            />
            {editErrors.question ? (
              <p className="text-xs text-support-error" role="alert">
                {editErrors.question}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor={`${editFormId}-answer`}>
              {t('admin.products.formula.faq.answer')}
            </label>
            <textarea
              id={`${editFormId}-answer`}
              value={editAnswer}
              disabled={editSubmitting}
              rows={5}
              maxLength={ADMIN_FAQ_ANSWER_MAX}
              placeholder={t('admin.products.formula.faq.answerPlaceholder')}
              onChange={(event) => onEditAnswerChange(event.target.value)}
              className={cn(
                fieldClass,
                'min-h-[7.5rem] resize-y',
                editErrors.answer && 'border-support-error',
              )}
              aria-invalid={editErrors.answer ? true : undefined}
            />
            {editErrors.answer ? (
              <p className="text-xs text-support-error" role="alert">
                {editErrors.answer}
              </p>
            ) : null}
          </div>
        </form>
      </Dialog>
    </>
  )
}
