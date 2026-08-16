import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMilkBatchById } from '../api/milkBatchApi'
import { generateQrForMilkBatch } from '../api/qrApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

export default function MilkBatchQrPage() {
  const { id } = useParams()
  const [batch, setBatch] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    setNotFound(false)
    Promise.all([getMilkBatchById(id), generateQrForMilkBatch(id)])
      .then(([batchData, qrData]) => {
        setBatch(batchData)
        setQr(qrData)
      })
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState label="Generating QR code…" />
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
  if (!batch || !qr) return null

  return (
    <div className="page page--narrow">
      <Link to={`/milk-batches/${batch.id}`} className="back-link">
        ← Back to Batch
      </Link>

      <h1>QR Code</h1>
      <p className="page__note">Batch {batch.batchCode}</p>

      <div className="card qr-card">
        <img src={qr.qrImage} alt={`QR code for batch ${batch.batchCode}`} className="qr-image" />
        <p className="qr-card__token">
          Token: <code>{qr.token}</code>
        </p>

        <div className="quick-links">
          <Link to={`/trace/${qr.token}`} className="btn btn--primary">
            Open Public Traceability
          </Link>
          <a href={qr.qrImage} download={`qr-${batch.batchCode}.png`} className="btn btn--ghost">
            Download QR
          </a>
        </div>
      </div>
    </div>
  )
}
