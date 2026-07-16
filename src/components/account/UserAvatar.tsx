// src/components/account/UserAvatar.tsx
import { User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { initialsFromName, normalizeAvatarUrl } from '../../utils/userAvatar'

interface UserAvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  alt?: string
  /** Show pulse skeleton while the canonical profile is still loading. */
  loading?: boolean
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

export function UserAvatar({
  name,
  src,
  size = 'md',
  className,
  alt,
  loading = false,
}: UserAvatarProps) {
  const resolvedSrc = normalizeAvatarUrl(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (failedSrc && failedSrc !== resolvedSrc) {
    setFailedSrc(null)
  }
  const initials = initialsFromName(name)
  const showImage = Boolean(resolvedSrc) && failedSrc !== resolvedSrc

  if (loading && !showImage) {
    return (
      <div
        className={cn(
          'shrink-0 animate-pulse rounded-full bg-surface-muted',
          sizeClasses[size],
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 text-accent',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!alt}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt ?? ''}
          className="h-full w-full object-cover"
          onError={() => {
            if (resolvedSrc) setFailedSrc(resolvedSrc)
          }}
        />
      ) : initials ? (
        <span className="font-semibold">{initials}</span>
      ) : (
        <User size={iconSizes[size]} aria-hidden />
      )}
    </div>
  )
}
