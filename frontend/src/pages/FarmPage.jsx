import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getLivestockByFarm } from '../api/livestockApi'
import { resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { useMyFarms } from '../hooks/useMyFarms'

export default function FarmPage() {
  const location = useLocation()
  const { farms, loading, error, primaryFarm } = useMyFarms()
  const [livestockCount, setLivestockCount] = useState(null)
  const [countError, setCountError] = useState('')
  const [flashMessage] = useState(location.state?.successMessage ?? '')

  useEffect(() => {
    if (!primaryFarm) return
    getLivestockByFarm(primaryFarm.id)
      .then((data) => setLivestockCount(data.length))
      .catch((err) => setCountError(resolveErrorMessage(err)))
  }, [primaryFarm])

  if (loading) return <LoadingState label="Loading your farm…" />
  if (error) return <ErrorState message={error} />

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farm registered yet"
        message="Create your farm to start managing livestock and milk batches."
        action={
          <Link to="/farms/new" className="btn btn--primary">
            + Create Farm
          </Link>
        }
      />
    )
  }

  return (
    <div className="page page--narrow">
      {flashMessage && (
        <div className="alert alert--success" role="status">
          {flashMessage}
        </div>
      )}

      <div className="page__header">
        <h1>{primaryFarm.name}</h1>
        <Link to="/farm/edit" className="btn btn--ghost">
          Edit Farm
        </Link>
      </div>

      <div className="card">
        <dl className="detail-list">
          <div>
            <dt>Location</dt>
            <dd>{primaryFarm.location}</dd>
          </div>
          <div>
            <dt>Livestock</dt>
            <dd>
              {countError ? '—' : livestockCount === null ? 'Loading…' : livestockCount}
            </dd>
          </div>
        </dl>
      </div>

      {farms.length > 1 && <p className="page__note">You have {farms.length} farms registered; showing your primary farm.</p>}

      <div className="quick-links">
        <Link to="/livestock" className="btn btn--ghost">
          View Livestock
        </Link>
        <Link to="/milk-batches" className="btn btn--ghost">
          View Milk Batches
        </Link>
      </div>
    </div>
  )
}
