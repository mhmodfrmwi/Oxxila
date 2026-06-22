import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { AuthSimpleCard } from './AuthSimpleCard'
import { FormMessage } from './FormMessage'

interface VerifyLocationState {
  email?: string
  message?: string
}

export function VerifyOtpForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as VerifyLocationState | null) ?? {}
  const email = state.email ?? ''
  const [message, setMessage] = useState(state.message ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    if (!email) {
      setError('Please enter your email on the forgot password page first.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await forgotPassword(email)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resend reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <AuthSimpleCard>
        <header className="mb-8 text-center sm:text-left">
          <Heading variant="page">Check your email</Heading>
          <p className="mt-2 text-sm text-secondary-text sm:text-base">
            Start from the forgot password page so we know which email to use.
          </p>
        </header>
        <Button type="button" fullWidth pill className="h-14" onClick={() => navigate('/forgot-password')}>
          Go to forgot password
        </Button>
      </AuthSimpleCard>
    )
  }

  return (
    <AuthSimpleCard>
      <header className="mb-8 text-center sm:text-left">
        <Heading variant="page">Check your email</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          We sent a password reset link to <strong>{email}</strong>. Open the link in your email to set a new password.
          The link expires in 60 minutes.
        </p>
      </header>

      {error && <div className="mb-4"><FormMessage message={error} /></div>}
      {message && <div className="mb-4"><FormMessage message={message} type="success" /></div>}

      <div className="space-y-4">
        <Button type="button" fullWidth pill className="h-14" onClick={() => navigate('/login')}>
          Back to login
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-secondary-text">
        Didn&apos;t receive an email?{' '}
        <button
          type="button"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded disabled:opacity-50"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Resend link'}
        </button>
      </p>

      <p className="mt-3 text-center text-sm text-secondary-text">
        <Link
          to="/forgot-password"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded"
        >
          Change email
        </Link>
      </p>
    </AuthSimpleCard>
  )
}
