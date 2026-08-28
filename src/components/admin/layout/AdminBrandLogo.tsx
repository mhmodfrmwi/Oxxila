// src/components/admin/layout/AdminBrandLogo.tsx
import { useTranslation } from 'react-i18next'
import { ADMIN_PATH } from '../../../config/routes'
import { cn } from '../../../lib/cn'
import { Logo } from '../../ui/Logo'

interface AdminBrandLogoProps {
  className?: string
  /** Show the “Cosmetics Store” subtitle under the wordmark. */
  showSubtitle?: boolean
}

export function AdminBrandLogo({
  className,
  showSubtitle = true,
}: AdminBrandLogoProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Logo linkTo={ADMIN_PATH} />
      {showSubtitle ? (
        <p className="text-xs leading-4 tracking-[0.2em] text-white/40 uppercase">
          {t('admin.brand.subtitle')}
        </p>
      ) : null}
    </div>
  )
}
