// src/components/ui/TextAreaField.tsx
import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextAreaField({
  label,
  id: externalId,
  className = '',
  error,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const errorId = useId()
  const id = externalId ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-serif text-sm font-medium text-primary-text">
        {label}
      </label>
      <textarea
        id={id}
        className={cn(
          'min-h-[7.5rem] w-full resize-y rounded-xl px-4 py-3.5 text-base',
          'bg-card text-primary-text placeholder:text-placeholder-text',
          'border border-border-subtle',
          'focus:outline-none focus:ring-2 focus:ring-button-primary/50',
          error && 'border-support-error focus:ring-support-error/40',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
