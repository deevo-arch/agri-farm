import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  acceptVetVisit,
  completeVetVisit,
  getVetVisitById,
  rejectVetVisit,
} from '../api/vetVisitApi'
import { createMedication, createVaccination } from '../api/treatmentApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'

const STATUS_TONES = { REQUESTED: 'warning', ACCEPTED: 'primary', COMPLETED: 'success', REJECTED: 'danger' }

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(isoDateTime) {
  if (!isoDateTime) return '—'
  return new Date(isoDateTime).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function VetVisitDetailPage() {
  const { id } = useParams()
  const { role, userId } = useAuth()
  const location = useLocation()

  const [visit, setVisit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionPending, setActionPending] = useState(false)
  const [flashMessage] = useState(location.state?.successMessage ?? '')

  const load = useCallback(() => {
    setLoading(true)
    setNotFound(false)
    setError('')
    return getVetVisitById(id)
      .then(setVisit)
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function runAction(action) {
    setActionError('')
    setActionPending(true)
    try {
      const updated = await action()
      setVisit(updated)
    } catch (err) {
      setActionError(resolveErrorMessage(err))
    } finally {
      setActionPending(false)
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
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!visit) return null

  const isVetOrAdmin = role === 'VET' || role === 'ADMIN'
  const isAssignedVet = visit.vetId != null && Number(visit.vetId) === Number(userId)
  const canManage = isVetOrAdmin && (role === 'ADMIN' || isAssignedVet || visit.status === 'REQUESTED')
  const backTo = role === 'VET' || role === 'ADMIN' ? '/vet/dashboard' : '/vet-visits'
  const isOwnRequest = Number(visit.requestedById) === Number(userId)
  const canEditRequest =
    visit.status === 'REQUESTED' && (role === 'ADMIN' || (role === 'FARMER' && isOwnRequest))

  return (
    <div className="page page--narrow">
      <Link to={backTo} className="back-link">
        ← Back
      </Link>

      <div className="page__header">
        <h1>{visit.livestockTagNumber}</h1>
        <div className="page__header-actions">
          <StatusBadge tone={STATUS_TONES[visit.status] ?? 'neutral'}>{visit.status}</StatusBadge>
          {canEditRequest && (
            <Link to={`/vet-visits/${id}/edit`} className="btn btn--ghost">
              Edit Request
            </Link>
          )}
        </div>
      </div>

      {flashMessage && (
        <div className="alert alert--success" role="status">
          {flashMessage}
        </div>
      )}
      {actionError && (
        <div className="alert alert--danger" role="alert">
          {actionError}
        </div>
      )}

      <div className="card">
        <h2>Visit Details</h2>
        <dl className="detail-list">
          <div>
            <dt>Farm</dt>
            <dd>{visit.farmName}</dd>
          </div>
          <div>
            <dt>Animal</dt>
            <dd>{visit.livestockTagNumber}</dd>
          </div>
          <div>
            <dt>Requested by</dt>
            <dd>{visit.requestedByName}</dd>
          </div>
          <div>
            <dt>Requested on</dt>
            <dd>{formatDateTime(visit.createdAt)}</dd>
          </div>
          <div>
            <dt>Preferred date</dt>
            <dd>{formatDate(visit.preferredDate)}</dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{visit.reason}</dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{visit.notes || '—'}</dd>
          </div>
          <div>
            <dt>Assigned vet</dt>
            <dd>{visit.vetName || '—'}</dd>
          </div>
          {visit.status === 'COMPLETED' && (
            <div>
              <dt>Completed on</dt>
              <dd>{formatDateTime(visit.completedAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {isVetOrAdmin && visit.status === 'REQUESTED' && (
        <div className="card">
          <h2>Respond to request</h2>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={actionPending}
              onClick={() => runAction(() => acceptVetVisit(visit.id))}
            >
              Accept
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={actionPending}
              onClick={() => runAction(() => rejectVetVisit(visit.id))}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {isVetOrAdmin && visit.status === 'ACCEPTED' && canManage && (
        <div className="card">
          <h2>Complete visit</h2>
          <p>Once the visit is finished on-site, mark it complete.</p>
          <button
            type="button"
            className="btn btn--primary"
            disabled={actionPending}
            onClick={() => runAction(() => completeVetVisit(visit.id))}
          >
            Complete Visit
          </button>
        </div>
      )}

      {isVetOrAdmin && (visit.status === 'ACCEPTED' || visit.status === 'COMPLETED') && canManage && (
        <RecordTreatmentForm livestockId={visit.livestockId} vetVisitId={visit.id} />
      )}
    </div>
  )
}

function RecordTreatmentForm({ livestockId, vetVisitId }) {
  const [treatmentType, setTreatmentType] = useState('VACCINATION')
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [administeredDate, setAdministeredDate] = useState('')
  const [withdrawalEndDate, setWithdrawalEndDate] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setName('')
    setDosage('')
    setAdministeredDate('')
    setWithdrawalEndDate('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim() || !administeredDate || !withdrawalEndDate) {
      setFormError('Please fill in name, administered date, and withdrawal end date.')
      return
    }

    setFormError('')
    setSuccessMessage('')
    setSubmitting(true)
    try {
      if (treatmentType === 'VACCINATION') {
        await createVaccination({
          livestockId,
          vetVisitId,
          vaccineName: name.trim(),
          administeredDate,
          withdrawalEndDate,
        })
      } else {
        await createMedication({
          livestockId,
          vetVisitId,
          medicationName: name.trim(),
          dosage: dosage.trim() || null,
          administeredDate,
          withdrawalEndDate,
        })
      }
      setSuccessMessage(`${treatmentType === 'VACCINATION' ? 'Vaccination' : 'Medication'} recorded successfully.`)
      resetForm()
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h2>Record Treatment</h2>

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

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="treatmentType">Treatment Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="treatmentType"
                value="VACCINATION"
                checked={treatmentType === 'VACCINATION'}
                onChange={() => setTreatmentType('VACCINATION')}
                disabled={submitting}
              />
              Vaccination
            </label>
            <label>
              <input
                type="radio"
                name="treatmentType"
                value="MEDICATION"
                checked={treatmentType === 'MEDICATION'}
                onChange={() => setTreatmentType('MEDICATION')}
                disabled={submitting}
              />
              Medication
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="treatmentName">
            {treatmentType === 'VACCINATION' ? 'Vaccine name' : 'Medication name'}{' '}
            <span className="required">*</span>
          </label>
          <input
            id="treatmentName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        {treatmentType === 'MEDICATION' && (
          <div className="field">
            <label htmlFor="dosage">Dosage</label>
            <input id="dosage" type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} disabled={submitting} />
          </div>
        )}

        <div className="field">
          <label htmlFor="administeredDate">
            Administered date <span className="required">*</span>
          </label>
          <input
            id="administeredDate"
            type="date"
            value={administeredDate}
            onChange={(e) => setAdministeredDate(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="withdrawalEndDate">
            Withdrawal end date <span className="required">*</span>
          </label>
          <input
            id="withdrawalEndDate"
            type="date"
            value={withdrawalEndDate}
            onChange={(e) => setWithdrawalEndDate(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Treatment'}
          </button>
        </div>
      </form>
    </div>
  )
}
