// src/components/admin/layout/AdminBrandLogo.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ADMIN_PATH } from '../../../config/routes'
import logoMark from '../../../assets/admin/oxilla-logo-mark.svg'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface AdminBrandLogoProps {
  className?: string
  /** Show the “Cosmetics Store” subtitle under the wordmark. */
  showSubtitle?: boolean
}

/**
 * Admin sidebar brand lockup — Figma Component 50 header.
 * Mark 24.615×25.385, wordmark Poppins Bold 32px, gap 4.615px.
 */
export function AdminBrandLogo({
  className,
  showSubtitle = true,
}: AdminBrandLogoProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Link
        to={ADMIN_PATH}
        className={cn('inline-flex items-center gap-[3.692px]', focusRingClasses, 'rounded-sm')}
        aria-label={t('admin.brand.homeAria')}
      >
        <img
          src={logoMark}
          alt=""
          width={20}
          height={20}
          className="h-[20.308px] w-[19.692px] shrink-0 object-contain"
          aria-hidden
        />
        <span className="whitespace-nowrap font-[family-name:var(--admin-font-brand)] text-[25.6px] font-bold leading-[11.077px]">
          <span className="text-[#9179d2]">O</span>
          <span className="text-[#c0b5de]">xxila</span>
        </span>
      </Link>
      {showSubtitle ? (
        <p className="text-xs leading-4 tracking-[0.2em] text-white/40 uppercase">
          {t('admin.brand.subtitle')}
        </p>
      ) : null}
    </div>
  )
}
