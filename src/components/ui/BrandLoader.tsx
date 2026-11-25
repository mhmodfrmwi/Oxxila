// src/components/ui/BrandLoader.tsx
import { useTranslation } from 'react-i18next'
import logoMark from '../../assets/oxxila-logo-mark.svg'
import { cn } from '../../lib/cn'

interface BrandLoaderProps {
  /** Optional status line under the mark (e.g. "Confirming your payment…"). */
  message?: string
  /** `page` fills the content area; `inline` is compact for sections/cards. */
  size?: 'page' | 'inline'
  className?: string
}

/**
 * Oxxila-branded loading state: the logo mark breathing inside a rotating
 * gradient ring. Honors prefers-reduced-motion (static mark + label).
 */
export function BrandLoader({ message, size = 'page', className }: BrandLoaderProps) {
  const { t } = useTranslation()
  // The animated dots replace any trailing ellipsis in the copy.
  const label = (message ?? t('common.loading', { defaultValue: 'Loading…' })).replace(/(…|\.{3})\s*$/, '')
  const isPage = size === 'page'

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        // Page loader: centred in the space below the header, scaled to the screen —
        // compact on phones, roomier on tablet/desktop.
        isPage
          ? 'min-h-[52svh] gap-4 px-6 py-10 sm:min-h-[58svh] sm:gap-5 lg:min-h-[62svh] lg:gap-6'
          : 'gap-3 py-8',
        className,
      )}
    >
      <div
        className={cn(
          'brand-loader',
          isPage ? 'size-[72px] sm:size-24 lg:size-28' : 'size-14',
        )}
        aria-hidden
      >
        <span className="brand-loader-ring" />
        <img src={logoMark} alt="" className="brand-loader-mark" draggable={false} />
      </div>
      <p
        className={cn(
          'text-secondary-text',
          isPage ? 'text-sm sm:text-base lg:text-lg' : 'text-sm',
        )}
      >
        {label}
        <span className="brand-loader-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </p>
    </div>
  )
}
