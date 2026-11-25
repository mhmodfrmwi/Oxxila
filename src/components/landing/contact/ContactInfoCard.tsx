// src/components/landing/contact/ContactInfoCard.tsx
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ContactInfoCardProps {
  icon: ReactNode
  label: string
  value: string
  href?: string
  delay?: number
  /** Open WhatsApp / external links in a new tab when set. */
  external?: boolean
}

/** Narrow grid cells wrap emails; break after "@" rather than mid-domain. */
function withEmailBreak(value: string) {
  const at = value.indexOf('@')
  if (at === -1) return value
  return (
    <>
      {value.slice(0, at + 1)}
      <wbr />
      {value.slice(at + 1)}
    </>
  )
}

export function ContactInfoCard({
  icon,
  label,
  value,
  href,
  delay = 0,
  external = false,
}: ContactInfoCardProps) {
  const content = (
    <>
      <span
        className="flex size-7 shrink-0 items-center justify-center text-icon-secondary transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none max-sm:[&>*]:scale-[0.85] sm:size-8"
        aria-hidden
      >
        {icon}
      </span>
      <span className="landing-type min-w-0 text-start">
        <span className="landing-fixed-text block text-primary-text [--landing-size:0.875rem] sm:[--landing-size:1rem] lg:[--landing-size:1.125rem]">
          {label}
        </span>
        <span
          className="landing-fixed-text mt-1 block text-helper-text [--landing-size:0.75rem] [overflow-wrap:anywhere] max-[359px]:[--landing-size:0.6875rem] sm:[--landing-size:0.8125rem] lg:[--landing-size:0.875rem]"
          dir="auto"
        >
          {withEmailBreak(value)}
        </span>
      </span>
    </>
  )

  const className =
    'group flex items-center gap-2 rounded-2xl sm:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
    >
      {href ? (
        <a
          href={href}
          className={className}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      ) : (
        <div className={className}>{content}</div>
      )}
    </motion.div>
  )
}
