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
      <header className="dashboard__header">
        <div>
          <h1>Vet Dashboard</h1>
          <p className="page__note">Welcome back, {name}.</p>
        </div>
      </header>

      {actionError && (
        <div className="alert alert--danger" role="alert">
          {actionError}
        </div>
      )}

      <section className="card">
        <h2>Pending Requests</h2>
        {pending.length === 0 ? (
          <EmptyState message="No pending vet visit requests right now." />
        ) : (
          <ul className="vet-visit-list">
            {pending.map((visit) => (
              <li key={visit.id} className="vet-visit-list__item">
                <div>
                  <p className="vet-visit-list__title">
                    {visit.farmName} — {visit.livestockTagNumber}
                  </p>
                  <p className="vet-visit-list__meta">
                    Preferred date: {formatDate(visit.preferredDate)} · Reason: {visit.reason}
                  </p>
                  {visit.notes && <p className="vet-visit-list__meta">Notes: {visit.notes}</p>}
                </div>
                <div className="vet-visit-list__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={actionPendingId === visit.id}
                    onClick={() => handleAccept(visit.id)}
                  >
                    Accept
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

      <section className="card">
        <h2>Accepted Visits</h2>
        {acceptedVisits.length === 0 ? (
          <EmptyState message="No visits currently accepted." />
        ) : (
          <ul className="vet-visit-list">
            {acceptedVisits.map((visit) => (
              <li key={visit.id} className="vet-visit-list__item">
                <div>
                  <p className="vet-visit-list__title">
                    {visit.farmName} — {visit.livestockTagNumber}
                  </p>
                  <p className="vet-visit-list__meta">Preferred date: {formatDate(visit.preferredDate)}</p>
                </div>
                <div className="vet-visit-list__actions">
                  <StatusBadge tone="primary">{visit.status}</StatusBadge>
                  <Link to={`/vet-visits/${visit.id}`} className="btn btn--ghost">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Completed Visits</h2>
        {completedVisits.length === 0 ? (
          <EmptyState message="No completed visits yet." />
        ) : (
          <ul className="vet-visit-list">
            {completedVisits.map((visit) => (
              <li key={visit.id} className="vet-visit-list__item">
                <div>
                  <p className="vet-visit-list__title">
                    {visit.farmName} — {visit.livestockTagNumber}
                  </p>
                  <p className="vet-visit-list__meta">Preferred date: {formatDate(visit.preferredDate)}</p>
                </div>
                <div className="vet-visit-list__actions">
                  <StatusBadge tone="success">{visit.status}</StatusBadge>
                  <Link to={`/vet-visits/${visit.id}`} className="btn btn--ghost">
                    Open
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
