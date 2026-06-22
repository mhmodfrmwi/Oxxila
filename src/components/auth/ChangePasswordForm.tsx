import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { AuthSimpleCard } from './AuthSimpleCard'
import { FormMessage } from './FormMessage'

export function ChangePasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Reset token is missing. Open the password reset link from your email.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await resetPassword(token, { password, confirmPassword })
      setSuccess(response.message)
      event.currentTarget.reset()

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Password updated successfully. Please log in.' },
        })
      }, 1500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSimpleCard>
      <header className="mb-8 text-center sm:text-left">
        <Heading variant="page">Change password</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          Create a new password for your Oxxila account.
        </p>
      </header>

      {!token && (
        <div className="mb-4">
          <FormMessage message="Reset token is missing. Use the link from your email to open this page." />
        </div>
      )}

      {error && <div className="mb-4"><FormMessage message={error} /></div>}
      {success && <div className="mb-4"><FormMessage message={success} type="success" /></div>}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          label="New password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          showPasswordToggle
          required
          minLength={8}
        />

        <InputField
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          showPasswordToggle
          required
          minLength={8}
        />

        <Button type="submit" fullWidth pill className="mt-2 h-14" disabled={loading || !token}>
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-secondary-text">
        <Link
          to="/login"
          className="font-semibold text-link hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded"
        >
          Back to login
        </Link>
      </p>
    </AuthSimpleCard>
  )
}
