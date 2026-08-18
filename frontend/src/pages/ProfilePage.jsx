import { useEffect, useState } from 'react'
import { getUser, updateMyProfile } from '../api/userApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

function validate({ fullName, email }) {
  if (!fullName.trim()) return 'Please enter your full name.'
  if (!email.trim()) return 'Please enter your email.'
  return ''
}

export default function ProfilePage() {
  const { userId, role, updateName } = useAuth()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setLoadError('')
    getUser(userId)
      .then((user) => {
        setFullName(user.fullName)
        setEmail(user.email)
      })
      .catch((err) => {
        if (getErrorStatus(err)) setLoadError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [userId])

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ fullName, email })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSuccessMessage('')
    setSubmitting(true)
    try {
      const updated = await updateMyProfile({ fullName: fullName.trim(), email: email.trim() })
      updateName(updated.fullName)
      setFullName(updated.fullName)
      setEmail(updated.email)
      setSuccessMessage('Profile updated successfully.')
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Loading your profile…" />
  if (loadError) return <ErrorState message={loadError} />

  return (
    <div className="page page--narrow">
      <h1>My Profile</h1>

      {successMessage && (
        <div className="alert alert--success" role="status">
          {successMessage}
        </div>
      )}
      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="role">Role</label>
          <input id="role" type="text" value={role} disabled readOnly />
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

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
