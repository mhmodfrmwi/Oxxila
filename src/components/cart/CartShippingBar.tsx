// src/components/cart/CartShippingBar.tsx
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ADD_ADDRESS_PATH } from '../../config/routes'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import type { UserAddress } from '../../api/users'
import { formatAddressOneLine } from '../../utils/userAddress'

interface CartShippingBarProps {
  address: UserAddress | null
  loading?: boolean
  className?: string
}

export function CartShippingBar({ address, loading, className }: CartShippingBarProps) {
  const { t } = useTranslation()
  const displayAddress = address
    ? formatAddressOneLine(address)
    : t('cart.shipping.addAddress')

  return (
    <div className={cn('cart-shipping-bar', className)}>
      <p className="text-sm text-secondary-text">
        {loading ? (
          <span
            className="inline-block h-4 w-64 animate-pulse rounded bg-surface-muted"
            aria-hidden
          />
        ) : (
          <>
            {t('cart.shipping.to')} &lsquo;
            <span className="text-primary-text">{displayAddress}</span>
            &rsquo;
          </>
        )}
      </p>
      <Link
        to={ADD_ADDRESS_PATH}
        className={cn(
          'text-sm font-medium text-link underline underline-offset-2',
          'hover:text-link-hover',
          focusRingClasses,
          'rounded-sm',
          loading && 'pointer-events-none opacity-50',
        )}
        aria-disabled={loading}
      >
        {t('cart.shipping.changeAddress')}
      </Link>
    </div>
  )
}
