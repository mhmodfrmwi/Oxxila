// src/components/landing/footer/InstagramGrid.tsx
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFooterSettingsContext } from '../../../context/FooterSettingsContext'
import { Heading } from '../../ui/Heading'
import { InstagramIcon } from './SocialIcons'

export function InstagramGrid() {
  const { t } = useTranslation()
  const { instagramTiles } = useFooterSettingsContext()

  return (
    <div>
      <Heading variant="card">{t('footer.followInstagram')}</Heading>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-3.5">
        {instagramTiles.map((image, index) => (
          <motion.a
            key={image.id}
            href={image.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl bg-border-subtle"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            aria-label={t('footer.viewInstagramPost', { alt: image.alt })}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              loading="lazy"
            />
            <span
              className={[
                'absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300',
                'group-hover:bg-black/35',
              ].join(' ')}
              aria-hidden
            >
              <InstagramIcon
                size={28}
                className="scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              />
            </span>
          </motion.a>
        ))}

      </div>
    </div>
  )
}
