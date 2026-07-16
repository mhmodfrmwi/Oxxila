// src/components/cart/CartItemRow.tsx
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import type { ApiCartItem } from '../../types/cart'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { PRODUCT_IMAGE_PLACEHOLDER, resolveProductImageUrl } from '../../utils/productImage'
import { QuantitySelector } from '../product/QuantitySelector'
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
  const { t } = useTranslation()
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageSrc =
    failedImageUrl === item.product.images[0]
      ? PRODUCT_IMAGE_PLACEHOLDER
      : resolveProductImageUrl(item.product.images[0])

  const lineTotal = item.price * item.quantity
  const maxQuantity = Math.max(1, item.product.stock)

  return (
    <article className="cart-item-row" aria-label={item.product.name}>
      <input
        type="checkbox"
        className="cart-item-checkbox"
        checked={selected}
        onChange={(event) => onSelectedChange(event.target.checked)}
        aria-label={t('cart.selectItem', { name: item.product.name })}
      />

      <div className="cart-item-image-wrap">
        <img
          src={imageSrc}
          alt={item.product.name}
          className="cart-item-image"
          loading="lazy"
          onError={() => {
            if (failedImageUrl !== item.product.images[0]) {
              setFailedImageUrl(item.product.images[0] ?? '')
            }
          }}
        />
      </div>

      <div className="cart-item-details min-w-0">
        {brand && <p className="cart-item-brand">{brand}</p>}
        <h3 className="cart-item-name">{item.product.name}</h3>
        {variant && <p className="cart-item-variant">{variant}</p>}
        <p className="cart-item-unit-price">{formatCartPrice(item.price)}</p>
        <p className="cart-item-delivery">{t('cart.freeDelivery')}</p>

        <div className="cart-item-actions">
          <QuantitySelector
            value={item.quantity}
            min={1}
            max={maxQuantity}
            onChange={onQuantityChange}
            disabled={disabled}
            className="cart-item-qty"
          />
          <p className="cart-item-line-total">
            <span className="cart-item-line-total-label">{t('cart.lineTotal')}</span>
            <span className="cart-item-line-total-value">{formatCartPrice(lineTotal)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        className={cn('cart-item-remove', focusRingClasses)}
        onClick={onRemove}
        disabled={disabled}
        aria-label={t('cart.removeItem', { name: item.product.name })}
      >
        <Trash2 size={18} strokeWidth={1.75} aria-hidden />
      </button>
    </article>
  )
}
