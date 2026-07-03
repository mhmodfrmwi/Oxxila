// src/components/cart/OrderSummaryCard.tsx
import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ApiError } from '../../lib/api'
import type { ApiCart } from '../../types/cart'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { CartTrustBadges } from './CartTrustBadges'

interface OrderSummaryCardProps {
  cart: ApiCart
  couponLoading?: boolean
  checkoutDisabled?: boolean
  onApplyCoupon: (code: string) => Promise<void>
  onRemoveCoupon: () => Promise<void>
  className?: string
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="cart-summary-row">
      <span>{label}</span>
      <span className={cn('cart-summary-row-value', valueClassName)}>{value}</span>
    </div>
  )
}

export function OrderSummaryCard({
  cart,
  couponLoading,
  checkoutDisabled,
  onApplyCoupon,
  onRemoveCoupon,
  className,
}: OrderSummaryCardProps) {
  const [promoDraft, setPromoDraft] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const promoCode = cart.couponCode ?? promoDraft

  async function handleApplyCoupon() {
    const code = promoDraft.trim()
    if (!code) return

    setPromoError(null)
    try {
      await onApplyCoupon(code)
    } catch (error) {
      setPromoError(error instanceof ApiError ? error.message : 'Could not apply coupon')
    }
  }

  async function handleRemoveCoupon() {
    setPromoError(null)
    try {
      await onRemoveCoupon()
      setPromoDraft('')
    } catch (error) {
      setPromoError(error instanceof ApiError ? error.message : 'Could not remove coupon')
    }
  }

  const estimatedTax = 0
  const shippingLabel = 'Free'

  return (
    <aside className={cn('cart-summary-card lg:sticky lg:top-6', className)} aria-label="Order summary">
      <Heading variant="card" as="h2" className="mb-5">
        Order Summary
      </Heading>

      <div className="space-y-3">
        <SummaryRow label="Subtotal" value={formatCartPrice(cart.subtotal)} />

        {cart.discountAmount > 0 && (
          <SummaryRow
            label="Discount"
            value={`-${formatCartPrice(cart.discountAmount)}`}
            valueClassName="text-support-success"
          />
        )}

        <SummaryRow
          label="Shipping"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="text-support-success">{shippingLabel}</span>
              <span>{formatCartPrice(0)}</span>
            </span>
          }
        />

        <SummaryRow label="Estimated Tax" value={formatCartPrice(estimatedTax)} />

        {cart.storeCreditApplied > 0 && (
          <SummaryRow
            label="Store credit"
            value={`-${formatCartPrice(cart.storeCreditApplied)}`}
            valueClassName="text-support-success"
          />
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="cart-promo-code" className="sr-only">
          Promo code
        </label>
        <div className="cart-promo-field">
          <input
            id="cart-promo-code"
            type="text"
            value={promoCode}
            onChange={(event) => setPromoDraft(event.target.value)}
            placeholder="Promo Code"
            className="cart-promo-input"
            disabled={couponLoading}
          />
          {cart.couponCode ? (
            <button
              type="button"
              className="cart-promo-apply"
              onClick={() => void handleRemoveCoupon()}
              disabled={couponLoading}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="cart-promo-apply"
              onClick={() => void handleApplyCoupon()}
              disabled={couponLoading || !promoCode.trim()}
            >
              Apply
            </button>
          )}
        </div>
        {promoError && (
          <p className="mt-2 text-xs text-support-error" role="alert">
            {promoError}
          </p>
        )}
      </div>

      <div className="cart-summary-divider" />

      <div className="cart-summary-total">
        <span className="cart-summary-total-label">Total</span>
        <span className="cart-summary-total-value">{formatCartPrice(cart.totalPrice)}</span>
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth
        className="cart-checkout-btn mt-5"
        disabled={checkoutDisabled || cart.items.length === 0}
      >
        Proceed to checkout
      </Button>

      <CartTrustBadges />
    </aside>
  )
}
