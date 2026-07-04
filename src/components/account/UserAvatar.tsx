// src/components/account/UserAvatar.tsx
import { User } from 'lucide-react'
import { cn } from '../../lib/cn'

interface UserAvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  alt?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-24 w-24 text-2xl sm:h-28 sm:w-28',
} as const

const iconSizes = {
  sm: 18,
  md: 28,
  lg: 40,
} as const

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function UserAvatar({
  name,
  src,
  size = 'md',
  className,
  alt,
}: UserAvatarProps) {
  const initials = initialsFromName(name)

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 text-accent',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!alt}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : initials ? (
        <span className="font-semibold">{initials}</span>
      ) : (
        <User size={iconSizes[size]} aria-hidden />
      )}
    </div>
  )
}
