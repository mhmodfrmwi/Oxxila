// src/components/admin/returns/RejectReturnDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'

interface RejectReturnDialogProps {
  open: boolean
  returnShortId?: string | null
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (adminNote: string) => Promise<boolean>
}

export function RejectReturnDialog({
  open,
  returnShortId,
  submitting,
  error,
  onClose,
  onSubmit,
}: RejectReturnDialogProps) {
  const { t } = useTranslation()
  const [adminNote, setAdminNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setAdminNote('')
    setFormError(null)
  }, [open])

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  const handleSubmit = async () => {
    const trimmed = adminNote.trim()
    if (!trimmed) {
      setFormError(t('admin.returns.actions.reject.noteRequired'))
      return
    }
    setFormError(null)
    const ok = await onSubmit(trimmed)
    if (ok) onClose()
  }

  const displayError = formError || error

  return (
    <Dialog
      open={open}
      title={t('admin.returns.actions.reject.title')}
      description={
        returnShortId
          ? t('admin.returns.actions.reject.description', { id: returnShortId })
          : undefined
      }
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={submitting} onClick={handleClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" aria-hidden /> : null}
            {t('admin.returns.actions.reject.confirm')}
          </Button>
        </div>
      }
    >
      <label className="flex flex-col gap-2">
        <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
          {t('admin.returns.actions.reject.noteLabel')}
        </span>
        <textarea
          value={adminNote}
          disabled={submitting}
          onChange={(event) => {
            setAdminNote(event.target.value.slice(0, 500))
            setFormError(null)
          }}
          rows={4}
          maxLength={500}
          placeholder={t('admin.returns.actions.reject.notePlaceholder')}
          className={cn(
            'w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2',
            'text-sm text-white placeholder:text-white/30',
            focusRingClasses,
            submitting && 'cursor-not-allowed opacity-60',
          )}
        />
      </label>
      {displayError ? (
        <p className="mt-3 text-sm text-support-error" role="alert">
          {displayError}
        </p>
      ) : null}
    </Dialog>
  )
}
