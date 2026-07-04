// src/components/landing/how-it-works/HowItWorksAccordion.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STEP_IDS = ['concern', 'explanations', 'checkout'] as const

interface HowItWorksAccordionProps {
  openId: string
  onOpenChange: (id: string) => void
}

export function HowItWorksAccordion({ openId, onOpenChange }: HowItWorksAccordionProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4" role="region" aria-label={t('home.howItWorks.stepsAria')}>
      {STEP_IDS.map((stepId) => {
        const isOpen = openId === stepId

        return (
          <motion.div
            key={stepId}
            initial={false}
            className={[
              'overflow-hidden rounded-3xl border transition-colors duration-300',
              isOpen
                ? 'border-transparent bg-card shadow-lg shadow-black/5 dark:shadow-[0_8px_40px_var(--accent-glow)]'
                : 'border-border-subtle bg-transparent hover:border-accent-soft/40',
            ].join(' ')}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start min-[481px]:gap-4 min-[481px]:px-5 min-[481px]:py-5 sm:px-6 sm:py-6"
              aria-expanded={isOpen}
              onClick={() => onOpenChange(isOpen ? '' : stepId)}
            >
              <span className="min-w-0 font-serif text-base font-medium text-primary-text min-[481px]:text-lg sm:text-xl">
                {t(`home.howItWorks.steps.${stepId}.title`)}
              </span>

              <span
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                  isOpen
                    ? 'bg-button-primary text-on-emphasis'
                    : 'bg-accent-soft/10 text-accent-soft',
                ].join(' ')}
                aria-hidden
              >
                <ChevronDown
                  size={20}
                  className={['transition-transform duration-300', isOpen ? 'rotate-180' : ''].join(
                    ' ',
                  )}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <p className="text-sm leading-relaxed text-secondary-text sm:text-base">
                      {t(`home.howItWorks.steps.${stepId}.description`)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
