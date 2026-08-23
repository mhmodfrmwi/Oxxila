// src/components/landing/contact/ContactSection.tsx
import { Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getContactSettings } from '../../../api/settings'
import { buildWhatsAppUrl } from '../../../utils/contactSettings'
import { FadeUp } from '../../ui/FadeUp'
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
            href: buildWhatsAppUrl(data.whatsapp, data.whatsappUrl),
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
    <section id="contact" className="relative overflow-hidden bg-background py-10 sm:py-14 lg:py-20">
      <div className="relative container-content">
        <FadeUp>
          <SectionHeader title={t('home.contact.title')} align="center" />
        </FadeUp>

        <div className="mt-8 lg:mt-12">
          <ContactForm />
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:mt-12 min-[769px]:grid-cols-2 min-[1024px]:grid-cols-4 min-[769px]:gap-4">
          {visibleItems.map((item, index) => {
            const icon =
              item.id === 'call' ? (
                <Phone size={20} strokeWidth={1.5} />
              ) : item.id === 'email' ? (
                <Mail size={20} strokeWidth={1.5} />
              ) : item.id === 'whatsapp' ? (
                <WhatsAppIcon size={20} />
              ) : (
                <MapPin size={20} strokeWidth={1.5} />
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
