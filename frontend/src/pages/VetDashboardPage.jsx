import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { acceptVetVisit, getPendingVetVisits, getVetVisitsByVet, rejectVetVisit } from '../api/vetVisitApi'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function VetDashboardHeader({ name }) {
  return (
    <div className="dashboard-hero">
      <div className="dashboard-hero__content">
        <div className="dashboard-hero__badge">
          <span className="pulse-dot"></span> Certified Vet Practitioner
        </div>
        <h1>Welcome back, {name} 🩺</h1>
        <p className="dashboard-hero__sub">
          Veterinary Care Portal • Manage farmer treatment requests, vaccinations & medical records
        </p>
      </div>

      <div className="dashboard-hero__graphic" aria-hidden="true">
        <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M70 15C45 15 25 35 25 60C25 85 45 100 70 100C95 100 115 85 115 60C115 35 95 15 70 15Z" fill="white" fillOpacity="0.08" />
          <path d="M60 40H80V60H100V80H80V100H60V80H40V60H60V40Z" fill="#34D399" fillOpacity="0.35" />
        </svg>
      </div>

      <div className="dashboard-hero__role">
        <StatusBadge tone="primary">Veterinarian</StatusBadge>
      </div>
    </div>
  )
}

export default function VetDashboardPage() {
  const { name, role, userId } = useAuth()

  const [pending, setPending] = useState([])
  const [assigned, setAssigned] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionPendingId, setActionPendingId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return Promise.all([getPendingVetVisits(), getVetVisitsByVet(userId)])
      .then(([pendingVisits, myVisits]) => {
        setPending(pendingVisits)
        setAssigned(myVisits)
      })
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    if (role === 'VET' || role === 'ADMIN') load()
  }, [role, load])

  if (role !== 'VET' && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  async function handleAccept(id) {
    setActionError('')
    setActionPendingId(id)
    try {
      await acceptVetVisit(id)
      await load()
    } catch (err) {
      setActionError(resolveErrorMessage(err))
    } finally {
      setActionPendingId(null)
    }
  }

  async function handleReject(id) {
    setActionError('')
    setActionPendingId(id)
    try {
      await rejectVetVisit(id)
      await load()
    } catch (err) {
      setActionError(resolveErrorMessage(err))
    } finally {
      setActionPendingId(null)
    }
  }

  if (loading) return <LoadingState label="Loading vet dashboard…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const acceptedVisits = assigned.filter((v) => v.status === 'ACCEPTED')
  const completedVisits = assigned.filter((v) => v.status === 'COMPLETED')

  return (
    <div className="dashboard">
      <VetDashboardHeader name={name} />

      {actionError && (
        <div className="alert alert--danger" role="alert">
          {actionError}
        </div>
      )}

      {/* Vet Summary Stat Grid */}
      <section className="dashboard__grid" style={{ marginBottom: '28px' }}>
        <article className="dashboard__stat-card dashboard__stat-card--vet">
          <div className="stat-card__watermark" aria-hidden="true">📩</div>
          <div className="card__header">
            <h2>📩 Pending Requests</h2>
            <StatusBadge tone="warning">{pending.length} Pending</StatusBadge>
          </div>
          <p className="dashboard__stat">
            {pending.length} <span className="stat-unit">Farmer Requests</span>
          </p>
        </article>

        <article className="dashboard__stat-card dashboard__stat-card--vet">
          <div className="stat-card__watermark" aria-hidden="true">🩺</div>
          <div className="card__header">
            <h2>🩺 Active Visits</h2>
            <StatusBadge tone="primary">{acceptedVisits.length} Accepted</StatusBadge>
          </div>
          <p className="dashboard__stat">
            {acceptedVisits.length} <span className="stat-unit">In Progress</span>
          </p>
        </article>

        <article className="dashboard__stat-card dashboard__stat-card--vet">
          <div className="stat-card__watermark" aria-hidden="true">✅</div>
          <div className="card__header">
            <h2>✅ Completed Visits</h2>
            <StatusBadge tone="success">{completedVisits.length} Completed</StatusBadge>
          </div>
          <p className="dashboard__stat">
            {completedVisits.length} <span className="stat-unit">Finished</span>
          </p>
        </article>
      </section>

      {/* Pending Requests Section */}
      <section className="card" style={{ marginBottom: '24px' }}>
        <div className="card__header" style={{ marginBottom: '16px' }}>
          <h2>📋 Pending Farmer Requests</h2>
          <span className="card__note">Accept to start recording treatment data</span>
        </div>
        {pending.length === 0 ? (
          <EmptyState message="No pending vet visit requests right now." />
        ) : (
          <ul className="vet-visit-list">
            {pending.map((visit) => (
              <li key={visit.id} className="vet-visit-list__item">
                <div>
                  <p className="vet-visit-list__title">
                    🏡 {visit.farmName} — 🐄 {visit.livestockTagNumber}
                  </p>
                  <p className="vet-visit-list__meta">
                    📅 Preferred date: {formatDate(visit.preferredDate)} · 💡 Reason: {visit.reason}
                  </p>
                  {visit.notes && <p className="vet-visit-list__meta">📝 Notes: {visit.notes}</p>}
                </div>
                <div className="vet-visit-list__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={actionPendingId === visit.id}
                    onClick={() => handleAccept(visit.id)}
                  >
                    Accept Visit
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={actionPendingId === visit.id}
                    onClick={() => handleReject(visit.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Accepted Visits Section */}
      <section className="card" style={{ marginBottom: '24px' }}>
        <div className="card__header" style={{ marginBottom: '16px' }}>
          <h2>💉 Accepted Visits (In Progress)</h2>
          <span className="card__note">Click 'Open' to log vaccination and medication records</span>
        </div>
        {acceptedVisits.length === 0 ? (
          <EmptyState message="No visits currently accepted." />
        ) : (
          <ul className="vet-visit-list">
            {acceptedVisits.map((visit) => (
              <li key={visit.id} className="vet-visit-list__item">
                <div>
                  <p className="vet-visit-list__title">
                    🏡 {visit.farmName} — 🐄 {visit.livestockTagNumber}
                  </p>
                  <p className="vet-visit-list__meta">📅 Preferred date: {formatDate(visit.preferredDate)}</p>
                </div>
                <div className="vet-visit-list__actions">
                  <StatusBadge tone="primary">{visit.status}</StatusBadge>
                  <Link to={`/vet-visits/${visit.id}`} className="btn btn--primary">
                    Open & Record Treatment ➔
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Completed Visits Section */}
      <section className="card">
        <div className="card__header" style={{ marginBottom: '16px' }}>
          <h2>✅ Completed Visit History</h2>
        </div>
        {completedVisits.length === 0 ? (
          <EmptyState message="No completed visits yet." />
        ) : (
          <ul className="vet-visit-list">
            {completedVisits.map((visit) => (
              <li key={visit.id} className="vet-visit-list__item">
                <div>
                  <p className="vet-visit-list__title">
                    🏡 {visit.farmName} — 🐄 {visit.livestockTagNumber}
                  </p>
                  <p className="vet-visit-list__meta">📅 Preferred date: {formatDate(visit.preferredDate)}</p>
                </div>
                <div className="vet-visit-list__actions">
                  <StatusBadge tone="success">{visit.status}</StatusBadge>
                  <Link to={`/vet-visits/${visit.id}`} className="btn btn--ghost">
                    View Record
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
