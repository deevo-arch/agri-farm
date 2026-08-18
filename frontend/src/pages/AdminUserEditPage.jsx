import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getUser, updateUser } from '../api/userApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

const ROLE_OPTIONS = ['FARMER', 'VET', 'ADMIN']

function validate({ fullName, email }) {
  if (!fullName.trim()) return 'Please enter a full name.'
  if (!email.trim()) return 'Please enter an email.'
  return ''
}

export default function AdminUserEditPage() {
  const { id } = useParams()
  const { role, userId } = useAuth()
  const navigate = useNavigate()
  const isSelf = Number(id) === Number(userId)

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('FARMER')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (role !== 'ADMIN') return
    setLoading(true)
    setNotFound(false)
    setLoadError('')
    getUser(id)
      .then((user) => {
        setFullName(user.fullName)
        setEmail(user.email)
        setSelectedRole(user.role)
      })
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setLoadError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id, role])

  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ fullName, email })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await updateUser(id, { fullName: fullName.trim(), email: email.trim(), role: selectedRole })
      navigate('/admin/users', {
        replace: true,
        state: { successMessage: `${fullName.trim()} was updated successfully.` },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Loading user…" />
  if (notFound) {
    return (
      <EmptyState
        title="User not found"
        message="This account may have been removed or the link is incorrect."
        action={
          <Link to="/admin/users" className="btn btn--ghost">
            Back to Users
          </Link>
        }
      />
    )
  }
  if (loadError) return <ErrorState message={loadError} />

  return (
    <div className="page page--narrow">
      <Link to="/admin/users" className="back-link">
        ← Back to Users
      </Link>

      <h1>Edit User</h1>

      {isSelf && (
        <div className="alert alert--danger" role="alert">
          You're editing your own account. You can't remove your own admin role.
        </div>
      )}
      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
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
          <label htmlFor="role">
            Role <span className="required">*</span>
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={submitting || isSelf}
            required
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {isSelf && <p className="field-note">Role is locked while editing your own account.</p>}
        </div>

        <div className="form-actions">
          <Link to="/admin/users" className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
