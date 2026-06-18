import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'social' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  fullWidth?: boolean
  pill?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-oxxila-accent text-white hover:bg-oxxila-purple-light focus-visible:ring-oxxila-accent',
  social:
    'bg-input-light text-text-primary-light border border-border-light hover:bg-oxxila-purple/10 dark:bg-input-dark dark:text-text-primary-dark dark:border-border-dark dark:hover:bg-oxxila-purple/20',
  ghost:
    'bg-transparent text-oxxila-accent hover:text-oxxila-purple-light focus-visible:ring-oxxila-accent',
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
      className={[
        'inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3',
        'text-base font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        pill ? 'rounded-full' : 'rounded-button',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
