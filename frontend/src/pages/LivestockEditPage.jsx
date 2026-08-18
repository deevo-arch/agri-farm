import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLivestockById, updateLivestock } from '../api/livestockApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

const SPECIES_OPTIONS = ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'OTHER']
const STATUS_OPTIONS = ['ACTIVE', 'SOLD', 'DECEASED']

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function LivestockEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [livestock, setLivestock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [species, setSpecies] = useState('COW')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setLoadError('')
    getLivestockById(id)
      .then((data) => {
        setLivestock(data)
        setSpecies(data.species)
        setDateOfBirth(data.dateOfBirth ?? '')
        setStatus(data.status)
      })
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setLoadError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await updateLivestock(id, { species, dateOfBirth: dateOfBirth || null, status })
      navigate(`/livestock/${id}`, {
        replace: true,
        state: { successMessage: `${livestock.tagNumber} was updated successfully.` },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Loading animal…" />
  if (notFound) {
    return (
      <EmptyState
        title="Animal not found"
        message="This animal may have been removed or the link is incorrect."
        action={
          <Link to="/livestock" className="btn btn--ghost">
            Back to Livestock
          </Link>
        }
      />
    )
  }
  if (loadError) return <ErrorState message={loadError} />
  if (!livestock) return null

  return (
    <div className="page page--narrow">
      <Link to={`/livestock/${id}`} className="back-link">
        ← Back to {livestock.tagNumber}
      </Link>

      <h1>Edit {livestock.tagNumber}</h1>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="tagNumber">Tag number</label>
          <input id="tagNumber" type="text" value={livestock.tagNumber} disabled readOnly />
          <p className="field-note">Tag numbers are permanent and can't be changed.</p>
        </div>

        <div className="field">
          <label htmlFor="species">
            Species <span className="required">*</span>
          </label>
          <select
            id="species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            disabled={submitting}
            required
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            max={todayIsoDate()}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="field">
          <label htmlFor="status">
            Status <span className="required">*</span>
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={submitting}
            required
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <Link to={`/livestock/${id}`} className="btn btn--ghost">
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
