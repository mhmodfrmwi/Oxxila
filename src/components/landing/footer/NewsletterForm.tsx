import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

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
            'bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF]',
            'border border-[#E5E7EB] focus:border-[#8B7CF8]/50 focus:ring-2 focus:ring-[#8B7CF8]/20',
            'dark:bg-[#171B2E] dark:text-[#F5F5F5] dark:placeholder:text-[#A1A1AA]',
            'dark:border-white/[0.08] dark:focus:border-[#A78BFA]/50 dark:focus:ring-[#A78BFA]/20',
            error ? 'border-red-400 ring-2 ring-red-400/15' : '',
          ].join(' ')}
        />
        {error && (
          <p id="footer-newsletter-error" className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        whileHover={status === 'idle' ? { y: -2 } : undefined}
        whileTap={status === 'idle' ? { scale: 0.99 } : undefined}
        className={[
          'flex h-11 w-full min-h-11 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-white sm:h-14 sm:w-auto sm:text-base',
          'transition-all duration-300',
          status === 'success'
            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
            : 'bg-gradient-to-r from-[#8B7CF8] to-[#A78BFA] shadow-lg shadow-[#8B7CF8]/25 hover:shadow-xl hover:shadow-[#8B7CF8]/35 dark:from-[#A78BFA] dark:to-[#8B7CF8] dark:shadow-[#A78BFA]/20',
          status === 'loading' ? 'cursor-wait opacity-90' : '',
        ].join(' ')}
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
