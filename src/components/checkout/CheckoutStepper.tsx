// src/components/checkout/CheckoutStepper.tsx
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ADD_ADDRESS_PATH,
  CART_PATH,
  PAYMENT_PATH,
} from '../../config/routes'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

export type CheckoutStepId = 'cart' | 'address' | 'payment' | 'confirmation'

interface CheckoutStep {
  id: CheckoutStepId
  labelKey: string
  path?: string
}

const steps: CheckoutStep[] = [
  { id: 'cart', labelKey: 'checkout.steps.cart', path: CART_PATH },
  { id: 'address', labelKey: 'checkout.steps.address', path: ADD_ADDRESS_PATH },
  { id: 'payment', labelKey: 'checkout.steps.payment', path: PAYMENT_PATH },
  { id: 'confirmation', labelKey: 'checkout.steps.confirmation' },
]

interface CheckoutStepperProps {
  currentStep: CheckoutStepId
  className?: string
}

export function CheckoutStepper({ currentStep, className }: CheckoutStepperProps) {
  const { t } = useTranslation()
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <nav className={cn('checkout-stepper', className)} aria-label={t('checkout.progress')}>
      <ol className="checkout-stepper-list">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isComplete = index < currentIndex
          const label = t(step.labelKey)
          const body = (
            <>
              <span className="checkout-stepper-index" aria-hidden>
                {isComplete ? <Check size={16} strokeWidth={2.75} /> : index + 1}
              </span>
              <span className="checkout-stepper-label">{label}</span>
            </>
          )

          return (
            <li
              key={step.id}
              className={cn(
                'checkout-stepper-item',
                isActive && 'checkout-stepper-item--active',
                isComplete && 'checkout-stepper-item--complete',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {isComplete && step.path ? (
                <Link
                  to={step.path}
                  className={cn('checkout-stepper-step', focusRingClasses, 'rounded-sm')}
                >
                  {body}
                </Link>
              ) : (
                <div className="checkout-stepper-step">{body}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
