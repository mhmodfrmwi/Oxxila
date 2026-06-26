import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { gradientCtaClasses } from './buttonStyles'
import { typeSmallClasses } from './typography'

type ButtonVariant = 'primary' | 'gradient' | 'outline' | 'social' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  fullWidth?: boolean
  pill?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-button-primary text-on-emphasis hover:bg-button-primary-hover focus-visible:ring-button-primary',
  gradient: cn(gradientCtaClasses, 'text-on-emphasis focus-visible:ring-button-primary'),
  outline:
    'border-2 border-button-primary bg-card text-button-primary hover:bg-button-primary-hover/40 focus-visible:ring-button-primary',
  social:
    'bg-input text-primary-text border border-border-subtle hover:bg-accent/10',
  ghost:
    'bg-transparent text-link hover:text-link-hover focus-visible:ring-link',
}

export function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  pill = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3',
        typeSmallClasses,
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        pill ? 'rounded-full' : 'rounded-button',
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
