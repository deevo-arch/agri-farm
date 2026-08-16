import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/authApi'
import { resolveErrorMessage } from '../api/errors'
import Logo from '../components/Logo'

function validate({ fullName, email, password, confirmPassword }) {
  if (!fullName.trim()) return 'Please enter your full name.'
  if (!email.trim()) return 'Please enter your email.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  if (password !== confirmPassword) return 'Passwords do not match.'
  return ''
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ fullName, email, password, confirmPassword })
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__brand">
            <Logo />
          </div>
          <div className="alert alert--success" role="status">
            Account created. Redirecting to sign in…
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Logo />
        </div>
        <p className="auth-card__tagline">Join as a farmer to start tracing your milk.</p>

        <h1>Create your account</h1>

        {error && (
          <div className="alert alert--danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              minLength={6}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              minLength={6}
              required
            />
          </div>

          <p className="field-note">
            New accounts are created as <strong>Farmer</strong> accounts. Vet and admin access is
            granted separately.
          </p>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
