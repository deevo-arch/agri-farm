import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLivestockHealth } from '../api/livestockApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'

const STATUS_TONES = { ACTIVE: 'success', SOLD: 'neutral', DECEASED: 'danger' }

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function latestWithdrawalEndDate(vaccinations, medications) {
  const dates = [...vaccinations, ...medications].map((t) => t.withdrawalEndDate).filter(Boolean)
  if (dates.length === 0) return null
  return dates.reduce((max, d) => (d > max ? d : max))
}

export default function LivestockDetailPage() {
  const { id } = useParams()
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    setNotFound(false)
    return getLivestockHealth(id)
      .then(setHealth)
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

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
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!health) return null

  const { livestock, vaccinations, medications, vetVisits, underActiveWithdrawal } = health
  const hasTreatmentHistory = vaccinations.length > 0 || medications.length > 0
  const untilDate = underActiveWithdrawal ? latestWithdrawalEndDate(vaccinations, medications) : null

  return (
    <div className="page">
      <Link to="/livestock" className="back-link">
        ← Back to Livestock
      </Link>

      <div className="page__header">
        <h1>{livestock.tagNumber}</h1>
        <StatusBadge tone={STATUS_TONES[livestock.status] ?? 'neutral'}>
          {livestock.status}
        </StatusBadge>
      </div>

      <section className="detail-grid">
        <div className="card">
          <h2>Animal Details</h2>
          <dl className="detail-list">
            <div>
              <dt>Species</dt>
              <dd>{livestock.species}</dd>
            </div>
            <div>
              <dt>Date of birth</dt>
              <dd>{formatDate(livestock.dateOfBirth)}</dd>
            </div>
            <div>
              <dt>Farm</dt>
              <dd>{livestock.farmName}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2>Health Overview</h2>
          {underActiveWithdrawal ? (
            <div className="withdrawal-status withdrawal-status--active">
              <p>⚠ Withdrawal active</p>
              {untilDate && <p className="withdrawal-status__detail">Until {formatDate(untilDate)}</p>}
            </div>
          ) : hasTreatmentHistory ? (
            <div className="withdrawal-status withdrawal-status--ok">
              <p>✓ Withdrawal completed</p>
            </div>
          ) : (
            <div className="withdrawal-status withdrawal-status--ok">
              <p>✓ No active withdrawal</p>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Vaccinations</h2>
        {vaccinations.length === 0 ? (
          <EmptyState message="No vaccination records yet." />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Administered</th>
                  <th>Withdrawal Until</th>
                  <th>Vet</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map((v) => (
                  <tr key={v.id}>
                    <td data-label="Vaccine">{v.vaccineName}</td>
                    <td data-label="Administered">{formatDate(v.administeredDate)}</td>
                    <td data-label="Withdrawal Until">{formatDate(v.withdrawalEndDate)}</td>
                    <td data-label="Vet">{v.administeredByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Medications</h2>
        {medications.length === 0 ? (
          <EmptyState message="No medication records yet." />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Administered</th>
                  <th>Withdrawal Until</th>
                  <th>Vet</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((m) => (
                  <tr key={m.id}>
                    <td data-label="Medication">{m.medicationName}</td>
                    <td data-label="Dosage">{m.dosage || '—'}</td>
                    <td data-label="Administered">{formatDate(m.administeredDate)}</td>
                    <td data-label="Withdrawal Until">{formatDate(m.withdrawalEndDate)}</td>
                    <td data-label="Vet">{m.administeredByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Vet Visits</h2>
        {vetVisits.length === 0 ? (
          <EmptyState message="No vet visits recorded yet." />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vet</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {vetVisits.map((v) => (
                  <tr key={v.id}>
                    <td data-label="Date">{formatDate(v.visitDate)}</td>
                    <td data-label="Vet">{v.vetName}</td>
                    <td data-label="Notes">{v.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
