// src/components/ui/InputField.tsx
import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  showPasswordToggle?: boolean
  error?: string
}

export function InputField({
  label,
  id: externalId,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  error,
  ...props
}: InputFieldProps) {
  const { t } = useTranslation()
  const generatedId = useId()
  const errorId = useId()
  const id = externalId ?? generatedId
  const [visible, setVisible] = useState(false)

  const isPassword = type === 'password' || showPasswordToggle
  const inputType = isPassword && showPasswordToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-primary-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={cn(
            'w-full rounded-xl px-4 py-3 text-base sm:py-3.5',
            'bg-input text-primary-text placeholder:text-placeholder-text',
            'focus:outline-none focus:ring-2 focus:ring-button-primary/50',
            showPasswordToggle && 'pe-11',
            error && 'border border-support-error focus:ring-support-error/40',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-secondary-text"
            aria-label={visible ? t('auth.fields.hidePassword') : t('auth.fields.showPassword')}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
