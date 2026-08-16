import { Link } from 'react-router-dom'

export default function QrCodesPage() {
  return (
    <div className="page page--narrow">
      <h1>QR Codes</h1>
      <div className="card">
        <p>
          QR codes are generated per milk batch. Open a batch from your Milk Batches list to
          generate or view its traceability QR code.
        </p>
        <Link to="/milk-batches" className="btn btn--primary">
          Go to Milk Batches
        </Link>
      </div>
    </div>
  )
}
