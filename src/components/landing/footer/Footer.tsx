// src/components/landing/footer/Footer.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getCollectionHref } from '../../../config/collections'
import {
  DOCS_PATH,
  HOME_PATH,
  RETURNS_HISTORY_PATH,
  SHOP_PATH,
  TERMS_PATH,
} from '../../../config/routes'
import { FooterSettingsProvider } from '../../../context/FooterSettingsContext'
import { FadeUp } from '../../ui/FadeUp'
import { Logo } from '../../ui/Logo'
import { FooterLinks } from './FooterLinks'
import { InstagramGrid } from './InstagramGrid'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const { t } = useTranslation()

  const policyLinks = useMemo(
    () => [
      { label: t('footer.policyLinks.about'), to: DOCS_PATH },
      { label: t('footer.policyLinks.quality'), to: `${DOCS_PATH}#quality` },
      {
        label: t('footer.policyLinks.authenticity'),
        to: `${DOCS_PATH}#authenticity`,
      },
      {
        label: t('footer.policyLinks.standards'),
        to: `${DOCS_PATH}#medical`,
      },
      { label: t('footer.policyLinks.terms'), to: TERMS_PATH },
      {
        label: t('footer.policyLinks.privacy'),
        to: `${DOCS_PATH}#privacy`,
      },
      {
        label: t('footer.policyLinks.refund'),
        to: `${DOCS_PATH}#refund-policy`,
      },
      {
        label: t('footer.policyLinks.shipping'),
        to: `${DOCS_PATH}#shipping-policy`,
      },
      { label: t('footer.policyLinks.contact'), to: `${HOME_PATH}#contact` },
    ],
    [t],
  )

  const shoppingLinks = useMemo(
    () => [
      { label: t('footer.shoppingLinks.shopAll'), to: SHOP_PATH },
      { label: t('footer.shoppingLinks.skinConcerns'), to: `${SHOP_PATH}#skin-concerns-heading` },
      { label: t('footer.shoppingLinks.brands'), to: `${SHOP_PATH}#brand-stores-heading` },
      { label: t('footer.shoppingLinks.newArrivals'), to: getCollectionHref('new-arrivals') },
      { label: t('footer.shoppingLinks.bestSellers'), to: getCollectionHref('best-sellers') },
      {
        label: t('footer.shoppingLinks.shipping'),
        to: `${DOCS_PATH}#shipping-policy`,
      },
      { label: t('footer.shoppingLinks.returns'), to: RETURNS_HISTORY_PATH },
    ],
    [t],
  )

  return (
    <footer className="relative bg-background text-primary-text">
      <FooterSettingsProvider>
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-accent-soft to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-5 sm:py-12 lg:px-6 lg:py-16">
        <FadeUp>
          <div className="grid grid-cols-1 gap-10 min-[769px]:grid-cols-2 min-[769px]:gap-12 min-[1025px]:grid-cols-4 min-[1025px]:gap-10 xl:gap-14">
            <div className="min-[769px]:col-span-2 min-[1025px]:col-span-1">
              <Logo
                linkTo={HOME_PATH}
                className="dark:[&_img:nth-child(2)]:brightness-0 dark:[&_img:nth-child(2)]:invert"
              />
              <p className="mt-4 max-w-sm font-serif text-sm leading-relaxed text-secondary-text sm:text-base">
                {t('footer.description')}
              </p>
            </div>

            <FooterLinks title={t('footer.policies')} links={policyLinks} variant="slide" />
            <FooterLinks title={t('footer.shopping')} links={shoppingLinks} variant="underline" />

            <div className="min-[769px]:col-span-2 min-[1025px]:col-span-1 min-[1025px]:max-w-[280px] min-[1025px]:justify-self-end">
              <InstagramGrid />
            </div>
          </div>
        </FadeUp>

        <div className="mt-12 border-t border-border-subtle pt-8 lg:mt-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-secondary-text">{t('footer.copyright')}</p>
            <SocialLinks />
          </div>
        </div>
      </div>
      </FooterSettingsProvider>
    </footer>
  )
}
