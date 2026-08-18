import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMyVetVisits } from '../api/vetVisitApi'
import { resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'

const STATUS_TONES = { REQUESTED: 'warning', ACCEPTED: 'primary', COMPLETED: 'success', REJECTED: 'danger' }
const GROUPS = [
  { status: 'REQUESTED', title: 'Requested' },
  { status: 'ACCEPTED', title: 'Accepted' },
  { status: 'COMPLETED', title: 'Completed' },
  { status: 'REJECTED', title: 'Rejected' },
]

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function VetVisitsPage() {
  const location = useLocation()
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flashMessage] = useState(location.state?.successMessage ?? '')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return getMyVetVisits()
      .then(setVisits)
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading vet visits…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  if (visits.length === 0) {
    return (
      <EmptyState
        title="No vet visits yet"
        message="Request a vet visit from an animal's detail page to get started."
      />
    )
  }

  return (
    <div className="page">
      <h1>Vet Visits</h1>

      {flashMessage && (
        <div className="alert alert--success" role="status">
          {flashMessage}
        </div>
      )}

      {GROUPS.map((group) => {
        const items = visits.filter((v) => v.status === group.status)
        if (items.length === 0) return null

        return (
          <section className="card" key={group.status}>
            <h2>{group.title}</h2>
            <ul className="vet-visit-list">
              {items.map((visit) => (
                <li key={visit.id} className="vet-visit-list__item">
                  <div>
                    <p className="vet-visit-list__title">
                      {visit.livestockTagNumber} — {visit.reason}
                    </p>
                    <p className="vet-visit-list__meta">
                      Preferred date: {formatDate(visit.preferredDate)}
                      {visit.vetName && <> · Vet: {visit.vetName}</>}
                    </p>
                  </div>
                  <div className="vet-visit-list__actions">
                    <StatusBadge tone={STATUS_TONES[visit.status] ?? 'neutral'}>{visit.status}</StatusBadge>
                    {visit.status === 'REQUESTED' && (
                      <Link to={`/vet-visits/${visit.id}/edit`} className="btn btn--ghost">
                        Edit
                      </Link>
                    )}
                    <Link to={`/vet-visits/${visit.id}`} className="btn btn--ghost">
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
