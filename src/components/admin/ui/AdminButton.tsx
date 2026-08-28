// src/components/admin/ui/AdminButton.tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

type AdminButtonVariant = 'primary' | 'outline'
type AdminButtonSize = 'md' | 'sm'

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant
  size?: AdminButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<AdminButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#a394ff] to-[#8274d6] text-white font-bold hover:brightness-105',
  outline:
    'border border-white/10 bg-white/5 font-semibold text-white hover:bg-white/[0.07]',
}

const sizeClasses: Record<AdminButtonSize, string> = {
  md: 'rounded-2xl px-4 py-3.5 text-sm gap-2',
  sm: 'min-h-8 rounded-full px-3 py-1.5 text-xs gap-1.5',
}

export function AdminButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center',
        '[font-family:var(--admin-font-sans)]',
        'transition-[filter,background-color] disabled:cursor-not-allowed disabled:opacity-50',
        focusRingClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
