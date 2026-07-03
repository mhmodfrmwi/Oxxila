// src/components/cart/CartTrustBadges.tsx
import { BadgeCheck, RotateCcw, Shield } from 'lucide-react'
import { cn } from '../../lib/cn'

const badges = [
  { icon: Shield, label: 'Secure payment SSL' },
  { icon: BadgeCheck, label: 'Authenticity guaranteed' },
  { icon: RotateCcw, label: '30 day easy returns' },
] as const

interface CartTrustBadgesProps {
  className?: string
}

export function CartTrustBadges({ className }: CartTrustBadgesProps) {
  return (
    <ul className={cn('mt-5 grid grid-cols-3 gap-3', className)}>
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className="cart-trust-badge">
          <Icon size={18} strokeWidth={1.5} aria-hidden />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
