import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type StrengthLevel = 'weak' | 'medium' | 'strong'

interface PasswordStrengthProps {
  password: string
}

function getStrengthLevel(password: string): { level: StrengthLevel; filled: number } {
  if (!password) {
    return { level: 'weak', filled: 0 }
  }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) {
    return { level: 'weak', filled: 1 }
  }
  if (score <= 3) {
    return { level: 'medium', filled: 2 }
  }
  return { level: 'strong', filled: 4 }
}

const barColors = ['bg-support-error', 'bg-support-warning', 'bg-support-success', 'bg-support-success']

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation()
  const { level, filled } = getStrengthLevel(password)

  const message = !password
    ? t('auth.passwordStrength.enterPassword')
    : t(`auth.passwordStrength.${level}`)

  return (
    <div className="space-y-2" aria-live="polite">
      <div
        className="flex gap-1.5"
        role="meter"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label={t('auth.passwordStrength.ariaLabel')}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors',
              i < filled ? barColors[Math.min(filled - 1, 3)] : 'bg-border-subtle',
            ].join(' ')}
          />
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-secondary-text">
        <Info size={14} aria-hidden />
        {message}
      </p>
    </div>
  )
}
