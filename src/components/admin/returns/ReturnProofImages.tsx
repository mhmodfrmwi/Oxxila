// src/components/admin/returns/ReturnProofImages.tsx
import { ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminReturnDetailProofImage } from '../../../types/adminReturns'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { ImageLightbox } from '../ui/ImageLightbox'
import { Skeleton } from '../ui/Skeleton'

interface ReturnProofImagesProps {
  images: readonly AdminReturnDetailProofImage[]
}

function ProofThumbnail({
  src,
  label,
  onOpen,
}: {
  src: string
  label: string
  onOpen: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    setStatus('loading')
  }, [src])

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={cn(
        'admin-glass relative size-14 shrink-0 overflow-hidden rounded-2xl p-1',
        'transition-opacity hover:opacity-90',
        focusRingClasses,
      )}
    >
      {status === 'loading' ? (
        <Skeleton className="absolute inset-1 rounded-[0.56rem]" />
      ) : null}

      {status === 'error' ? (
        <div
          className="flex size-full items-center justify-center rounded-[0.56rem] bg-white/5 text-white/25"
          aria-hidden
        >
          <ImageOff size={14} strokeWidth={1.5} />
        </div>
      ) : (
        <img
          src={src}
          alt=""
          className={cn(
            'size-full rounded-[0.56rem] object-cover',
            status === 'loading' && 'opacity-0',
          )}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </button>
  )
}

export function ReturnProofImages({ images }: ReturnProofImagesProps) {
  const { t } = useTranslation()
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return <EmptyState bare className="py-6" title={t('admin.returns.details.proofEmpty')} />
  }

  const lightboxImages = images.map((image, index) => ({
    src: image.url,
    alt: t('admin.returns.details.proofLink', { index: index + 1 }),
  }))

  return (
    <>
      <ul className="flex flex-wrap gap-2" aria-label={t('admin.returns.details.proofImages')}>
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <ProofThumbnail
              src={image.url}
              label={t('admin.returns.details.proofOpenAria', { index: index + 1 })}
              onOpen={() => setPreviewIndex(index)}
            />
          </li>
        ))}
      </ul>

      <ImageLightbox
        open={previewIndex !== null}
        images={lightboxImages}
        index={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
        onIndexChange={setPreviewIndex}
      />
    </>
  )
}
