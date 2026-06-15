import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { InputField } from '../ui/InputField'
import { AuthSimpleCard } from './AuthSimpleCard'
import { FormMessage } from './FormMessage'

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()

    setLoading(true)

    try {
      const response = await forgotPassword(email)
      navigate('/forgot-password/verify', {
        state: { email, message: response.message },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSimpleCard>
      <header className="mb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl font-medium text-text-primary-light dark:text-text-primary-dark sm:text-4xl">Forgot password?</h1>
        <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark sm:text-base">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </header>

      {error && <div className="mb-4"><FormMessage message={error} /></div>}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Example@example.com"
          required
        />

        <Button type="submit" fullWidth pill className="h-14" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-oxxila-accent hover:text-oxxila-purple-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxxila-accent rounded"
        >
          Back to login
        </Link>
      </p>
    </AuthSimpleCard>
  )
}
