// src/components/product/AskSpecialistDialog.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FormMessage } from '../auth/FormMessage'
import { Button } from '../ui/Button'
import { TextAreaField } from '../ui/TextAreaField'
import { ProductFormDialog } from './ProductFormDialog'

const QUESTION_MAX = 300

interface AskSpecialistDialogProps {
  open: boolean
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (question: string) => Promise<boolean>
}

export function AskSpecialistDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: AskSpecialistDialogProps) {
  const { t } = useTranslation()
  const [question, setQuestion] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setQuestion('')
      setFieldError(null)
    }
  }, [open])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return

    const trimmed = question.trim()
    if (!trimmed) {
      setFieldError(t('productDetail.questions.askForm.questionRequired'))
      return
    }
    if (trimmed.length > QUESTION_MAX) {
      setFieldError(t('productDetail.questions.askForm.questionMax', { max: QUESTION_MAX }))
      return
    }

    setFieldError(null)
    const ok = await onSubmit(trimmed)
    if (ok) {
      setQuestion('')
    }
  }

  return (
    <ProductFormDialog
      open={open}
      title={t('productDetail.questions.askForm.title')}
      description={t('productDetail.questions.askForm.description')}
      onClose={submitting ? () => undefined : onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <TextAreaField
          label={t('productDetail.questions.askForm.questionLabel')}
          name="question"
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value)
            if (fieldError) setFieldError(null)
          }}
          placeholder={t('productDetail.questions.askForm.questionPlaceholder')}
          maxLength={QUESTION_MAX}
          error={fieldError ?? undefined}
          disabled={submitting}
          required
        />
        <p className="text-xs text-secondary-text">
          {t('productDetail.questions.askForm.charCount', {
            count: question.trim().length,
            max: QUESTION_MAX,
          })}
        </p>

        {error && <FormMessage message={error} type="error" />}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" pill disabled={submitting} onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" pill disabled={submitting} aria-busy={submitting}>
            {submitting
              ? t('productDetail.questions.askForm.submitting')
              : t('productDetail.questions.askForm.submit')}
          </Button>
        </div>
      </form>
    </ProductFormDialog>
  )
}
