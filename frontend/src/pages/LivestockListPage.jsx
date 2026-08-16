import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getLivestockByFarm } from '../api/livestockApi'
import { resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { useMyFarms } from '../hooks/useMyFarms'

const STATUS_TONES = { ACTIVE: 'success', SOLD: 'neutral', DECEASED: 'danger' }

export default function LivestockListPage() {
  const location = useLocation()
  const { farms, loading: farmsLoading, error: farmsError, primaryFarm } = useMyFarms()

  const [livestock, setLivestock] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [flashMessage] = useState(location.state?.successMessage ?? '')

  function loadLivestock(farmId) {
    setLoading(true)
    setError('')
    return getLivestockByFarm(farmId)
      .then(setLivestock)
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (primaryFarm) loadLivestock(primaryFarm.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryFarm])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return livestock.filter((animal) => {
      const matchesStatus = statusFilter === 'ALL' || animal.status === statusFilter
      const matchesSearch =
        !term ||
        animal.tagNumber.toLowerCase().includes(term) ||
        animal.species.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [livestock, searchTerm, statusFilter])

  if (farmsLoading) return <LoadingState label="Loading your farm…" />
  if (farmsError) return <ErrorState message={farmsError} />

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farm registered yet"
        message="You need a farm before you can manage livestock."
      />
    )
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Livestock</h1>
        <Link to="/livestock/new" className="btn btn--primary">
          + Add Livestock
        </Link>
      </div>

      {flashMessage && (
        <div className="alert alert--success" role="status">
          {flashMessage}
        </div>
      )}

      {farms.length > 1 && <p className="page__note">Showing animals for {primaryFarm.name}.</p>}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by tag number or species…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search livestock"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SOLD">Sold</option>
          <option value="DECEASED">Deceased</option>
        </select>
      </div>

      {loading && <LoadingState label="Loading livestock…" />}
      {!loading && error && (
        <ErrorState message={error} onRetry={() => loadLivestock(primaryFarm.id)} />
      )}

      {!loading && !error && livestock.length === 0 && (
        <EmptyState
          title="No livestock registered yet"
          message="Add your first animal to start tracking its health and milk eligibility."
          action={
            <Link to="/livestock/new" className="btn btn--primary">
              + Add Livestock
            </Link>
          }
        />
      )}

      {!loading && !error && livestock.length > 0 && filtered.length === 0 && (
        <EmptyState title="No matches" message="Try a different search term or status filter." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag Number</th>
                <th>Species</th>
                <th>Status</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((animal) => (
                <tr key={animal.id}>
                  <td data-label="Tag Number">{animal.tagNumber}</td>
                  <td data-label="Species">{animal.species}</td>
                  <td data-label="Status">
                    <StatusBadge tone={STATUS_TONES[animal.status] ?? 'neutral'}>
                      {animal.status}
                    </StatusBadge>
                  </td>
                  <td data-label="" className="data-table__actions">
                    <Link to={`/livestock/${animal.id}`} className="btn btn--ghost">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
