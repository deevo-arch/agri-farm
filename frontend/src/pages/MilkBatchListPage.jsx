import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMilkBatchesByFarm } from '../api/milkBatchApi'
import { resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { useMyFarms } from '../hooks/useMyFarms'

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function MilkBatchListPage() {
  const { farms, loading: farmsLoading, error: farmsError, primaryFarm } = useMyFarms()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function load(farmId) {
    setLoading(true)
    setError('')
    return getMilkBatchesByFarm(farmId)
      .then(setBatches)
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (primaryFarm) load(primaryFarm.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryFarm])

  if (farmsLoading) return <LoadingState label="Loading your farm…" />
  if (farmsError) return <ErrorState message={farmsError} />

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farm registered yet"
        message="Create your farm to start recording milk batches."
        action={
          <Link to="/farms/new" className="btn btn--primary">
            + Create Farm
          </Link>
        }
      />
    )
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Milk Batches</h1>
        <Link to="/milk-batches/new" className="btn btn--primary">
          + Create Milk Batch
        </Link>
      </div>

      {farms.length > 1 && <p className="page__note">Showing batches for {primaryFarm.name}.</p>}

      {loading && <LoadingState label="Loading milk batches…" />}
      {!loading && error && (
        <ErrorState message={error} onRetry={() => load(primaryFarm.id)} />
      )}

      {!loading && !error && batches.length === 0 && (
        <EmptyState
          title="No milk batches yet"
          message="Record your first milk collection to start tracking eligibility and traceability."
          action={
            <Link to="/milk-batches/new" className="btn btn--primary">
              + Create Milk Batch
            </Link>
          }
        />
      )}

      {!loading && !error && batches.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Collection Date</th>
                <th>Quantity (L)</th>
                <th>Animals</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td data-label="Batch Code">{batch.batchCode}</td>
                  <td data-label="Collection Date">{formatDate(batch.collectionDate)}</td>
                  <td data-label="Quantity (L)">{batch.quantityLitres}</td>
                  <td data-label="Animals">{batch.livestockIds.length}</td>
                  <td data-label="" className="data-table__actions">
                    <span className="action-group">
                      <Link to={`/milk-batches/${batch.id}`} className="btn btn--ghost">
                        View
                      </Link>
                      <Link to={`/milk-batches/${batch.id}/qr`} className="btn btn--ghost">
                        QR
                      </Link>
                    </span>
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
