import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'
import QrScannerModal from '../components/QrScannerModal'

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
  const [qrToken, setQrToken] = useState('')
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const auth = await login(email.trim(), password)
      const redirectTo = location.state?.from?.pathname ?? dashboardPathForRole(auth.role)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function handleQrVerify(e) {
    e.preventDefault()
    if (!qrToken.trim()) return
    navigate(`/trace/${qrToken.trim()}`)
  }

  return (
    <div className="auth-page">
      <div className="auth-card-clean">
        <div className="auth-card-clean__brand">
          <Logo size={44} />
        </div>
        
        <p className="auth-card-clean__tagline">Livestock Traceability & Food Safety Platform</p>

        <h2>Sign In to Your Account</h2>

        {error && (
          <div className="alert alert--danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Consumer Public Verification Section */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔍</span> Consumer Milk Verification
          </h3>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
            Scan or enter a QR token to verify food safety instantly without logging in.
          </p>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="btn btn--outline btn--block"
            style={{ marginBottom: '12px', borderColor: '#10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            📷 Scan QR Code with Camera
          </button>

          <form onSubmit={handleQrVerify} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Or enter token manually..."
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                fontSize: '13px'
              }}
            />
            <button type="submit" className="btn btn--outline" style={{ fontSize: '13px', padding: '8px 16px' }}>
              Verify
            </button>
          </form>
        </div>

        <div className="auth-card-clean__footer" style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>New to AgriTrust?</p>
          <Link to="/register" className="btn btn--ghost btn--block" style={{ marginTop: '4px' }}>
            🌾 Register as Farmer
          </Link>
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
            Note: Certified Vets & Admins are onboarded by System Admin.
          </p>
        </div>

        {/* Camera QR Scanner Modal */}
        <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      </div>
    </div>
  )
}
