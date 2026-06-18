import { motion } from 'framer-motion'
import { footerSocialLinks } from '../landingData'
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
  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {footerSocialLinks.map((social) => {
        const Icon = iconMap[social.id as keyof typeof iconMap]
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
              'bg-[#8B7CF8]/15 text-[#8B7CF8] transition-shadow duration-300',
              'hover:bg-[#8B7CF8]/25 hover:shadow-lg hover:shadow-[#8B7CF8]/25',
              'dark:bg-[#A78BFA]/15 dark:text-[#A78BFA] dark:hover:bg-[#A78BFA]/25 dark:hover:shadow-[#A78BFA]/30',
            ].join(' ')}
          >
            <Icon size={16} />
          </motion.a>
        )
      })}
    </div>
  )
}
