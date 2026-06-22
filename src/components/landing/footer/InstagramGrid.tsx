import { motion } from 'framer-motion'
import type { FeaturedImage } from '../../../types/catalog'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { Heading } from '../../ui/Heading'
import { footerInstagramImages } from '../landingData'
import { InstagramIcon } from './SocialIcons'

export function InstagramGrid() {
  const { featuredImages, loading } = useLandingCatalogContext()
  const images: FeaturedImage[] = loading || featuredImages.length === 0
    ? footerInstagramImages.map((image) => ({
        id: image.id,
        src: image.src,
        alt: image.alt,
      }))
    : featuredImages

  return (
    <div>
      <Heading variant="card">Follow on Instagram</Heading>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-3.5">
        {images.map((image, index) => (
          <motion.a
            key={image.id}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl bg-border-subtle"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            aria-label={`View ${image.alt} on Instagram`}
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
