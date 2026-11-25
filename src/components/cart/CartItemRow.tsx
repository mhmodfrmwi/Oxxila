// src/components/cart/CartItemRow.tsx
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PRODUCTS_PATH } from '../../config/routes'
import { cn } from '../../lib/cn'
import type { ApiCartItem } from '../../types/cart'
import { catalogDisplayName } from '../../utils/catalogDisplayName'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { PRODUCT_IMAGE_PLACEHOLDER, resolveProductImageUrl } from '../../utils/productImage'
import { focusRingClasses } from '../ui/interactionStyles'

interface CartItemRowProps {
  item: ApiCartItem
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  disabled?: boolean
  brand?: string | null
  variant?: string | null
}

/** Figma 587:24668 — checkbox · image · details (brand, name, price, delivery, stepper) · delete. */
export function CartItemRow({
  item,
  selected,
  onSelectedChange,
  onQuantityChange,
  onRemove,
  disabled,
  brand,
  variant,
}: CartItemRowProps) {
  const { t, i18n } = useTranslation()
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const firstImage = item.product.images?.[0]
  const imageSrc =
    failedImageUrl === firstImage ? PRODUCT_IMAGE_PLACEHOLDER : resolveProductImageUrl(firstImage)
  const name = catalogDisplayName(item.product, i18n.language, 'product')
  const href = item.product.slug ? `${PRODUCTS_PATH}/${item.product.slug}` : null

  const maxQuantity = Math.max(1, item.product.stock)
  const lineTotal = item.price * item.quantity

  return (
    <article className="cart-item-row" aria-label={name}>
      <input
        type="checkbox"
        className="cart-item-checkbox"
        checked={selected}
        onChange={(event) => onSelectedChange(event.target.checked)}
        aria-label={t('cart.selectItem', { name })}
      />

      <div className="cart-item-image-wrap">
        <img
          src={imageSrc}
          alt={name}
          className="cart-item-image"
          loading="lazy"
          onError={() => {
            if (failedImageUrl !== firstImage) setFailedImageUrl(firstImage ?? '')
          }}
        />
      </div>

      <div className="cart-item-details min-w-0">
        <div className="cart-item-info">
          {brand && <p className="cart-item-brand">{brand}</p>}
          <h3 className="cart-item-name">
            {href ? (
              <Link to={href} className={cn('rounded-sm', focusRingClasses)}>
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          {variant && <p className="cart-item-variant">{variant}</p>}
          <p className="cart-item-unit-price">{formatCartPrice(item.price, i18n.language)}</p>
        </div>

        <div className="cart-item-actions">
          <div className="cart-item-stepper" role="group" aria-label={t('cart.card.inCart', { count: item.quantity })}>
            <button
              type="button"
              className={cn('cart-item-stepper-btn', focusRingClasses)}
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              aria-label={t('cart.card.decrease')}
            >
              <Minus size={14} aria-hidden />
            </button>
            <span className="cart-item-stepper-value" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className={cn('cart-item-stepper-btn', focusRingClasses)}
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={disabled || item.quantity >= maxQuantity}
              aria-label={t('cart.card.increase')}
            >
              <Plus size={14} aria-hidden />
            </button>
          </div>
          {/* Line total is always shown so the row reads: item · qty · amount. */}
          <p className="cart-item-line-total" aria-label={t('cart.lineTotal')}>
            <span className="cart-item-line-total-value">{formatCartPrice(lineTotal, i18n.language)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        className={cn('cart-item-remove', focusRingClasses)}
        onClick={onRemove}
        disabled={disabled}
        aria-label={t('cart.removeItem', { name })}
      >
        <Trash2 size={20} strokeWidth={1.6} aria-hidden />
      </button>
    </article>
  )
}
