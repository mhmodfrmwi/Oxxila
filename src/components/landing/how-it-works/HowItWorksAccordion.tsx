import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { howItWorksSteps } from '../landingData'

interface HowItWorksAccordionProps {
  openId: string
  onOpenChange: (id: string) => void
}

export function HowItWorksAccordion({ openId, onOpenChange }: HowItWorksAccordionProps) {
  return (
    <div className="space-y-4" role="region" aria-label="How it works steps">
      {howItWorksSteps.map((step) => {
        const isOpen = openId === step.id

        return (
          <motion.div
            key={step.id}
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
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left min-[481px]:gap-4 min-[481px]:px-5 min-[481px]:py-5 sm:px-6 sm:py-6"
              aria-expanded={isOpen}
              onClick={() => onOpenChange(isOpen ? '' : step.id)}
            >
              <span className="min-w-0 font-serif text-base font-medium text-primary-text min-[481px]:text-lg sm:text-xl">
                {step.title}
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
                  className={['transition-transform duration-300', isOpen ? 'rotate-180' : ''].join(' ')}
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
                      {step.description}
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
