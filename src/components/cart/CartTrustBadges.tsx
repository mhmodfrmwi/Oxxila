// src/components/cart/CartTrustBadges.tsx
import { BadgeCheck, RotateCcw, Shield, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'

interface CartTrustBadgesProps {
  className?: string
  variant?: 'cart' | 'payment'
}

export function CartTrustBadges({ className, variant = 'cart' }: CartTrustBadgesProps) {
  const { t } = useTranslation()
  const itemClass = variant === 'payment' ? 'payment-trust-badge' : 'cart-trust-badge'

  const badges =
    variant === 'payment'
      ? [
          { icon: Shield, label: t('cart.trust.sslEncryption') },
          { icon: ShieldCheck, label: t('cart.trust.trustedPayments') },
          { icon: BadgeCheck, label: t('cart.trust.originalGuarantee') },
        ]
      : [
          { icon: Shield, label: t('cart.trust.securePayment') },
          { icon: BadgeCheck, label: t('cart.trust.authenticity') },
          { icon: RotateCcw, label: t('cart.trust.easyReturns') },
        ]

  return (
    // Figma 2804:23279 — stacked rows, icon in a filled secondary circle.
    <ul className={cn('mt-6 flex flex-col gap-4', className)}>
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className={itemClass}>
          <span className="cart-trust-badge-icon" aria-hidden>
            <Icon size={14} strokeWidth={2} />
          </span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
