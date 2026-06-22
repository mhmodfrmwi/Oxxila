import { Mail, MapPin, Phone } from 'lucide-react'
import { FadeUp } from '../../ui/FadeUp'
import { SectionHeader } from '../SectionHeader'
import { contactInfo } from '../landingData'
import { ContactForm } from './ContactForm'
import { ContactInfoCard } from './ContactInfoCard'

const iconMap = {
  call: Phone,
  email: Mail,
  location: MapPin,
} as const

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-card py-10 sm:py-14 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-glow)_0%,transparent_50%)]"
        aria-hidden
      />

      <div className="relative container-content">
        <FadeUp>
          <SectionHeader title="Contact us" align="center" />
        </FadeUp>

        <div className="mt-8 lg:mt-12">
          <ContactForm />
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:mt-12 min-[769px]:grid-cols-3 min-[769px]:gap-6">
          {contactInfo.map((item, index) => {
            const Icon = iconMap[item.id]
            return (
              <ContactInfoCard
                key={item.id}
                icon={Icon}
                label={item.label}
                value={item.value}
                href={item.href}
                delay={0.1 + index * 0.08}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
