// src/components/ui/IconActionButton.tsx
import type { LucideIcon } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { cn } from '../../lib/cn'
import { focusRingClasses } from './interactionStyles'

interface IconActionButtonProps {
  icon: LucideIcon
  label: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  /** Fills the icon (e.g. active wishlist heart). */
  filled?: boolean
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
}

const iconSizes = {
  sm: 15,
  md: 16,
  lg: 18,
}

export function IconActionButton({
  icon: Icon,
  label,
  onClick,
  className,
  size = 'md',
  disabled = false,
  filled = false,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={filled ? true : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center rounded-full',
        'bg-button-primary text-on-emphasis shadow-md shadow-black/10',
        'transition-transform duration-200 [@media(hover:hover)]:hover:scale-110',
        'disabled:pointer-events-none disabled:opacity-60',
        sizeClasses[size],
        focusRingClasses,
        className,
      )}
    >
      <Icon
        size={iconSizes[size]}
        aria-hidden
        {...(filled ? { fill: 'currentColor' as const } : {})}
      />
    </button>
  )
}
