import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  showPasswordToggle?: boolean
}

export function InputField({
  label,
  id: externalId,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props
}: InputFieldProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(false)

  const isPassword = type === 'password' || showPasswordToggle
  const inputType = isPassword && showPasswordToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={[
          'text-sm font-medium',
          isDark ? 'text-text-primary-dark' : 'text-text-primary-light',
        ].join(' ')}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={[
            'w-full rounded-xl px-4 py-3.5 text-base',
            'focus:outline-none focus:ring-2 focus:ring-oxxila-accent/50',
            isDark
              ? 'bg-input-dark text-text-primary-dark placeholder:text-text-secondary-dark'
              : 'bg-input-light text-text-primary-light placeholder:text-text-secondary-light',
            showPasswordToggle ? 'pr-11' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}
