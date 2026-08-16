import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createFarm } from '../api/farmApi'
import { resolveErrorMessage } from '../api/errors'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../auth/useAuth'
import { useMyFarms } from '../hooks/useMyFarms'

function validate({ name, location }) {
  if (!name.trim()) return 'Please enter a farm name.'
  if (!location.trim()) return 'Please enter a location.'
  return ''
}

export default function FarmFormPage() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const { farms, loading: farmsLoading, error: farmsError } = useMyFarms()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ name, location })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await createFarm({ name: name.trim(), location: location.trim(), ownerId: userId })
      navigate('/farm', {
        replace: true,
        state: { successMessage: 'Your farm was created successfully.' },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (farmsLoading) return <LoadingState label="Checking your farms…" />
  if (farmsError) return <ErrorState message={farmsError} />

  if (farms.length > 0) {
    return (
      <div className="page page--narrow">
        <h1>Add Farm</h1>
        <div className="alert alert--success" role="status">
          You already have a farm registered.
        </div>
        <Link to="/farm" className="btn btn--ghost">
          View Your Farm
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <h1>Create Your Farm</h1>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="name">
            Farm name <span className="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="location">
            Location <span className="required">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="form-actions">
          <Link to="/dashboard" className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Farm'}
          </button>
        </div>
      </form>
    </div>
  )
}
