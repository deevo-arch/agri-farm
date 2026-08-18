import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'

function dashboardPathForRole(role) {
  if (role === 'VET') return '/vet/dashboard'
  if (role === 'ADMIN') return '/admin/dashboard'
  return '/dashboard'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const auth = await login(email.trim(), password)
      // Deep-link redirects (from ProtectedRoute) take priority; otherwise route straight to the
      // role's own dashboard so no intermediate/wrong dashboard is ever rendered.
      const redirectTo = location.state?.from?.pathname ?? dashboardPathForRole(auth.role)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Logo />
        </div>
        <p className="auth-card__tagline">Trace milk from farm to table.</p>

        <h1>Sign in</h1>

        {error && (
          <div className="alert alert--danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
