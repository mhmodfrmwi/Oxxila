// src/components/checkout/CheckoutStepper.tsx
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
  label: string
  path?: string
}

const steps: CheckoutStep[] = [
  { id: 'cart', label: 'Cart', path: CART_PATH },
  { id: 'address', label: 'Address', path: ADD_ADDRESS_PATH },
  { id: 'payment', label: 'Payment', path: PAYMENT_PATH },
  { id: 'confirmation', label: 'Confirmation' },
]

interface CheckoutStepperProps {
  currentStep: CheckoutStepId
  className?: string
}

export function CheckoutStepper({ currentStep, className }: CheckoutStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <nav className={cn('checkout-stepper', className)} aria-label="Checkout progress">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isComplete = index < currentIndex

        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 && <div className="checkout-stepper-divider" aria-hidden />}
            {isComplete && step.path ? (
              <Link
                to={step.path}
                className={cn(
                  'checkout-stepper-step checkout-stepper-step--complete',
                  focusRingClasses,
                  'rounded-sm',
                )}
              >
                <span className="checkout-stepper-index" aria-hidden>
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </Link>
            ) : (
              <div
                className={cn(
                  'checkout-stepper-step',
                  (isActive || isComplete) && 'checkout-stepper-step--active',
                  isComplete && 'checkout-stepper-step--complete',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="checkout-stepper-index" aria-hidden>
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
