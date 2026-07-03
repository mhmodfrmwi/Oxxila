// src/components/ui/SelectField.tsx
import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function SelectField({
  label,
  id: externalId,
  className = '',
  error,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const errorId = useId()
  const id = externalId ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-serif text-sm font-medium text-primary-text">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={cn(
            'w-full appearance-none rounded-xl px-4 py-3.5 pr-11 text-base',
            'bg-card text-primary-text',
            'border border-border-subtle',
            'focus:outline-none focus:ring-2 focus:ring-button-primary/50',
            error && 'border-support-error focus:ring-support-error/40',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text"
          aria-hidden
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
