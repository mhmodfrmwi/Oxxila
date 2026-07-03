// src/components/cart/CartShippingBar.tsx
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import type { UserAddress } from '../../api/users'

interface CartShippingBarProps {
  address: UserAddress | null
  loading?: boolean
  className?: string
}

function formatAddress(address: UserAddress) {
  return `${address.address}, ${address.city}`
}

export function CartShippingBar({ address, loading, className }: CartShippingBarProps) {
  const displayAddress = address ? formatAddress(address) : 'Add a shipping address in account settings'

  return (
    <div className={cn('cart-shipping-bar', className)}>
      <p className="text-sm text-secondary-text">
        {loading ? (
          <span className="inline-block h-4 w-64 animate-pulse rounded bg-surface-muted" aria-hidden />
        ) : (
          <>
            Shipping to &lsquo;<span className="text-primary-text">{displayAddress}</span>&rsquo;
          </>
        )}
      </p>
      <button
        type="button"
        className={cn(
          'text-sm font-medium text-link underline underline-offset-2',
          'hover:text-link-hover',
          focusRingClasses,
          'rounded-sm',
        )}
        disabled={loading}
      >
        Change address
      </button>
    </div>
  )
}
