// src/utils/videoEmbed.ts

export type VideoEmbed =
  | { kind: 'iframe'; src: string }
  | { kind: 'video'; src: string }
  | null

/** Convert common share/watch URLs into a playable embed target. */
export function resolveVideoEmbed(url: string): VideoEmbed {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0]
      return id ? { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` } : null
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` }
      const shorts = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)
      if (shorts?.[1]) {
        return { kind: 'iframe', src: `https://www.youtube.com/embed/${shorts[1]}` }
      }
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` } : null
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(parsed.pathname)) {
      return { kind: 'video', src: trimmed }
    }

    // Already an embed URL or other https media page — try iframe.
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return { kind: 'iframe', src: trimmed }
    }
  } catch {
    return null
  }

  return null
}
