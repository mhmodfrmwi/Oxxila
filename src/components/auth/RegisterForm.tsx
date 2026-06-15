import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useTheme } from '../../context/ThemeContext'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { InputField } from '../ui/InputField'
import { AuthCard } from './AuthCard'
import { FormMessage } from './FormMessage'
import { PasswordStrength } from './PasswordStrength'
import { SocialLoginButtons } from './SocialLoginButtons'

export function RegisterForm() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const nextPassword = String(formData.get('password') ?? '')

    setLoading(true)

    try {
      await register({ name, email, phone, password: nextPassword })
      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully. Please log in.' },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard activeTab="signup" imagePosition="left">
      <header className="mb-8">
        <h1
          className={[
            'font-serif text-4xl font-medium sm:text-[2.75rem]',
            isDark ? 'text-white' : 'text-text-primary-light',
          ].join(' ')}
        >
          Create your account
        </h1>
        <p
          className={[
            'mt-2 font-serif text-xl',
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light',
          ].join(' ')}
        >
          Welcome to Oxxila
        </p>
      </header>

      {error && <div className="mb-4"><FormMessage message={error} /></div>}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          label="Full Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Name:"
          required
        />

        <InputField
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Example@example.com"
          required
        />

        <InputField
          label="Phone Number"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          inputMode="tel"
          required
        />

        <div className="space-y-2">
          <InputField
            label="Create password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            showPasswordToggle
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password} />
        </div>

        <SocialLoginButtons disabled={loading} />

        <Button type="submit" fullWidth pill className="h-14 sm:h-[65px]" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p
        className={[
          'mt-6 text-center text-sm',
          isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light',
        ].join(' ')}
      >
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-oxxila-accent hover:text-oxxila-purple-light">
          Login here
        </Link>
      </p>
    </AuthCard>
  )
}
