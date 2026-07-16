// src/components/returns/ReturnsStepper.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'

const STEPS = [
  { id: 'request', labelKey: 'returns.steps.request' },
  { id: 'approval', labelKey: 'returns.steps.approval' },
  { id: 'pickup', labelKey: 'returns.steps.pickup' },
  { id: 'refund', labelKey: 'returns.steps.refund' },
] as const

interface ReturnsStepperProps {
  currentStep?: (typeof STEPS)[number]['id']
  className?: string
}

export function ReturnsStepper({
  currentStep = 'request',
  className,
}: ReturnsStepperProps) {
  const { t } = useTranslation()
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep)
  const fillPercent =
    STEPS.length <= 1 ? 0 : Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)

  return (
    <nav className={cn('returns-stepper', className)} aria-label={t('returns.progress')}>
      <div className="returns-stepper-track" aria-hidden>
        <div className="returns-stepper-track-fill" style={{ width: `${fillPercent}%` }} />
      </div>

      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep
        const isComplete = index < currentIndex

        return (
          <div
            key={step.id}
            className={cn(
              'returns-stepper-step',
              isActive && 'returns-stepper-step--active',
              isComplete && 'returns-stepper-step--complete',
            )}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="returns-stepper-index" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="returns-stepper-label">{t(step.labelKey)}</span>
          </div>
        )
      })}
    </nav>
  )
}
