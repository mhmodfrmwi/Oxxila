// src/components/landing/footer/InstagramGrid.tsx
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFooterSettingsContext } from '../../../context/FooterSettingsContext'
import { cn } from '../../../lib/cn'
import { InstagramIcon } from './SocialIcons'

interface InstagramGridProps {
  className?: string
}

export function InstagramGrid({ className }: InstagramGridProps) {
  const { t } = useTranslation()
  const { instagramTiles } = useFooterSettingsContext()

  return (
    <div className={className}>
      <h3 className="landing-text-large px-4 text-primary-text md:px-0">{t('footer.followInstagram')}</h3>
      <div className="mt-6 grid grid-cols-4 gap-2 md:mt-8 md:grid-cols-2 md:gap-3 lg:w-[252px]">
        {instagramTiles.map((image, index) => (
          <motion.a
            key={image.id}
            href={image.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group relative aspect-square overflow-hidden rounded-[11px] border border-border-subtle bg-card md:rounded-[20px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary',
            )}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
            aria-label={t('footer.viewInstagramPost', { alt: image.alt })}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              loading="lazy"
            />
            <span
              className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35 group-focus-visible:bg-black/35"
              aria-hidden
            >
              <InstagramIcon
                size={28}
                className="scale-75 text-white opacity-0 transition-[opacity,scale] duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
