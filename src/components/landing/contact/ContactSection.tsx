import { Mail, MapPin, Phone } from 'lucide-react'
import { FadeUp } from '../../ui/FadeUp'
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
    <section id="contact" className="relative overflow-hidden bg-white py-10 sm:py-14 lg:py-20 dark:bg-page-dark">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,124,248,0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,0.12)_0%,transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1340px] px-4 sm:px-5 lg:px-6">
        <FadeUp className="text-center">
          <h2 className="font-serif text-3xl font-medium text-[#1A1A1A] md:text-4xl lg:text-5xl dark:text-[#F5F5F5]">
            Contact us
          </h2>
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
