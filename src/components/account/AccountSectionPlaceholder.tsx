// src/components/account/AccountSectionPlaceholder.tsx
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import { Heading } from '../ui/Heading'

interface AccountSectionPlaceholderProps {
  titleKey: string
  descriptionKey: string
  actionLabelKey?: string
  actionTo?: string
}

export function AccountSectionPlaceholder({
  titleKey,
  descriptionKey,
  actionLabelKey,
  actionTo,
}: AccountSectionPlaceholderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[16rem] flex-col items-start justify-center">
      <Heading variant="page">{t(titleKey)}</Heading>
      <p className="mt-3 max-w-lg text-sm text-secondary-text sm:text-base">
        {t(descriptionKey)}
      </p>
      {actionLabelKey && actionTo && (
        <Link
          to={actionTo}
          className={cn(
            'mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-button-primary px-6 py-3',
            'text-sm font-medium text-on-emphasis hover:bg-button-primary-hover',
            focusRingClasses,
          )}
        >
          {t(actionLabelKey)}
        </Link>
      )}
    </div>
  )
}
