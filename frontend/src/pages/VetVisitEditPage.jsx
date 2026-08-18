import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getVetVisitById, updateVetVisit } from '../api/vetVisitApi'
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

export default function VetVisitEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [visit, setVisit] = useState(null)
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
    getVetVisitById(id)
      .then((data) => {
        setVisit(data)
        setPreferredDate(data.preferredDate)
        setReason(data.reason)
        setNotes(data.notes ?? '')
      })
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
      await updateVetVisit(id, { preferredDate, reason: reason.trim(), notes: notes.trim() || null })
      navigate(`/vet-visits/${id}`, {
        replace: true,
        state: { successMessage: 'Vet visit request updated successfully.' },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Loading vet visit…" />
  if (notFound) {
    return (
      <EmptyState
        title="Vet visit not found"
        message="This visit may have been removed or the link is incorrect."
        action={
          <Link to="/vet-visits" className="btn btn--ghost">
            Back to Vet Visits
          </Link>
        }
      />
    )
  }
  if (loadError) return <ErrorState message={loadError} />
  if (!visit) return null

  if (visit.status !== 'REQUESTED') {
    return (
      <EmptyState
        title="This request can no longer be edited"
        message={`A visit can only be edited while it's still REQUESTED. This one is now ${visit.status}.`}
        action={
          <Link to={`/vet-visits/${id}`} className="btn btn--ghost">
            Back to Visit
          </Link>
        }
      />
    )
  }

  return (
    <div className="page page--narrow">
      <Link to={`/vet-visits/${id}`} className="back-link">
        ← Back to Visit
      </Link>

      <h1>Edit Vet Visit Request</h1>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="animal">Animal</label>
          <input id="animal" type="text" value={visit.livestockTagNumber} disabled readOnly />
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-actions">
          <Link to={`/vet-visits/${id}`} className="btn btn--ghost">
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
