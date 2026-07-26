// src/components/admin/products/FormulaSpecsFaqPanel.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminFaqRow } from '../../../types/adminFaqs'
import {
  ADMIN_FAQ_ANSWER_MAX,
  ADMIN_FAQ_QUESTION_MAX,
} from '../../../utils/adminFaqsFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[17px] py-[13px]',
  'text-xs leading-5 text-primary-text placeholder:text-[#6b6b6b]',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

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
  onQuestionChange: (value: string) => void
  onAnswerChange: (value: string) => void
  onToggleExpanded: (faqId: string) => void
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
  onQuestionChange,
  onAnswerChange,
  onToggleExpanded,
  onSubmit,
}: FormulaSpecsFaqPanelProps) {
  const { t } = useTranslation()

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

      <section className="flex flex-col gap-4" aria-labelledby={`${formId}-previous`}>
        <h3 id={`${formId}-previous`} className={labelClass}>
          {t('admin.products.formula.faq.previous')}
        </h3>

        {loading ? (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-[9.5rem] w-full rounded-[2.25rem]" />
            <Skeleton className="h-14 w-full rounded-[11px]" />
            <Skeleton className="h-14 w-full rounded-[11px]" />
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
            className="flex flex-col gap-4"
            role="region"
            aria-label={t('admin.products.formula.faq.previousAria')}
          >
            {faqs.map((faq) => {
              const isOpen = expandedId === faq.id
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'overflow-hidden border transition-colors duration-300',
                    isOpen
                      ? 'rounded-[2.25rem] border-white/10 bg-white/5'
                      : 'rounded-[11px] border-transparent bg-[#272832]',
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center justify-between gap-3 text-start',
                      isOpen ? 'px-[23px] pt-[23px] pb-2' : 'px-[23px] py-4',
                      focusRingClasses,
                    )}
                    aria-expanded={isOpen}
                    onClick={() => onToggleExpanded(faq.id)}
                  >
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate font-normal text-primary-text',
                        isOpen
                          ? 'text-[1.3rem] leading-[1.5]'
                          : 'text-base leading-[1.5]',
                      )}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center transition-colors',
                        isOpen
                          ? 'rounded-full bg-white text-[#1a1c29]'
                          : 'text-primary-text',
                      )}
                      aria-hidden
                    >
                      <ChevronDown
                        size={18}
                        className={cn(
                          'transition-transform duration-300',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="px-[23px] pb-[23px] text-[0.808rem] leading-[1.2] text-[#6b6b6b]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        ) : null}
      </section>
    </div>
  )
}
