import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { gradientCtaClasses, successCtaClasses } from '../../ui/buttonStyles'
import { typeSmallClasses } from '../../ui/typography'
import { cn } from '../../../lib/cn'

type FormStatus = 'idle' | 'loading' | 'success'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  function validate(value: string) {
    if (!value.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
    return ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = validate(email)
    setError(message)
    if (message) return

    setStatus('loading')
    await new Promise((resolve) => window.setTimeout(resolve, 1100))
    setStatus('success')
    setEmail('')
    window.setTimeout(() => setStatus('idle'), 2800)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 sm:mt-8" noValidate>
      <div>
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          value={email}
          placeholder="Enter your email"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'footer-newsletter-error' : undefined}
          disabled={status === 'loading'}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(validate(e.target.value))
          }}
          onBlur={() => {
            if (email) setError(validate(email))
          }}
          className={[
            'h-11 w-full rounded-full px-5 text-sm outline-none transition-all duration-300 sm:h-14 sm:max-w-[419px]',
            'bg-card text-primary-text placeholder:text-placeholder-text',
            'border border-border-subtle focus:border-accent-soft/50 focus:ring-2 focus:ring-accent-soft/20',
            error ? 'border-support-error ring-2 ring-support-error/15' : '',
          ].join(' ')}
        />
        {error && (
          <p id="footer-newsletter-error" className="mt-1.5 text-xs text-support-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        whileHover={status === 'idle' ? { y: -2 } : undefined}
        whileTap={status === 'idle' ? { scale: 0.99 } : undefined}
        className={cn(
          'flex h-11 w-full min-h-11 items-center justify-center gap-2 rounded-full px-8 text-on-emphasis sm:h-14 sm:w-auto',
          typeSmallClasses,
          'transition-all duration-300',
          status === 'success' ? successCtaClasses : gradientCtaClasses,
          status === 'loading' && 'cursor-wait opacity-90',
        )}
      >
        {status === 'loading' && (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Subscribing…
          </>
        )}
        {status === 'success' && (
          <>
            <Check size={18} aria-hidden />
            Subscribed!
          </>
        )}
        {status === 'idle' && 'Subscribe'}
      </motion.button>
    </form>
  )
}
