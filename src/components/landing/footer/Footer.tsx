// src/components/landing/footer/Footer.tsx
import { MotionConfig } from 'framer-motion'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getCollectionHref } from '../../../config/collections'
import {
  DOCS_PATH,
  HOME_PATH,
  RETURNS_HISTORY_PATH,
  SHOP_PATH,
  TERMS_PATH,
  TRACK_ORDER_PATH,
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
      { label: t('footer.shoppingLinks.trackOrder'), to: TRACK_ORDER_PATH },
    ],
    [t],
  )

  return (
    <footer className="landing-type landing-band text-primary-text [--landing-band-bg:var(--background)]">
      <FooterSettingsProvider>
        <MotionConfig reducedMotion="user">
          <div className="px-[var(--page-gutter)] pt-[45px] pb-10 md:pt-20 lg:pt-[120px] lg:pb-8">
            <div className="flex flex-col md:grid md:grid-cols-3 md:gap-x-10 md:gap-y-12 lg:grid-cols-[minmax(0,515fr)_minmax(0,230fr)_minmax(0,222fr)_252px] lg:gap-x-0">
              <FadeUp className="flex flex-col items-center text-center md:col-span-3 md:items-start md:text-start lg:col-span-1 lg:pe-10">
                <Logo linkTo={HOME_PATH} size="header" />
                <p className="landing-text-base mt-6 max-w-[271px] text-secondary-text md:max-w-[386px] lg:landing-text-small">
                  {t('footer.description')}
                </p>
              </FadeUp>

              {/* Mobile Figma lists Shopping before Policies; desktop keeps Policies first. */}
              <FadeUp delay={0.08} className="max-md:order-2 lg:pe-6">
                <FooterLinks title={t('footer.policies')} links={policyLinks} />
              </FadeUp>

              <FadeUp delay={0.16} className="max-md:order-1 max-md:mt-10 lg:pe-6">
                <FooterLinks title={t('footer.shopping')} links={shoppingLinks} />
              </FadeUp>

              <FadeUp delay={0.24} className="mt-6 max-md:order-3 md:mt-0">
                <InstagramGrid />
              </FadeUp>
            </div>

            <div className="mt-16 md:mt-20 lg:mt-[100px]">
              <hr className="hidden h-px border-0 bg-border-interactive md:block" />
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:pt-8">
                <p className="text-center text-small text-secondary-text md:text-start">
                  {t('footer.copyright')}
                </p>
                <SocialLinks className="justify-center" />
              </div>
            </div>
          </div>
        </MotionConfig>
      </FooterSettingsProvider>
    </footer>
  )
}
