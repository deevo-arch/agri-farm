import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/authApi'
import { resolveErrorMessage } from '../api/errors'
import Logo from '../components/Logo'

function validate({ fullName, email, password, confirmPassword }) {
  if (!fullName.trim()) return 'Please enter your full name.'
  if (!email.trim()) return 'Please enter your email address.'
  if (password.length < 6) return 'Password must be at least 6 characters long.'
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

  return (
    <div className="auth-page">
      <div className="auth-card-clean">
        <div className="auth-card-clean__brand">
          <Logo size={44} />
        </div>
        
        <p className="auth-card-clean__tagline">🌾 Join AgriTrust as a Farmer</p>

        <h2>Create Your Account</h2>

        {success && (
          <div className="alert alert--success" role="status">
            ✅ Account created successfully! Redirecting to sign in…
          </div>
        )}

        {error && (
          <div className="alert alert--danger" role="alert">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password (at least 6 characters)</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
              {submitting ? 'Creating Account…' : 'Register Account'}
            </button>
          </form>
        )}

        <div className="auth-card-clean__footer">
          <p>Already have an account?</p>
          <Link to="/login" className="btn btn--ghost btn--block" style={{ marginTop: '8px' }}>
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  )
}
