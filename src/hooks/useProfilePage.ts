// src/hooks/useProfilePage.ts
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from '../api/users'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import { joinFullName, profileToAuthUser, splitFullName } from '../utils/userProfile'

export interface ProfileFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface ProfileFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

const emptyForm: ProfileFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

function validateProfileForm(
  form: ProfileFormState,
  t: (key: string) => string,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {}
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  const email = form.email.trim()
  const phone = form.phone.trim()
  const fullName = joinFullName(firstName, lastName)

  if (!firstName) {
    errors.firstName = t('profile.validation.firstNameRequired')
  }

  if (fullName.length < 2) {
    errors.firstName = errors.firstName ?? t('profile.validation.nameTooShort')
  } else if (fullName.length > 60) {
    errors.lastName = t('profile.validation.nameTooLong')
  }

  if (!email) {
    errors.email = t('profile.validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = t('profile.validation.emailInvalid')
  }

  if (phone.length > 30) {
    errors.phone = t('profile.validation.phoneTooLong')
  }

  return errors
}

export function useProfilePage() {
  const { t } = useTranslation()
  const { setUser } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState<ProfileFormState>(emptyForm)
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loadError, setLoadError] = useState('')

  const applyProfile = useCallback(
    (profile: {
      name: string
      email: string
      phone?: string
      avatar?: string
      _id?: string
      id?: string
      role?: string
    }) => {
      const { firstName, lastName } = splitFullName(profile.name)
      setForm({
        firstName,
        lastName,
        email: profile.email ?? '',
        phone: profile.phone ?? '',
      })
      setAvatar(profile.avatar ?? '')
      setUser(profileToAuthUser(profile))
    },
    [setUser],
  )

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setLoadError('')

      try {
        const response = await getUserProfile()
        if (cancelled) return

        if (!response.data) {
          setLoadError(t('profile.loadFailed'))
          return
        }

        applyProfile(response.data)
      } catch (err) {
        if (cancelled) return
        setLoadError(
          err instanceof ApiError ? err.message : t('profile.loadFailed'),
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [applyProfile, t])

  function updateField<K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploadingAvatar(true)

    try {
      const response = await uploadUserAvatar(file)
      if (response.data) {
        applyProfile(response.data)
        toast.success(t('profile.avatarUpdated'))
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('profile.avatarUpdateFailed')
      toast.error(t('profile.avatarUpdateFailed'), message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateProfileForm(form, t)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('profile.invalidForm'), t('profile.fillRequired'))
      return
    }

    setSubmitting(true)

    try {
      const response = await updateUserProfile({
        name: joinFullName(form.firstName, form.lastName),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })

      if (response.data) {
        applyProfile(response.data)
      } else {
        setUser(
          profileToAuthUser({
            name: joinFullName(form.firstName, form.lastName),
            email: form.email.trim(),
            phone: form.phone.trim(),
            avatar,
          }),
        )
      }

      toast.success(t('profile.updateSuccess'))
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('profile.updateFailed')
      toast.error(t('profile.updateFailed'), message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form,
    errors,
    avatar,
    loading,
    submitting,
    uploadingAvatar,
    loadError,
    displayName: joinFullName(form.firstName, form.lastName),
    updateField,
    handleAvatarChange,
    handleSubmit,
  }
}
