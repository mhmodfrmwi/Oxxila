import { Info } from 'lucide-react'

type StrengthLevel = 'weak' | 'medium' | 'strong'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): { level: StrengthLevel; filled: number; message: string } {
  if (!password) {
    return { level: 'weak', filled: 0, message: 'Enter a password to check strength.' }
  }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) {
    return { level: 'weak', filled: 1, message: 'Weak password. Use at least 8 characters.' }
  }
  if (score <= 3) {
    return {
      level: 'medium',
      filled: 2,
      message: 'Medium strength. Add a number and special character.',
    }
  }
  return { level: 'strong', filled: 4, message: 'Strong password.' }
}

const barColors = ['bg-support-error', 'bg-support-warning', 'bg-support-success', 'bg-support-success']

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { filled, message } = getStrength(password)

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1.5" role="meter" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
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
