import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  acceptVetVisit,
  completeVetVisit,
  getVetVisitById,
  rejectVetVisit,
} from '../api/vetVisitApi'
import {
  createMedication,
  createVaccination,
  getMedicationsByLivestock,
  getVaccinationsByLivestock,
} from '../api/treatmentApi'
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
  // Vaccination Form State
  const [vacName, setVacName] = useState('')
  const [vacAdminDate, setVacAdminDate] = useState('')
  const [vacWithdrawDate, setVacWithdrawDate] = useState('')
  const [vacError, setVacError] = useState('')
  const [vacSuccess, setVacSuccess] = useState('')
  const [vacSubmitting, setVacSubmitting] = useState(false)

  // Medication Form State
  const [medName, setMedName] = useState('')
  const [medDosage, setMedDosage] = useState('')
  const [medAdminDate, setMedAdminDate] = useState('')
  const [medWithdrawDate, setMedWithdrawDate] = useState('')
  const [medError, setMedError] = useState('')
  const [medSuccess, setMedSuccess] = useState('')
  const [medSubmitting, setMedSubmitting] = useState(false)

  const [existingVaccines, setExistingVaccines] = useState([])
  const [existingMeds, setExistingMeds] = useState([])

  const loadTreatments = useCallback(() => {
    if (!livestockId) return
    Promise.all([
      getVaccinationsByLivestock(livestockId),
      getMedicationsByLivestock(livestockId),
    ])
      .then(([vacs, meds]) => {
        setExistingVaccines(vacs)
        setExistingMeds(meds)
      })
      .catch(() => {})
  }, [livestockId])

  useEffect(() => {
    loadTreatments()
  }, [loadTreatments])

  async function handleVacSubmit(event) {
    event.preventDefault()
    setVacError('')
    setVacSuccess('')

    if (!vacName.trim() || !vacAdminDate || !vacWithdrawDate) {
      setVacError('Please fill in vaccine name, administered date, and withdrawal end date.')
      return
    }

    setVacSubmitting(true)
    try {
      await createVaccination({
        livestockId,
        vetVisitId,
        vaccineName: vacName.trim(),
        administeredDate: vacAdminDate,
        withdrawalEndDate: vacWithdrawDate,
      })
      setVacSuccess('Vaccination recorded successfully.')
      setVacName('')
      setVacAdminDate('')
      setVacWithdrawDate('')
      loadTreatments()
    } catch (err) {
      setVacError(resolveErrorMessage(err))
    } finally {
      setVacSubmitting(false)
    }
  }

  async function handleMedSubmit(event) {
    event.preventDefault()
    setMedError('')
    setMedSuccess('')

    if (!medName.trim() || !medAdminDate || !medWithdrawDate) {
      setMedError('Please fill in medication name, administered date, and withdrawal end date.')
      return
    }

    setMedSubmitting(true)
    try {
      await createMedication({
        livestockId,
        vetVisitId,
        medicationName: medName.trim(),
        dosage: medDosage.trim() || null,
        administeredDate: medAdminDate,
        withdrawalEndDate: medWithdrawDate,
      })
      setMedSuccess('Medication recorded successfully.')
      setMedName('')
      setMedDosage('')
      setMedAdminDate('')
      setMedWithdrawDate('')
      loadTreatments()
    } catch (err) {
      setMedError(resolveErrorMessage(err))
    } finally {
      setMedSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* CARD 1: VACCINATION FORM */}
      <div className="card">
        <h2>💉 Record Vaccination</h2>
        {vacSuccess && <div className="alert alert--success" role="status">{vacSuccess}</div>}
        {vacError && <div className="alert alert--danger" role="alert">{vacError}</div>}

        <form onSubmit={handleVacSubmit} noValidate>
          <div className="field">
            <label htmlFor="vacName">
              Vaccine name <span className="required">*</span>
            </label>
            <input
              id="vacName"
              type="text"
              value={vacName}
              onChange={(e) => setVacName(e.target.value)}
              disabled={vacSubmitting}
              placeholder="e.g. FMD Vaccine"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="vacAdminDate">
              Administered date <span className="required">*</span>
            </label>
            <input
              id="vacAdminDate"
              type="date"
              value={vacAdminDate}
              onChange={(e) => setVacAdminDate(e.target.value)}
              disabled={vacSubmitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="vacWithdrawDate">
              Withdrawal end date <span className="required">*</span>
            </label>
            <input
              id="vacWithdrawDate"
              type="date"
              value={vacWithdrawDate}
              onChange={(e) => setVacWithdrawDate(e.target.value)}
              disabled={vacSubmitting}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={vacSubmitting}>
              {vacSubmitting ? 'Saving…' : 'Save Vaccination'}
            </button>
          </div>
        </form>
      </div>

      {/* CARD 2: MEDICATION FORM */}
      <div className="card">
        <h2>💊 Record Medication</h2>
        {medSuccess && <div className="alert alert--success" role="status">{medSuccess}</div>}
        {medError && <div className="alert alert--danger" role="alert">{medError}</div>}

        <form onSubmit={handleMedSubmit} noValidate>
          <div className="field">
            <label htmlFor="medName">
              Medication name <span className="required">*</span>
            </label>
            <input
              id="medName"
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              disabled={medSubmitting}
              placeholder="e.g. Amoxicillin Antibiotic"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="medDosage">Dosage</label>
            <input
              id="medDosage"
              type="text"
              value={medDosage}
              onChange={(e) => setMedDosage(e.target.value)}
              placeholder="e.g. 10ml"
              disabled={medSubmitting}
            />
          </div>

          <div className="field">
            <label htmlFor="medAdminDate">
              Administered date <span className="required">*</span>
            </label>
            <input
              id="medAdminDate"
              type="date"
              value={medAdminDate}
              onChange={(e) => setMedAdminDate(e.target.value)}
              disabled={medSubmitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="medWithdrawDate">
              Withdrawal end date <span className="required">*</span>
            </label>
            <input
              id="medWithdrawDate"
              type="date"
              value={medWithdrawDate}
              onChange={(e) => setMedWithdrawDate(e.target.value)}
              disabled={medSubmitting}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={medSubmitting}>
              {medSubmitting ? 'Saving…' : 'Save Medication'}
            </button>
          </div>
        </form>
      </div>

      {/* CARD 3: RECORDED TREATMENTS LIST */}
      {(existingVaccines.length > 0 || existingMeds.length > 0) && (
        <div className="card">
          <h2>📋 Recorded Treatments for this Animal</h2>

          {existingVaccines.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#166534', marginBottom: '0.5rem' }}>
                💉 Vaccinations ({existingVaccines.length}):
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {existingVaccines.map((v) => (
                  <li key={v.id} style={{ marginBottom: '0.25rem' }}>
                    <strong>{v.vaccineName}</strong> — Administered: {v.administeredDate} | Withdrawal Until: {v.withdrawalEndDate}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {existingMeds.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                💊 Medications ({existingMeds.length}):
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {existingMeds.map((m) => (
                  <li key={m.id} style={{ marginBottom: '0.25rem' }}>
                    <strong>{m.medicationName}</strong> {m.dosage ? `(${m.dosage})` : ''} — Administered: {m.administeredDate} | Withdrawal Until: {m.withdrawalEndDate}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
