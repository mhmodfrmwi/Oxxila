// src/components/admin/ui/AdminInitialsAvatar.tsx
import { cn } from '../../../lib/cn'

interface AdminInitialsAvatarProps {
  initials: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-[8px]',
  md: 'size-10 text-[10px]',
} as const

export function AdminInitialsAvatar({
  initials,
  size = 'sm',
  className,
}: AdminInitialsAvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-[rgb(97_95_255_/_0.2)] font-bold text-[#a3b3ff]',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
