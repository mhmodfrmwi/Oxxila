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
    <ul className={cn('mt-5 grid grid-cols-3 gap-3', className)}>
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className={itemClass}>
          <Icon size={18} strokeWidth={1.5} aria-hidden />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
