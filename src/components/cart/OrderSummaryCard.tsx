// src/components/cart/OrderSummaryCard.tsx
import { Check, ChevronRight, Ticket, Truck, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { ApiError } from '../../lib/api'
import type { ApiCart, ApiCartItem } from '../../types/cart'
import { catalogDisplayName } from '../../utils/catalogDisplayName'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { PRODUCT_IMAGE_PLACEHOLDER, resolveProductImageUrl } from '../../utils/productImage'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { CartTrustBadges } from './CartTrustBadges'

interface OrderSummaryCardProps {
  cart: ApiCart
  /** When set, shows a Shipping row. Does not alter cart fields. */
  shippingPrice?: number | null
  /**
   * Payable total to display. Defaults to `cart.totalPrice`.
   * Callers pass a value already available on the frontend (e.g. order.totalPrice,
   * or cart.totalPrice + resolved shipping) — never invent a different formula here.
   */
  totalPrice?: number
  couponLoading?: boolean
  checkoutDisabled?: boolean
  onApplyCoupon: (code: string) => Promise<void>
  onRemoveCoupon: () => Promise<void>
  className?: string
  mode?: 'cart' | 'review' | 'confirmation'
  title?: string
  ctaLabel?: string
  onCtaClick?: () => void
  ctaDisabled?: boolean
  showPromo?: boolean
  /** Code a guest entered; it is applied automatically after sign-in. */
  pendingCoupon?: string | null
  /** Replaces the default "saved" note under the promo field (e.g. how much it saves). */
  couponNote?: string | null
  /** Percent off shown next to the discount row, e.g. 10 → "Discount (10%)". */
  discountPercent?: number | null
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
  const { t, i18n } = useTranslation()
  const name = catalogDisplayName(item.product, i18n.language, 'product')
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
        <p className="payment-review-item-name">{name}</p>
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
  shippingPrice,
  totalPrice,
  couponLoading,
  checkoutDisabled,
  onApplyCoupon,
  onRemoveCoupon,
  className,
  mode = 'cart',
  title,
  ctaLabel,
  onCtaClick,
  ctaDisabled,
  showPromo,
  pendingCoupon = null,
  couponNote = null,
  discountPercent = null,
  showTrustBadges = true,
  trustBadgeVariant = 'cart',
  footerNote,
  showCta,
  totalLabel,
}: OrderSummaryCardProps) {
  const { t } = useTranslation()
  const [promoDraft, setPromoDraft] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const promoCode = cart.couponCode ?? pendingCoupon ?? promoDraft
  const hasCoupon = Boolean(cart.couponCode || pendingCoupon)
  // Applied (signed-in) coupons carry their value in the cart; guest previews pass it in.
  const percentOff =
    discountPercent ?? (cart.couponCode && cart.discountType === 'percentage' ? cart.discountValue : null)
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
  const showShipping = typeof shippingPrice === 'number'

  // Display backend/cart values as provided; optional totalPrice is caller-supplied.
  const subtotal = cart.subtotal
  const discountAmount = cart.discountAmount ?? 0
  const returnCredit = cart.storeCreditApplied ?? 0
  const total = totalPrice ?? cart.totalPrice

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

      {/* Figma 2804:23267 — available return/store credit banner (cart step only). */}
      {!isReview && !isConfirmation && (cart.storeCreditBalance ?? 0) > 0 && (
        <p className="cart-credit-banner mb-5">
          <Truck size={20} aria-hidden className="shrink-0" />
          <span>
            {t('cart.summary.creditAvailable', {
              amount: formatCartPrice(cart.storeCreditBalance),
            })}
          </span>
        </p>
      )}

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
          label={
            !isReview && !isConfirmation
              ? `${t('cart.summary.subtotal')} · ${t('cart.itemCount', { count: cart.items.reduce((n, i) => n + i.quantity, 0) })}`
              : t('cart.summary.subtotal')
          }
          value={formatCartPrice(subtotal)}
        />
        {discountAmount > 0 && (
          <SummaryRow
            label={
              percentOff ? `${t('cart.summary.discount')} (${percentOff}%)` : t('cart.summary.discount')
            }
            value={`-${formatCartPrice(discountAmount)}`}
            valueClassName="text-support-success"
          />
        )}
        {returnCredit > 0 && (
          <SummaryRow
            label={t('cart.summary.returnCredit')}
            value={`-${formatCartPrice(returnCredit)}`}
            valueClassName="text-support-success"
          />
        )}
        {showShipping && (
          <SummaryRow
            label={t('cart.summary.shipping')}
            value={
              shippingPrice > 0
                ? formatCartPrice(shippingPrice)
                : t('cart.summary.free')
            }
          />
        )}
      </div>

      {resolvedShowPromo && (
        <div className="mt-5">
          {hasCoupon ? (
            // Applied/saved code → a "coupon ticket": percent badge, code, savings, remove.
            <div className="cart-coupon-ticket" data-pending={pendingCoupon ? 'true' : 'false'}>
              <div className="cart-coupon-ticket-badge" aria-hidden>
                {percentOff ? (
                  <>
                    <span className="cart-coupon-ticket-percent">{percentOff}%</span>
                    <span className="cart-coupon-ticket-off">{t('cart.summary.off')}</span>
                  </>
                ) : (
                  <Ticket size={26} strokeWidth={1.6} />
                )}
              </div>
              <div className="cart-coupon-ticket-body">
                <span className="cart-coupon-ticket-label">
                  <Check size={13} strokeWidth={3} aria-hidden />
                  {t('cart.summary.couponApplied')}
                </span>
                <span className="cart-coupon-ticket-code" dir="ltr">
                  {promoCode}
                </span>
                {discountAmount > 0 && (
                  <span className="cart-coupon-ticket-saving">
                    {t('cart.summary.youSave', { amount: formatCartPrice(discountAmount) })}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="cart-coupon-ticket-remove"
                onClick={() => void handleRemoveCoupon()}
                disabled={couponLoading}
                aria-label={t('cart.summary.remove')}
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          ) : (
            <>
              <label htmlFor="cart-promo-code" className="sr-only">
                {t('cart.summary.promoCode')}
              </label>
              <div className="cart-promo-field">
                <Ticket size={18} aria-hidden className="shrink-0 text-secondary-text" />
                <input
                  id="cart-promo-code"
                  type="text"
                  value={promoCode}
                  onChange={(event) => setPromoDraft(event.target.value)}
                  placeholder={t('cart.summary.promoPlaceholder')}
                  className="cart-promo-input"
                  disabled={couponLoading}
                />
                <button
                  type="button"
                  className="cart-promo-apply"
                  onClick={() => void handleApplyCoupon()}
                  disabled={couponLoading || !promoCode.trim()}
                >
                  {t('cart.summary.apply')}
                </button>
              </div>
            </>
          )}
          {pendingCoupon && (
            <p className="mt-2 text-xs leading-5 text-secondary-text">
              {couponNote ?? t('cart.summary.couponPending')}
            </p>
          )}
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
        <span className="cart-summary-total-value">{formatCartPrice(total)}</span>
      </div>

      {showCheckoutButton && (
        <Button
          type="button"
          variant="primary"
          fullWidth
          pill
          className={cn(isReview ? 'payment-pay-btn' : 'cart-checkout-btn', 'mt-5')}
          disabled={buttonDisabled}
          onClick={onCtaClick}
        >
          {buttonLabel}
          {isReview && (
            <ChevronRight
              size={18}
              strokeWidth={2}
              aria-hidden
              className="rtl:-scale-x-100"
            />
          )}
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
