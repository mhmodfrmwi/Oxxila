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
                ? 'border-transparent bg-white shadow-lg shadow-black/5 dark:border-white/[0.08] dark:bg-[#171B2E] dark:shadow-[0_8px_40px_rgba(123,101,251,0.12)]'
                : 'border-[#E5E7EB] bg-transparent hover:border-[#8B7CF8]/40 dark:border-white/[0.08] dark:hover:border-[#A78BFA]/40',
            ].join(' ')}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left min-[481px]:gap-4 min-[481px]:px-5 min-[481px]:py-5 sm:px-6 sm:py-6"
              aria-expanded={isOpen}
              onClick={() => onOpenChange(isOpen ? '' : step.id)}
            >
              <span className="min-w-0 font-serif text-base font-medium text-[#1A1A1A] min-[481px]:text-lg sm:text-xl dark:text-[#F5F5F5]">
                {step.title}
              </span>

              <span
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                  isOpen
                    ? 'bg-[#8B7CF8] text-white dark:bg-[#A78BFA]'
                    : 'bg-[#8B7CF8]/10 text-[#8B7CF8] dark:bg-[#A78BFA]/15 dark:text-[#A78BFA]',
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
                    <p className="text-sm leading-relaxed text-[#6B7280] sm:text-base dark:text-[#B3B3B3]">
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
