// src/components/landing/contact/ContactForm.tsx
import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { sendContactMessage } from '../../../api/settings'
import { ApiError } from '../../../lib/api'
import { cn } from '../../../lib/cn'

type FieldName = 'name' | 'email' | 'message'

interface FormValues {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const inputBase = [
  'landing-fixed-text peer h-14 w-full rounded-2xl border px-4 pt-6 pb-2 outline-none transition-[border-color,box-shadow] duration-300 [--landing-size:0.9375rem] sm:px-5 lg:h-[74px] lg:rounded-[20px] lg:[--landing-size:1.0625rem]',
  'bg-background text-primary-text placeholder-transparent',
  'border-transparent focus:border-button-primary/50 focus:ring-2 focus:ring-button-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none',
].join(' ')

const labelBase = [
  'landing-fixed-text pointer-events-none absolute start-4 text-placeholder-text transition-all duration-200 motion-reduce:transition-none [--landing-size:0.9375rem] sm:start-5 lg:[--landing-size:1.0625rem]',
  'top-1/2 -translate-y-1/2',
  'peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs! peer-focus:text-button-primary',
  'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs!',
].join(' ')

const textareaLabelBase = [
  'landing-fixed-text pointer-events-none absolute start-4 top-4 text-placeholder-text transition-all duration-200 motion-reduce:transition-none [--landing-size:0.9375rem] sm:start-5 lg:top-5 lg:[--landing-size:1.0625rem]',
  'peer-focus:top-2.5 peer-focus:text-xs! peer-focus:text-button-primary',
  'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-xs!',
].join(' ')

interface FloatingFieldProps {
  id: FieldName
  label: string
  type?: string
  value: string
  error?: string
  disabled?: boolean
  onChange: (value: string) => void
}

function FloatingField({
  id,
  label,
  type = 'text',
  value,
  error,
  disabled,
  onChange,
}: FloatingFieldProps) {
  const isTextarea = id === 'message'

  return (
    <div className="relative">
      {isTextarea ? (
        <textarea
          id={`contact-${id}`}
          name={id}
          rows={4}
          value={value}
          placeholder={label}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `contact-${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputBase, 'h-[120px] min-h-[120px] resize-y pt-8 lg:h-[150px] lg:min-h-[150px]')}
        />
      ) : (
        <input
          id={`contact-${id}`}
          name={id}
          type={type}
          value={value}
          placeholder={label}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `contact-${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      )}
      <label htmlFor={`contact-${id}`} className={isTextarea ? textareaLabelBase : labelBase}>
        {label}
      </label>
      {error && (
        <p id={`contact-${id}-error`} className="mt-1.5 text-xs text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function ContactForm() {
  const { t } = useTranslation()
  const [values, setValues] = useState<FormValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submittedOnce, setSubmittedOnce] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function validate(formValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {}
    if (!formValues.name.trim()) nextErrors.name = t('home.contact.nameRequired')
    else if (formValues.name.trim().length < 2) {
      nextErrors.name = t('home.contact.nameRequired')
    }
    if (!formValues.email.trim()) {
      nextErrors.email = t('home.contact.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      nextErrors.email = t('home.contact.emailInvalid')
    }
    if (!formValues.message.trim()) nextErrors.message = t('home.contact.messageRequired')
    else if (formValues.message.trim().length < 5) {
      nextErrors.message = t('home.contact.messageRequired')
    }
    return nextErrors
  }

  function updateField(field: FieldName, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    setSent(false)
    setSubmitError(null)
    // Clear field errors only after the user has already tried to send.
    if (submittedOnce) {
      setErrors(validate(nextValues))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    setSent(false)
    setSubmittedOnce(true)

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      })
      setValues({ name: '', email: '', message: '' })
      setSubmittedOnce(false)
      setErrors({})
      setSent(true)
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : t('home.contact.unavailable'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
      className="landing-type mx-auto flex w-full max-w-[454px] flex-col gap-3 sm:gap-4 lg:gap-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      noValidate
    >
      <FloatingField
        id="name"
        label={t('home.contact.name')}
        value={values.name}
        error={errors.name}
        disabled={submitting}
        onChange={(v) => updateField('name', v)}
      />
      <FloatingField
        id="email"
        label={t('home.contact.email')}
        type="email"
        value={values.email}
        error={errors.email}
        disabled={submitting}
        onChange={(v) => updateField('email', v)}
      />
      <FloatingField
        id="message"
        label={t('home.contact.message')}
        value={values.message}
        error={errors.message}
        disabled={submitting}
        onChange={(v) => updateField('message', v)}
      />

      {submitError ? (
        <p className="text-sm text-support-error" role="alert">
          {submitError}
        </p>
      ) : null}
      {sent ? (
        <p className="text-sm text-support-success" role="status">
          {t('home.contact.sent')}
        </p>
      ) : null}

      <motion.button
        type="submit"
        disabled={submitting}
        className={cn(
          'landing-fixed-text flex h-12 w-full items-center justify-center gap-2 rounded-full px-9 [--landing-size:0.9375rem] sm:h-14 lg:h-[70px] lg:[--landing-size:1.0625rem]',
          'bg-button-primary text-on-emphasis',
          'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-button-primary/35',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          'disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        )}
      >
        {submitting ? t('home.contact.sending') : t('home.contact.send')}
      </motion.button>
    </motion.form>
  )
}
