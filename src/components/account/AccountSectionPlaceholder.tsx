// src/components/account/AccountSectionPlaceholder.tsx
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
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
        <Link to={actionTo} className="mt-6">
          <Button variant="primary" pill>
            {t(actionLabelKey)}
          </Button>
        </Link>
      )}
    </div>
  )
}
