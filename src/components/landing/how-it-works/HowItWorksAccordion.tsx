// src/components/landing/how-it-works/HowItWorksAccordion.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import arrowDownIcon from '../../../assets/landing/home/arrow-down.svg'
import arrowUpIcon from '../../../assets/landing/home/arrow-up.svg'
import type { HowItWorksStepView } from '../../../hooks/useHowItWorksSettings'
import { cn } from '../../../lib/cn'
import { MaskIcon } from '../../ui/MaskIcon'

interface HowItWorksAccordionProps {
  steps: HowItWorksStepView[]
  openId: string
  onOpenChange: (id: string) => void
}

export function HowItWorksAccordion({ steps, openId, onOpenChange }: HowItWorksAccordionProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4" role="region" aria-label={t('home.howItWorks.stepsAria')}>
      {steps.map((step) => {
        const isOpen = openId === step.id
        const panelId = `how-it-works-panel-${step.id}`

        return (
          <div
            key={step.id}
            className={cn(
              'overflow-hidden rounded-[32px] border transition-colors duration-300 motion-reduce:transition-none lg:rounded-large',
              isOpen
                ? 'border-transparent bg-card'
                : 'border-border-interactive bg-background hover:border-button-primary',
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-button-primary sm:px-6 sm:py-5 lg:px-7 lg:py-6"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => onOpenChange(isOpen ? '' : step.id)}
            >
              <span className="min-w-0 font-display text-base leading-snug font-normal text-primary-text sm:text-[17px] lg:truncate lg:text-lg">
                {step.title}
              </span>
              <span
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-extra-large p-1.5 transition-colors duration-300 motion-reduce:transition-none',
                  isOpen ? 'bg-button-secondary text-icon-on-emphasis' : 'text-icon-primary',
                )}
                aria-hidden
              >
                <MaskIcon
                  src={isOpen ? arrowUpIcon : arrowDownIcon}
                  width={16}
                  height={8.6}
                  frame={28}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <p className="landing-type landing-fixed-text px-5 pb-5 text-secondary-text leading-relaxed! [--landing-size:0.875rem] sm:px-6 lg:px-7 lg:pb-6 lg:[--landing-size:1rem]">
                    {step.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
