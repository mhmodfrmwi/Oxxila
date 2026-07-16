// src/components/landing/footer/NewsletterForm.tsx
import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { gradientCtaClasses } from '../../ui/buttonStyles'
import { typeSmallClasses } from '../../ui/typography'
import { cn } from '../../../lib/cn'

/** No newsletter API endpoint — keep the UI visible but non-submitting. */
export function NewsletterForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 sm:mt-8" noValidate>
      <p className="text-sm text-secondary-text" role="status">
        {t('footer.newsletterUnavailable')}
      </p>

      <div>
        <label htmlFor="footer-newsletter-email" className="sr-only">
          {t('footer.newsletterEmail')}
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          value={email}
          placeholder={t('footer.newsletterPlaceholder')}
          disabled
          onChange={(e) => setEmail(e.target.value)}
          className={[
            'h-11 w-full rounded-full px-5 text-sm outline-none sm:h-14 sm:max-w-[419px]',
            'bg-card text-primary-text placeholder:text-placeholder-text',
            'border border-border-subtle',
            'cursor-not-allowed opacity-60',
          ].join(' ')}
        />
      </div>

      <motion.button
        type="submit"
        disabled
        className={cn(
          'flex h-11 w-full min-h-11 items-center justify-center gap-2 rounded-full px-8 text-on-emphasis sm:h-14 sm:w-auto',
          typeSmallClasses,
          gradientCtaClasses,
          'cursor-not-allowed opacity-60',
        )}
      >
        {t('footer.subscribe')}
      </motion.button>
    </form>
  )
}
