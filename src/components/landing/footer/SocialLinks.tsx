// src/components/landing/footer/SocialLinks.tsx
import { useFooterSettingsContext } from '../../../context/FooterSettingsContext'
import { cn } from '../../../lib/cn'
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from './SocialIcons'

const iconMap = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
} as const

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className }: SocialLinksProps) {
  const { socialLinks } = useFooterSettingsContext()

  return (
    <ul className={cn('flex flex-wrap items-center gap-3.5 md:gap-4', className)}>
      {socialLinks.map((social) => {
        const Icon = iconMap[social.id]
        return (
          <li key={social.id}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={cn(
                'flex size-8 items-center justify-center rounded-[6px] md:size-9',
                'bg-button-secondary text-icon-on-emphasis',
                'transition-[transform,background-color] duration-200 ease-out',
                'hover:-translate-y-0.5 hover:bg-button-primary active:translate-y-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
              )}
            >
              <Icon size={16} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
