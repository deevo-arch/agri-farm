import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLivestockById } from '../api/livestockApi'
import { requestVetVisit } from '../api/vetVisitApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function validate({ preferredDate, reason }) {
  if (!preferredDate) return 'Please choose a preferred date.'
  if (!reason.trim()) return 'Please enter a reason for the visit.'
  return ''
}

export default function RequestVetVisitPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [livestock, setLivestock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [preferredDate, setPreferredDate] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setLoadError('')
    getLivestockById(id)
      .then(setLivestock)
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setLoadError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ preferredDate, reason })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await requestVetVisit({
        livestockId: Number(id),
        preferredDate,
        reason: reason.trim(),
        notes: notes.trim() || null,
      })
      navigate('/vet-visits', {
        replace: true,
        state: { successMessage: 'Vet visit requested successfully.' },
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

      <h1>Request Vet Visit</h1>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="animal">Animal</label>
          <input id="animal" type="text" value={livestock.tagNumber} disabled readOnly />
        </div>

        <div className="field">
          <label htmlFor="preferredDate">
            Preferred date <span className="required">*</span>
          </label>
          <input
            id="preferredDate"
            type="date"
            value={preferredDate}
            min={todayIsoDate()}
            onChange={(e) => setPreferredDate(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="reason">
            Reason <span className="required">*</span>
          </label>
          <input
            id="reason"
            type="text"
            placeholder="e.g. Vaccination, illness, routine checkup"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Optional details for the vet"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-actions">
          <Link to={`/livestock/${id}`} className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Requesting…' : 'Request Vet Visit'}
          </button>
        </div>
      </form>
    </div>
  )
}
