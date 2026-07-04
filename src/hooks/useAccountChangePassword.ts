// src/hooks/useAccountChangePassword.ts
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { updateUserPassword } from '../api/users'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'

export interface ChangePasswordFormState {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordFormErrors {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const emptyForm: ChangePasswordFormState = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function validateChangePasswordForm(
  form: ChangePasswordFormState,
  t: (key: string) => string,
): ChangePasswordFormErrors {
  const errors: ChangePasswordFormErrors = {}

  if (!form.oldPassword) {
    errors.oldPassword = t('profile.password.currentRequired')
  }

  if (!form.newPassword) {
    errors.newPassword = t('profile.password.newRequired')
  } else if (form.newPassword.length < 8) {
    errors.newPassword = t('profile.password.newTooShort')
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t('profile.password.confirmRequired')
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = t('profile.password.mismatch')
  }

  return errors
}

export function useAccountChangePassword() {
  const { t } = useTranslation()
  const toast = useToast()
  const [form, setForm] = useState<ChangePasswordFormState>(emptyForm)
  const [errors, setErrors] = useState<ChangePasswordFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function updateField<K extends keyof ChangePasswordFormState>(
    field: K,
    value: ChangePasswordFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateChangePasswordForm(form, t)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('profile.password.invalidForm'), t('profile.password.fillRequired'))
      return
    }

    setSubmitting(true)

    try {
      await updateUserPassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      setForm(emptyForm)
      toast.success(t('profile.password.updateSuccess'))
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('profile.password.updateFailed')
      toast.error(t('profile.password.updateFailed'), message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form,
    errors,
    submitting,
    updateField,
    handleSubmit,
  }
}
