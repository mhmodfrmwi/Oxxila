// src/components/cart/OrderSummaryCard.tsx
import { ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { ApiError } from '../../lib/api'
import type { ApiCart, ApiCartItem } from '../../types/cart'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { PRODUCT_IMAGE_PLACEHOLDER, resolveProductImageUrl } from '../../utils/productImage'
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
  mode?: 'cart' | 'review' | 'confirmation'
  title?: string
  shippingAmount?: number
  shippingCompareAt?: number | null
  estimatedTax?: number
  totalCompareAt?: number | null
  ctaLabel?: string
  onCtaClick?: () => void
  ctaDisabled?: boolean
  showPromo?: boolean
  showTrustBadges?: boolean
  trustBadgeVariant?: 'cart' | 'payment'
  footerNote?: string
  showCta?: boolean
  totalLabel?: string
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

function OrderReviewItem({ item }: { item: ApiCartItem }) {
  const { t } = useTranslation()
  const imageSrc = resolveProductImageUrl(item.product.images[0]) ?? PRODUCT_IMAGE_PLACEHOLDER
  const lineTotal = item.price * item.quantity

  return (
    <li className="payment-review-item">
      <img
        src={imageSrc}
        alt=""
        className="payment-review-item-image"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
        }}
      />
      <div className="min-w-0">
        <p className="payment-review-item-name">{item.product.name}</p>
        <p className="payment-review-item-qty">
          {t('cart.summary.qty', { count: item.quantity })}
        </p>
      </div>
      <span className="payment-review-item-price">{formatCartPrice(lineTotal)}</span>
    </li>
  )
}

export function OrderSummaryCard({
  cart,
  couponLoading,
  checkoutDisabled,
  onApplyCoupon,
  onRemoveCoupon,
  className,
  mode = 'cart',
  title,
  shippingAmount,
  shippingCompareAt = null,
  estimatedTax = 0,
  totalCompareAt = null,
  ctaLabel,
  onCtaClick,
  ctaDisabled,
  showPromo,
  showTrustBadges = true,
  trustBadgeVariant = 'cart',
  footerNote,
  showCta,
  totalLabel,
}: OrderSummaryCardProps) {
  const { t } = useTranslation()
  const [promoDraft, setPromoDraft] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const promoCode = cart.couponCode ?? promoDraft
  const isReview = mode === 'review'
  const isConfirmation = mode === 'confirmation'
  const resolvedTitle =
    title ??
    (isReview && !isConfirmation
      ? t('cart.summary.reviewTitle')
      : t('cart.summary.title'))
  const resolvedTotalLabel = totalLabel ?? t('cart.summary.total')
  const resolvedShowPromo = showPromo ?? (!isReview && !isConfirmation)
  const showLineItems = isReview || isConfirmation
  const showCheckoutButton = showCta ?? !isConfirmation
  const resolvedShippingAmount = shippingAmount ?? 0
  const shippingIsFree = resolvedShippingAmount === 0
  const resolvedTotal = isConfirmation
    ? cart.totalPrice
    : cart.totalPrice + resolvedShippingAmount
  const resolvedTotalCompareAt =
    totalCompareAt ?? (shippingCompareAt ? cart.subtotal + shippingCompareAt : null)

  async function handleApplyCoupon() {
    const code = promoDraft.trim()
    if (!code) return

    setPromoError(null)
    try {
      await onApplyCoupon(code)
    } catch (error) {
      setPromoError(
        error instanceof ApiError ? error.message : t('cart.summary.applyError'),
      )
    }
  }

  async function handleRemoveCoupon() {
    setPromoError(null)
    try {
      await onRemoveCoupon()
      setPromoDraft('')
    } catch (error) {
      setPromoError(
        error instanceof ApiError ? error.message : t('cart.summary.removeError'),
      )
    }
  }

  const defaultCtaLabel = isReview
    ? t('cart.summary.payNow')
    : t('cart.summary.proceedToCheckout')
  const buttonLabel = ctaLabel ?? defaultCtaLabel
  const buttonDisabled = ctaDisabled ?? checkoutDisabled ?? cart.items.length === 0

  return (
    <aside
      className={cn('cart-summary-card lg:sticky lg:top-6', className)}
      aria-label={resolvedTitle}
    >
      <Heading
        variant="card"
        as="h2"
        className={cn('font-serif', isReview ? 'payment-order-summary-title' : 'mb-5')}
      >
        {resolvedTitle}
      </Heading>

      {showLineItems && cart.items.length > 0 && (
        <ul
          className={cn(isReview ? 'payment-order-items' : 'mb-5')}
          aria-label={t('cart.summary.orderItems')}
        >
          {cart.items.map((item) => (
            <OrderReviewItem key={item._id} item={item} />
          ))}
        </ul>
      )}

      <div className={cn(isReview ? 'payment-order-summary-rows' : 'space-y-3')}>
        <SummaryRow
          label={t('cart.summary.subtotal')}
          value={formatCartPrice(cart.subtotal)}
        />

        {cart.discountAmount > 0 && (
          <SummaryRow
            label={t('cart.summary.discount')}
            value={`-${formatCartPrice(cart.discountAmount)}`}
            valueClassName="text-support-success"
          />
        )}

        <SummaryRow
          label={t('cart.summary.shipping')}
          value={
            <span className="inline-flex items-center gap-2">
              {shippingIsFree && (
                <span className="text-support-success">{t('cart.summary.free')}</span>
              )}
              {shippingCompareAt != null && shippingCompareAt > 0 && (
                <span className="payment-summary-strike">
                  {formatCartPrice(shippingCompareAt)}
                </span>
              )}
              {!shippingIsFree && (
                <span>{formatCartPrice(resolvedShippingAmount)}</span>
              )}
            </span>
          }
        />

        <SummaryRow
          label={t('cart.summary.estimatedTax')}
          value={formatCartPrice(estimatedTax)}
        />

        {cart.storeCreditApplied > 0 && (
          <SummaryRow
            label={t('cart.summary.storeCredit')}
            value={`-${formatCartPrice(cart.storeCreditApplied)}`}
            valueClassName="text-support-success"
          />
        )}
      </div>

      {resolvedShowPromo && (
        <div className="mt-5">
          <label htmlFor="cart-promo-code" className="sr-only">
            {t('cart.summary.promoCode')}
          </label>
          <div className="cart-promo-field">
            <input
              id="cart-promo-code"
              type="text"
              value={promoCode}
              onChange={(event) => setPromoDraft(event.target.value)}
              placeholder={t('cart.summary.promoPlaceholder')}
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
                {t('cart.summary.remove')}
              </button>
            ) : (
              <button
                type="button"
                className="cart-promo-apply"
                onClick={() => void handleApplyCoupon()}
                disabled={couponLoading || !promoCode.trim()}
              >
                {t('cart.summary.apply')}
              </button>
            )}
          </div>
          {promoError && (
            <p className="mt-2 text-xs text-support-error" role="alert">
              {promoError}
            </p>
          )}
        </div>
      )}

      <div className="cart-summary-divider" />

      <div className={cn('cart-summary-total', isReview && 'payment-order-summary-total')}>
        <span className="cart-summary-total-label">{resolvedTotalLabel}</span>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="cart-summary-total-value">{formatCartPrice(resolvedTotal)}</span>
          {resolvedTotalCompareAt != null && resolvedTotalCompareAt > resolvedTotal && (
            <span className="payment-summary-strike">
              {formatCartPrice(resolvedTotalCompareAt)}
            </span>
          )}
        </span>
      </div>

      {showCheckoutButton && (
        <Button
          type="button"
          variant="primary"
          fullWidth
          pill={isReview}
          className={cn(isReview ? 'payment-pay-btn' : 'cart-checkout-btn', 'mt-5')}
          disabled={buttonDisabled}
          onClick={onCtaClick}
        >
          {buttonLabel}
          {isReview && <ChevronRight size={18} strokeWidth={2} aria-hidden className="rtl:-scale-x-100" />}
        </Button>
      )}

      {showTrustBadges && (
        <CartTrustBadges
          variant={trustBadgeVariant}
          className={isReview ? 'payment-order-trust-badges' : undefined}
        />
      )}

      {footerNote && <p className="payment-security-note">{footerNote}</p>}
    </aside>
  )
}
