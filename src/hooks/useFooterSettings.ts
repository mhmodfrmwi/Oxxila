// src/hooks/useFooterSettings.ts
import { useEffect, useState } from 'react'
import { footerInstagramImages, footerSocialLinks } from '../components/landing/landingData'
import {
  getInstagramSettings,
  getSocialSettings,
  INSTAGRAM_SLOT_COUNT,
  type ApiInstagramPost,
  type ApiSocialSettings,
} from '../api/settings'

export interface FooterInstagramTile {
  id: string
  src: string
  alt: string
  href: string
}

export interface FooterSocialLink {
  id: keyof ApiSocialSettings
  label: string
  href: string
}

const SOCIAL_LABELS: Record<keyof ApiSocialSettings, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
}

function buildFallbackInstagram(defaultProfileUrl: string): FooterInstagramTile[] {
  return footerInstagramImages.map((image) => ({
    id: image.id,
    src: image.src,
    alt: image.alt,
    href: defaultProfileUrl,
  }))
}

function buildFallbackSocial(): FooterSocialLink[] {
  return footerSocialLinks.map((link) => ({
    id: link.id as keyof ApiSocialSettings,
    label: link.label,
    href: link.href,
  }))
}

function mapInstagramPosts(
  posts: ApiInstagramPost[],
  defaultProfileUrl: string,
): FooterInstagramTile[] {
  const fallback = buildFallbackInstagram(defaultProfileUrl)

  return Array.from({ length: INSTAGRAM_SLOT_COUNT }, (_, index) => {
    const post = posts[index]
    const fallbackTile = fallback[index]
    const image = post?.image?.trim() || fallbackTile?.src || ''
    if (!image) return null

    return {
      id: `ig-${index}`,
      src: image,
      alt: post?.alt?.trim() || fallbackTile?.alt || 'Instagram post',
      href: post?.postUrl?.trim() || defaultProfileUrl,
    }
  }).filter((tile): tile is FooterInstagramTile => tile != null)
}

function mapSocialLinks(social: ApiSocialSettings): FooterSocialLink[] {
  return (Object.keys(SOCIAL_LABELS) as Array<keyof ApiSocialSettings>)
    .map((id) => ({
      id,
      label: SOCIAL_LABELS[id],
      href: social[id]?.trim() || '',
    }))
    .filter((link) => Boolean(link.href))
}

export function useFooterSettings() {
  const [instagramTiles, setInstagramTiles] = useState<FooterInstagramTile[]>(() =>
    buildFallbackInstagram('https://instagram.com'),
  )
  const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>(buildFallbackSocial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const [socialResponse, instagramResponse] = await Promise.all([
          getSocialSettings(),
          getInstagramSettings(),
        ])

        if (cancelled) return

        const social = socialResponse.data
        const defaultProfileUrl = social?.instagram?.trim() || 'https://instagram.com'

        if (social) {
          const mappedSocial = mapSocialLinks(social)
          if (mappedSocial.length > 0) setSocialLinks(mappedSocial)
        }

        if (instagramResponse.data?.length) {
          const mappedInstagram = mapInstagramPosts(instagramResponse.data, defaultProfileUrl)
          if (mappedInstagram.length > 0) setInstagramTiles(mappedInstagram)
        }
      } catch {
        // Keep static fallbacks when settings API is unavailable.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { instagramTiles, socialLinks, loading }
}
