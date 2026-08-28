// src/components/admin/layout/AdminLogoutButton.tsx
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { LOGIN_PATH } from '../../../config/routes'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface AdminLogoutButtonProps {
  className?: string
  /** Compact text-only control for the mobile admin header. */
  compact?: boolean
}

export function AdminLogoutButton({
  className,
  compact = false,
}: AdminLogoutButtonProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const toast = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      await logout()
      toast.success(t('nav.logOut'))
      navigate(LOGIN_PATH, { replace: true })
    } catch {
      toast.error(t('admin.nav.logoutFailed'))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loggingOut}
      aria-busy={loggingOut}
      aria-label={loggingOut ? t('nav.loggingOut') : t('admin.nav.logout')}
      className={cn(
        focusRingClasses,
        loggingOut && 'pointer-events-none opacity-60',
        compact
          ? cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5',
              'text-xs font-medium text-white/60',
              'hover:bg-white/5 hover:text-white/80',
            )
          : cn(
              'flex w-full items-center gap-3 rounded-xl px-4 py-2.5',
              'text-base font-normal leading-6 text-white/60',
              'transition-colors hover:bg-support-error/10 hover:text-support-error',
            ),
        className,
      )}
    >
      <LogOut size={compact ? 14 : 16} aria-hidden />
      <span className={cn(!compact && 'min-w-0 flex-1 text-start')}>
        {loggingOut ? t('nav.loggingOut') : t('admin.nav.logout')}
      </span>
    </button>
  )
}
