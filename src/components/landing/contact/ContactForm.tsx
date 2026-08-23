// src/components/landing/contact/ContactForm.tsx
import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { gradientCtaClasses } from '../../ui/buttonStyles'
import { typeSmallClasses } from '../../ui/typography'
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
  'peer min-h-11 h-14 w-full rounded-2xl border px-4 pt-5 pb-1.5 text-sm outline-none transition-all duration-300 sm:text-base',
  'bg-input text-primary-text placeholder-transparent',
  'border-transparent focus:border-accent-soft/50 focus:ring-2 focus:ring-accent-soft/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

const labelBase = [
  'pointer-events-none absolute start-4 text-placeholder-text transition-all duration-200',
  'top-1/2 -translate-y-1/2 text-sm',
  'peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent-soft',
  'peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
].join(' ')

interface FloatingFieldProps {
  id: FieldName
  label: string
  type?: string
  value: string
  error?: string
  disabled?: boolean
  onChange: (value: string) => void
  onBlur: () => void
}

function FloatingField({
  id,
  label,
  type = 'text',
  value,
  error,
  disabled,
  onChange,
  onBlur,
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
          onBlur={onBlur}
          className={cn(inputBase, 'h-auto min-h-[7.5rem] resize-y py-4')}
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
          onBlur={onBlur}
          className={inputBase}
        />
      )}
      <label htmlFor={`contact-${id}`} className={labelBase}>
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

/** No contact API endpoint — keep the form visible but non-submitting. */
export function ContactForm() {
  const { t } = useTranslation()
  const [values, setValues] = useState<FormValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    message: false,
  })

  function validate(formValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {}
    if (!formValues.name.trim()) nextErrors.name = t('home.contact.nameRequired')
    if (!formValues.email.trim()) {
      nextErrors.email = t('home.contact.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      nextErrors.email = t('home.contact.emailInvalid')
    }
    if (!formValues.message.trim()) nextErrors.message = t('home.contact.messageRequired')
    return nextErrors
  }

  function updateField(field: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors((prev) => {
        const next = validate({ ...values, [field]: value })
        return { ...prev, [field]: next[field] }
      })
    }
  }

  function blurField(field: FieldName) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const nextErrors = validate(values)
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl space-y-4 px-0 sm:px-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 2, delay: 0.1 }}
      noValidate
    >
      <FloatingField
        id="name"
        label={t('home.contact.name')}
        value={values.name}
        error={touched.name ? errors.name : undefined}
        disabled
        onChange={(v) => updateField('name', v)}
        onBlur={() => blurField('name')}
      />
      <FloatingField
        id="email"
        label={t('home.contact.email')}
        type="email"
        value={values.email}
        error={touched.email ? errors.email : undefined}
        disabled
        onChange={(v) => updateField('email', v)}
        onBlur={() => blurField('email')}
      />
      <FloatingField
        id="message"
        label={t('home.contact.message')}
        value={values.message}
        error={touched.message ? errors.message : undefined}
        disabled
        onChange={(v) => updateField('message', v)}
        onBlur={() => blurField('message')}
      />

      <motion.button
        type="submit"
        disabled
        className={cn(
          'flex h-14 w-full min-h-11 items-center justify-center gap-2 rounded-full px-8 text-on-emphasis',
          typeSmallClasses,
          gradientCtaClasses,
          'cursor-not-allowed opacity-60',
        )}
      >
        {t('home.contact.send')}
      </motion.button>
    </motion.form>
  )
}
