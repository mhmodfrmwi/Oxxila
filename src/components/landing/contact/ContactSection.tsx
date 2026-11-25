// src/components/landing/contact/ContactSection.tsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getContactSettings } from '../../../api/settings'
import callIcon from '../../../assets/landing/home/call.svg'
import locationIcon from '../../../assets/landing/home/location.svg'
import mailIcon from '../../../assets/landing/home/mail.svg'
import { buildWhatsAppUrl } from '../../../utils/contactSettings'
import { FadeUp } from '../../ui/FadeUp'
import { MaskIcon } from '../../ui/MaskIcon'
import { SectionHeader } from '../SectionHeader'
import {
  contactInfo as fallbackContactInfo,
  type ContactInfoItem,
} from '../landingData'
import { ContactForm } from './ContactForm'
import { ContactInfoCard } from './ContactInfoCard'
import { WhatsAppIcon } from './WhatsAppIcon'

const labelKeyMap = {
  call: 'home.contact.call',
  email: 'home.contact.emailLabel',
  whatsapp: 'home.contact.whatsapp',
  location: 'home.contact.location',
} as const

function telHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')
  return digits ? `tel:${digits}` : undefined
}

function buildFallbackItems(): ContactInfoItem[] {
  return fallbackContactInfo
    .filter((item) => item.id !== 'whatsapp' || Boolean(item.href && item.value))
    .map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      href: item.href,
    }))
}

export function ContactSection() {
  const { t } = useTranslation()
  const [items, setItems] = useState<ContactInfoItem[]>(() => buildFallbackItems())

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await getContactSettings()
        const data = response.data
        if (cancelled || !data) return

        const next: ContactInfoItem[] = [
          {
            id: 'call',
            label: 'Call',
            value: data.phone || fallbackContactInfo[0].value,
            href: telHref(data.phone) ?? fallbackContactInfo[0].href,
          },
          {
            id: 'email',
            label: 'Email',
            value: data.email || fallbackContactInfo[1].value,
            href: data.email ? `mailto:${data.email}` : fallbackContactInfo[1].href,
          },
          {
            id: 'whatsapp',
            label: 'WhatsApp',
            value: data.whatsapp || '',
            href: buildWhatsAppUrl(data.whatsapp, data.whatsappDialCode, data.whatsappUrl),
          },
          {
            id: 'location',
            label: 'Location',
            value: data.location || 'Texas, USA',
            href: undefined,
          },
        ]

        setItems(next.filter((item) => item.id !== 'whatsapp' || Boolean(item.href && item.value)))
      } catch {
        // Keep static fallbacks when settings API is unavailable.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const visibleItems = useMemo(
    () => items.filter((item) => item.id !== 'whatsapp' || Boolean(item.href && item.value)),
    [items],
  )

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="landing-band scroll-mt-24 py-12 sm:py-16 lg:py-20"
    >
      <div className="relative container-content flex flex-col items-center gap-6 lg:gap-8">
        <FadeUp className="w-full">
          <SectionHeader id="contact-heading" title={t('home.contact.title')} align="center" />
        </FadeUp>

        <ContactForm />

        <div className="mt-4 grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-5 sm:mt-6 sm:gap-x-8 md:flex md:w-auto md:max-w-none md:flex-wrap md:items-center md:justify-center md:gap-x-12 lg:gap-x-16">
          {visibleItems.map((item, index) => {
            const icon =
              item.id === 'call' ? (
                <MaskIcon src={callIcon} width={24.4} height={24.4} frame={28} />
              ) : item.id === 'email' ? (
                <MaskIcon src={mailIcon} width={25.1} height={21.6} frame={28} />
              ) : item.id === 'whatsapp' ? (
                <WhatsAppIcon size={23} />
              ) : (
                <MaskIcon src={locationIcon} width={20.4} height={25.1} frame={28} />
              )

            return (
              <ContactInfoCard
                key={item.id}
                icon={icon}
                label={t(labelKeyMap[item.id])}
                value={item.value}
                href={item.href}
                external={item.id === 'whatsapp'}
                delay={0.1 + index * 0.08}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
