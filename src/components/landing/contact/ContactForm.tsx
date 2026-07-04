// src/components/landing/contact/ContactForm.tsx
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { gradientCtaClasses, successCtaClasses } from '../../ui/buttonStyles'
import { typeSmallClasses } from '../../ui/typography'
import { cn } from '../../../lib/cn'

type FieldName = 'name' | 'email' | 'message'
type FormStatus = 'idle' | 'loading' | 'success'

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
  type?: 'text' | 'email'
  multiline?: boolean
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

function FloatingField({
  id,
  label,
  type = 'text',
  multiline = false,
  value,
  error,
  onChange,
  onBlur,
}: FloatingFieldProps) {
  const errorRing = error ? 'border-support-error ring-2 ring-support-error/20' : ''

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          value={value}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={[inputBase, 'h-auto min-h-[140px] resize-none py-4', errorRing].join(' ')}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={[inputBase, errorRing].join(' ')}
        />
      )}
      <label htmlFor={id} className={labelBase}>
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-support-error" role="alert">
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
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const [status, setStatus] = useState<FormStatus>('idle')

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(nextErrors).length > 0) return

    setStatus('loading')
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    setStatus('success')
    setValues({ name: '', email: '', message: '' })
    setTouched({ name: false, email: false, message: false })
    window.setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl space-y-4 px-0 sm:px-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      noValidate
    >
      <FloatingField
        id="name"
        label={t('home.contact.name')}
        value={values.name}
        error={touched.name ? errors.name : undefined}
        onChange={(v) => updateField('name', v)}
        onBlur={() => blurField('name')}
      />
      <FloatingField
        id="email"
        label={t('home.contact.email')}
        type="email"
        value={values.email}
        error={touched.email ? errors.email : undefined}
        onChange={(v) => updateField('email', v)}
        onBlur={() => blurField('email')}
      />
      <FloatingField
        id="message"
        label={t('home.contact.message')}
        multiline
        value={values.message}
        error={touched.message ? errors.message : undefined}
        onChange={(v) => updateField('message', v)}
        onBlur={() => blurField('message')}
      />

      <motion.button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        whileHover={status === 'idle' ? { y: -2 } : undefined}
        whileTap={status === 'idle' ? { scale: 0.99 } : undefined}
        className={cn(
          'flex h-14 w-full items-center justify-center gap-2 rounded-full text-on-emphasis',
          typeSmallClasses,
          'transition-all duration-300',
          status === 'success' ? successCtaClasses : gradientCtaClasses,
          status === 'loading' && 'cursor-wait opacity-90',
        )}
      >
        {status === 'loading' && (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden />
            {t('home.contact.sending')}
          </>
        )}
        {status === 'success' && (
          <>
            <Check size={20} aria-hidden />
            {t('home.contact.sent')}
          </>
        )}
        {status === 'idle' && t('home.contact.send')}
      </motion.button>
    </motion.form>
  )
}
