import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicTrace } from '../api/publicTraceApi'
import { getErrorStatus, resolveErrorMessage } from '../api/errors'
import Logo from '../components/Logo'
import StatusBadge from '../components/StatusBadge'

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function buildTimeline(trace) {
  const events = []

  trace.vaccinations.forEach((v) => {
    events.push({
      date: v.administeredDate,
      label: `Vaccination — ${v.vaccineName} (${v.livestockTagNumber})`,
    })
  })

  trace.medications.forEach((m) => {
    events.push({
      date: m.administeredDate,
      label: `Medication — ${m.medicationName} (${m.livestockTagNumber})`,
    })
  })

  if (trace.milkBatch.collectionDate) {
    events.push({
      date: trace.milkBatch.collectionDate,
      label: 'Milk collected',
    })
  }

  return events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

function PublicShell({ children }) {
  return (
    <div className="public-trace-page">
      <header className="public-trace-header">
        <Logo />
        <p className="public-trace-header__tagline">Livestock Traceability</p>
      </header>
      <main className="public-trace-content">{children}</main>
    </div>
  )
}

export default function PublicTracePage() {
  const { token } = useParams()
  const [trace, setTrace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setError('')
    getPublicTrace(token)
      .then(setTrace)
      .catch((err) => {
        if (getErrorStatus(err) === 404) setNotFound(true)
        else setError(resolveErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [token, attempt])

  const timeline = useMemo(() => (trace ? buildTimeline(trace) : []), [trace])

  if (loading) {
    return (
      <PublicShell>
        <div className="state state--loading">
          <span className="spinner" aria-hidden="true" />
          <p>Verifying product traceability…</p>
        </div>
      </PublicShell>
    )
  }

  if (notFound) {
    return (
      <PublicShell>
        <div className="state state--empty">
          <h3>QR code not recognized</h3>
          <p>This traceability link is invalid or no longer available.</p>
          <button type="button" className="btn btn--ghost" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </PublicShell>
    )
  }

  if (error) {
    return (
      <PublicShell>
        <div className="state state--error" role="alert">
          <p>Traceability information is temporarily unavailable.</p>
          <button type="button" className="btn btn--ghost" onClick={retry}>
            Try Again
          </button>
        </div>
      </PublicShell>
    )
  }

  if (!trace) return null

  const isVerified = trace.verified && trace.traceabilityStatus === 'VERIFIED'
  const isSafe = trace.milkSafety.eligibleAtCollection

  return (
    <PublicShell>
      <section className={`trace-hero ${isVerified ? 'trace-hero--verified' : 'trace-hero--unverified'}`}>
        <span className="trace-hero__icon" aria-hidden="true">
          {isVerified ? '✓' : '⚠'}
        </span>
        <h2>{isVerified ? 'Verified' : 'Not Fully Verified'}</h2>
        <p>{isVerified ? 'Milk batch successfully traced' : 'This product could not be fully verified.'}</p>
        {trace.milkBatch.batchCode && (
          <p className="trace-hero__batch">
            Batch <code>{trace.milkBatch.batchCode}</code>
          </p>
        )}
        <p className="trace-hero__status-line">Traceability status: {trace.traceabilityStatus}</p>
      </section>

      <section className="card">
        <h2>Milk Batch</h2>
        <dl className="detail-list">
          <div>
            <dt>Batch Code</dt>
            <dd>{trace.milkBatch.batchCode}</dd>
          </div>
          <div>
            <dt>Collected</dt>
            <dd>{formatDate(trace.milkBatch.collectionDate)}</dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd>{trace.milkBatch.quantityLitres} L</dd>
          </div>
        </dl>
      </section>

      <section className={`card milk-safety milk-safety--${isSafe ? 'safe' : 'unsafe'}`}>
        <div className="card__header">
          <h2>{isSafe ? '✓ Milk Safety' : '⚠ Milk Safety'}</h2>
          <StatusBadge tone={isSafe ? 'success' : 'danger'}>{trace.milkSafety.status}</StatusBadge>
        </div>
        <p className="milk-safety__status">
          {isSafe ? 'Eligible for collection' : 'Withdrawal restriction detected'}
        </p>
        <p className="milk-safety__detail">
          {isSafe
            ? 'No active withdrawal restriction was detected for the animals at collection.'
            : 'One or more animals were within an active withdrawal period at the time of collection.'}
        </p>
      </section>

      <section className="card">
        <h2>Farm</h2>
        <p className="farm-name">{trace.farm.name}</p>
        <p className="farm-location">{trace.farm.location}</p>
      </section>

      <section className="card">
        <h2>Animals contributing to this batch</h2>
        {trace.livestock.length === 0 ? (
          <p>No livestock records are linked to this batch.</p>
        ) : (
          <div className="animal-grid">
            {trace.livestock.map((animal) => (
              <div className="animal-card" key={animal.tagNumber}>
                <span className="animal-card__tag">{animal.tagNumber}</span>
                <span className="animal-card__species">{animal.species}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Vaccination History</h2>
        {trace.vaccinations.length === 0 ? (
          <p>No vaccination records available for this batch.</p>
        ) : (
          <ul className="record-list">
            {trace.vaccinations.map((v, i) => (
              <li key={i} className="record-list__item">
                <p className="record-list__title">{v.vaccineName}</p>
                <p className="record-list__meta">{formatDate(v.administeredDate)}</p>
                <p className="record-list__meta">Veterinarian: {v.vetName}</p>
                <p className="record-list__meta">Animal: {v.livestockTagNumber}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Medication History</h2>
        {trace.medications.length === 0 ? (
          <p>No medication records available for this batch.</p>
        ) : (
          <ul className="record-list">
            {trace.medications.map((m, i) => (
              <li key={i} className="record-list__item">
                <p className="record-list__title">{m.medicationName}</p>
                <p className="record-list__meta">{formatDate(m.administeredDate)}</p>
                <p className="record-list__meta">Veterinarian: {m.vetName}</p>
                <p className="record-list__meta">Animal: {m.livestockTagNumber}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {timeline.length > 0 && (
        <section className="card">
          <h2>Timeline</h2>
          <ol className="trace-timeline">
            {timeline.map((event, i) => (
              <li key={i} className="trace-timeline__item">
                <span className="trace-timeline__dot" aria-hidden="true" />
                <div>
                  <p className="trace-timeline__label">{event.label}</p>
                  <p className="trace-timeline__date">{formatDate(event.date)}</p>
                </div>
              </li>
            ))}
            <li className="trace-timeline__item">
              <span className="trace-timeline__dot trace-timeline__dot--final" aria-hidden="true" />
              <div>
                <p className="trace-timeline__label">QR Traceability</p>
                <p className="trace-timeline__date">{trace.traceabilityStatus}</p>
              </div>
            </li>
          </ol>
        </section>
      )}

      <footer className="trace-footer">
        <p>This information is provided by the AgriTrust livestock traceability system.</p>
      </footer>
    </PublicShell>
  )
}
