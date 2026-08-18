import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createUser } from '../api/userApi'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'

const ROLE_OPTIONS = ['VET', 'ADMIN', 'FARMER']

const DEMO_VET = {
  fullName: 'Demo Vet',
  email: 'demo.vet@agritrust.local',
  password: 'DemoVet123!',
  role: 'VET',
}

function validate({ fullName, email, password }) {
  if (!fullName.trim()) return 'Please enter a full name.'
  if (!email.trim()) return 'Please enter an email.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return ''
}

export default function AdminCreateUserPage() {
  const { role } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('VET')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  function useDemoVetDetails() {
    setFullName(DEMO_VET.fullName)
    setEmail(DEMO_VET.email)
    setPassword(DEMO_VET.password)
    setSelectedRole(DEMO_VET.role)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ fullName, email, password })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      const created = await createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
      })
      navigate('/admin/users', {
        replace: true,
        state: { successMessage: `${created.role} account created for ${created.email}.` },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--narrow">
      <Link to="/admin/users" className="back-link">
        ← Back to Users
      </Link>

      <h1>Create User</h1>

      <div className="alert alert--success" role="status">
        Need a known demo vet for a walkthrough? Use{' '}
        <strong>{DEMO_VET.email}</strong> / <strong>{DEMO_VET.password}</strong> — click below to
        fill the form, or just log in with those credentials if the account already exists.
      </div>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="role">
            Role <span className="required">*</span>
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={submitting}
            required
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="fullName">
            Full name <span className="required">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            Password <span className="required">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            minLength={6}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={useDemoVetDetails} disabled={submitting}>
            Use Demo Vet Details
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}
