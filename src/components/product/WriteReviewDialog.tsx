// src/components/product/WriteReviewDialog.tsx
import { Star } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { FormMessage } from '../auth/FormMessage'
import { Button } from '../ui/Button'
import { InputField } from '../ui/InputField'
import { TextAreaField } from '../ui/TextAreaField'
import { focusRingClasses } from '../ui/interactionStyles'
import { ProductFormDialog } from './ProductFormDialog'

const COMMENT_MAX = 1000
const TITLE_MAX = 100

export interface WriteReviewFormValues {
  rating: number
  comment: string
  title?: string
}

interface WriteReviewDialogProps {
  open: boolean
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (values: WriteReviewFormValues) => Promise<boolean>
}

export function WriteReviewDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: WriteReviewDialogProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setRating(0)
      setHoveredRating(0)
      setTitle('')
      setComment('')
      setRatingError(null)
      setCommentError(null)
      setTitleError(null)
    }
  }, [open])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return

    let valid = true
    const trimmedComment = comment.trim()
    const trimmedTitle = title.trim()

    if (rating < 1 || rating > 5) {
      setRatingError(t('productDetail.reviews.writeForm.ratingRequired'))
      valid = false
    } else {
      setRatingError(null)
    }

    if (!trimmedComment) {
      setCommentError(t('productDetail.reviews.writeForm.commentRequired'))
      valid = false
    } else if (trimmedComment.length > COMMENT_MAX) {
      setCommentError(t('productDetail.reviews.writeForm.commentMax', { max: COMMENT_MAX }))
      valid = false
    } else {
      setCommentError(null)
    }

    if (trimmedTitle.length > TITLE_MAX) {
      setTitleError(t('productDetail.reviews.writeForm.titleMax', { max: TITLE_MAX }))
      valid = false
    } else {
      setTitleError(null)
    }

    if (!valid) return

    const ok = await onSubmit({
      rating,
      comment: trimmedComment,
      ...(trimmedTitle ? { title: trimmedTitle } : {}),
    })

    if (ok) {
      setRating(0)
      setTitle('')
      setComment('')
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <ProductFormDialog
      open={open}
      title={t('productDetail.reviews.writeForm.title')}
      description={t('productDetail.reviews.writeForm.description')}
      onClose={submitting ? () => undefined : onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <fieldset className="flex flex-col gap-2">
          <legend className="font-serif text-sm font-medium text-primary-text">
            {t('productDetail.reviews.writeForm.ratingLabel')}
          </legend>
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHoveredRating(0)}
            role="radiogroup"
            aria-label={t('productDetail.reviews.writeForm.ratingLabel')}
          >
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1
              const selected = displayRating >= value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={t('productDetail.reviews.writeForm.ratingStar', { count: value })}
                  disabled={submitting}
                  className={cn(
                    'rounded-lg p-1 text-support-warning transition-colors',
                    focusRingClasses,
                    submitting && 'pointer-events-none opacity-60',
                  )}
                  onMouseEnter={() => setHoveredRating(value)}
                  onFocus={() => setHoveredRating(value)}
                  onBlur={() => setHoveredRating(0)}
                  onClick={() => {
                    setRating(value)
                    setRatingError(null)
                  }}
                >
                  <Star
                    size={28}
                    strokeWidth={1.5}
                    className={cn(
                      selected
                        ? 'fill-support-warning text-support-warning'
                        : 'fill-transparent text-support-warning/35',
                    )}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>
          {ratingError && (
            <p className="text-xs text-support-error" role="alert">
              {ratingError}
            </p>
          )}
        </fieldset>

        <InputField
          label={t('productDetail.reviews.writeForm.titleLabel')}
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (titleError) setTitleError(null)
          }}
          placeholder={t('productDetail.reviews.writeForm.titlePlaceholder')}
          maxLength={TITLE_MAX}
          error={titleError ?? undefined}
          disabled={submitting}
        />

        <TextAreaField
          label={t('productDetail.reviews.writeForm.commentLabel')}
          name="comment"
          value={comment}
          onChange={(event) => {
            setComment(event.target.value)
            if (commentError) setCommentError(null)
          }}
          placeholder={t('productDetail.reviews.writeForm.commentPlaceholder')}
          maxLength={COMMENT_MAX}
          error={commentError ?? undefined}
          disabled={submitting}
          required
        />

        {error && <FormMessage message={error} type="error" />}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" pill disabled={submitting} onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" pill disabled={submitting} aria-busy={submitting}>
            {submitting
              ? t('productDetail.reviews.writeForm.submitting')
              : t('productDetail.reviews.writeForm.submit')}
          </Button>
        </div>
      </form>
    </ProductFormDialog>
  )
}
