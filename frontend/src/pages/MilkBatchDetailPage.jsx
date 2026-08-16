import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getMilkBatchById } from '../api/milkBatchApi'
import { getLivestockByFarm } from '../api/livestockApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function MilkBatchDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const [batch, setBatch] = useState(null)
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [flashMessage] = useState(location.state?.successMessage ?? '')

  useEffect(() => {
    setLoading(true)
    setError('')
    setNotFound(false)
    getMilkBatchById(id)
      .then((data) => {
        setBatch(data)
        return getLivestockByFarm(data.farmId)
      })
      .then(setAnimals)
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState label="Loading milk batch…" />
  if (notFound) {
    return (
      <EmptyState
        title="Milk batch not found"
        message="This batch may have been removed or the link is incorrect."
        action={
          <Link to="/milk-batches" className="btn btn--ghost">
            Back to Milk Batches
          </Link>
        }
      />
    )
  }
  if (error) return <ErrorState message={error} />
  if (!batch) return null

  const batchAnimals = animals.filter((a) => batch.livestockIds.includes(a.id))

  return (
    <div className="page page--narrow">
      <Link to="/milk-batches" className="back-link">
        ← Back to Milk Batches
      </Link>

      {flashMessage && (
        <div className="alert alert--success" role="status">
          {flashMessage}
        </div>
      )}

      <h1>{batch.batchCode}</h1>

      <div className="card">
        <dl className="detail-list">
          <div>
            <dt>Collection date</dt>
            <dd>{formatDate(batch.collectionDate)}</dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd>{batch.quantityLitres} L</dd>
          </div>
          <div>
            <dt>Farm</dt>
            <dd>{batch.farmName}</dd>
          </div>
          {batch.collectedByName && (
            <div>
              <dt>Collected by</dt>
              <dd>{batch.collectedByName}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="card">
        <h2>Livestock</h2>
        {batchAnimals.length === 0 ? (
          <p>{batch.livestockIds.length} animal(s) contributed to this batch.</p>
        ) : (
          <ul className="tag-list">
            {batchAnimals.map((animal) => (
              <li key={animal.id}>
                {animal.tagNumber} ({animal.species})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="quick-links">
        <Link to={`/milk-batches/${batch.id}/qr`} className="btn btn--primary">
          Generate / View QR
        </Link>
      </div>
    </div>
  )
}
