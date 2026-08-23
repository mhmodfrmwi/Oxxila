// src/components/landing/footer/SocialLinks.tsx
import { motion } from 'framer-motion'
import { useFooterSettingsContext } from '../../../context/FooterSettingsContext'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from './SocialIcons'

const iconMap = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
} as const

export function SocialLinks() {
  const { socialLinks } = useFooterSettingsContext()

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {socialLinks.map((social) => {
        const Icon = iconMap[social.id]
        return (
          <motion.a
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className={[
              'flex h-11 w-11 items-center justify-center rounded-lg',
              'bg-accent-soft/15 text-accent-soft transition-shadow duration-300',
              'hover:bg-accent-soft/25 hover:shadow-lg hover:shadow-accent-soft/25',
            ].join(' ')}
          >
            <Icon size={16} />
          </motion.a>
        )
      })}
    </div>
  )
}
