// src/components/cart/CartTrustBadges.tsx
import { BadgeCheck, Lock, RotateCcw, Shield, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/cn'

const cartBadges = [
  { icon: Shield, label: 'Secure payment SSL' },
  { icon: BadgeCheck, label: 'Authenticity guaranteed' },
  { icon: RotateCcw, label: '30 day easy returns' },
] as const

const paymentBadges = [
  { icon: Lock, label: 'SSL Encryption' },
  { icon: ShieldCheck, label: 'Trusted Payments' },
  { icon: BadgeCheck, label: 'Original Guarantee' },
] as const

interface CartTrustBadgesProps {
  className?: string
  variant?: 'cart' | 'payment'
}

export function CartTrustBadges({ className, variant = 'cart' }: CartTrustBadgesProps) {
  const badges = variant === 'payment' ? paymentBadges : cartBadges
  const itemClass = variant === 'payment' ? 'payment-trust-badge' : 'cart-trust-badge'

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
