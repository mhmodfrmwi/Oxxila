import { FadeUp } from '../../ui/FadeUp'
import { Logo } from '../../ui/Logo'
import { footerPolicyLinks, footerShoppingLinks } from '../landingData'
import { FooterLinks } from './FooterLinks'
import { InstagramGrid } from './InstagramGrid'
import { NewsletterForm } from './NewsletterForm'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  return (
    <footer className="relative bg-surface-subtle text-primary-text">
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-accent-soft to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-5 sm:py-12 lg:px-6 lg:py-16">
        <FadeUp>
          <div className="grid grid-cols-1 gap-10 min-[769px]:grid-cols-2 min-[769px]:gap-12 min-[1025px]:grid-cols-4 min-[1025px]:gap-10 xl:gap-14">
            <div className="min-[769px]:col-span-2 min-[1025px]:col-span-1">
              <Logo
                linkTo="/home"
                className="dark:[&_img:nth-child(2)]:brightness-0 dark:[&_img:nth-child(2)]:invert"
              />
              <p className="mt-4 max-w-sm font-serif text-sm leading-relaxed text-secondary-text sm:text-base">
                Discover clinically proven skincare products designed to help you achieve healthy,
                glowing skin.
              </p>
              <NewsletterForm />
            </div>

            <FooterLinks title="Policies" links={footerPolicyLinks} variant="slide" />
            <FooterLinks title="Shopping" links={footerShoppingLinks} variant="underline" />

            <div className="min-[769px]:col-span-2 min-[1025px]:col-span-1 min-[1025px]:max-w-[280px] min-[1025px]:justify-self-end">
              <InstagramGrid />
            </div>
          </div>
        </FadeUp>

        <div className="mt-12 border-t border-border-subtle pt-8 lg:mt-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-secondary-text">
              © 2026 Oxxila. All Rights Reserved.
            </p>
            <SocialLinks />
          </div>
        </div>
      </div>
    </footer>
  )
}
