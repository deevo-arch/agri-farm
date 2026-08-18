import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { updateFarm } from '../api/farmApi'
import { resolveErrorMessage } from '../api/errors'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { useMyFarms } from '../hooks/useMyFarms'

function validate({ name, location }) {
  if (!name.trim()) return 'Please enter a farm name.'
  if (!location.trim()) return 'Please enter a location.'
  return ''
}

export default function FarmEditPage() {
  const navigate = useNavigate()
  const { farms, loading, error, primaryFarm } = useMyFarms()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (primaryFarm) {
      setName(primaryFarm.name)
      setLocation(primaryFarm.location)
    }
  }, [primaryFarm])

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
      await updateFarm(primaryFarm.id, { name: name.trim(), location: location.trim() })
      navigate('/farm', {
        replace: true,
        state: { successMessage: 'Your farm was updated successfully.' },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Loading your farm…" />
  if (error) return <ErrorState message={error} />
  if (farms.length === 0 || !primaryFarm) return null

  return (
    <div className="page page--narrow">
      <Link to="/farm" className="back-link">
        ← Back to Farm
      </Link>

      <h1>Edit Farm</h1>

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
          <Link to="/farm" className="btn btn--ghost">
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
