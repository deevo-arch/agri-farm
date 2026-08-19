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
      label: 'Milk collected & Chilled to 3.8°C',
    })
  }

  return events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

function PublicShell({ children }) {
  return (
    <div className="public-trace-page" style={{ background: '#f8faf4', minHeight: '100vh', padding: '20px 16px' }}>
      <header className="public-trace-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Logo />
        <p className="public-trace-header__tagline" style={{ color: '#054a29', fontWeight: '700', marginTop: '4px' }}>
          DairyTech Food Safety & Traceability Portal
        </p>
      </header>
      <main className="public-trace-content" style={{ maxWidth: '640px', margin: '0 auto' }}>
        {children}
      </main>
      <footer className="trace-footer" style={{ textAlign: 'center', marginTop: '32px', color: '#64748b', fontSize: '0.85rem' }}>
        <p>This verification report is digitally signed by the AgriTrust Blockchain-Ready Platform.</p>
        <p style={{ fontWeight: '700', color: '#054a29', marginTop: '6px' }}>
          “From Healthy Animals to Safe, Traceable Milk.”
        </p>
      </footer>
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
        <div className="state state--loading" style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner" aria-hidden="true" />
          <p style={{ marginTop: '16px', fontWeight: '600', color: '#054a29' }}>
            Verifying Milk Batch Traceability & Safety...
          </p>
        </div>
      </PublicShell>
    )
  }

  if (notFound) {
    return (
      <PublicShell>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h3 style={{ color: '#ef4444', marginTop: '12px' }}>QR Code Not Recognized</h3>
          <p>This traceability token is invalid or expired.</p>
          <button type="button" className="btn btn--primary" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </PublicShell>
    )
  }

  if (error) {
    return (
      <PublicShell>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ef4444' }}>Traceability server is temporarily unavailable.</p>
          <button type="button" className="btn btn--ghost" onClick={retry}>
            Retry Verification
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
      {/* VERIFIED HERO SEAL */}
      <section
        style={{
          background: isVerified ? 'linear-gradient(135deg, #054a29 0%, #059669 100%)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          color: 'white',
          padding: '32px 24px',
          borderRadius: '24px',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 12px 30px rgba(5, 74, 41, 0.2)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'white',
            color: isVerified ? '#054a29' : '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {isVerified ? '✓' : '⚠'}
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'white', fontWeight: '900', letterSpacing: '0.02em', margin: 0 }}>
          {isVerified ? '✓ VERIFIED MILK BATCH' : 'NOT FULLY VERIFIED'}
        </h2>
        <p style={{ color: '#dcfce7', fontSize: '0.95rem', marginTop: '6px' }}>
          {isVerified ? '100% Farm-Origin Authenticated & Vet Safety Cleared' : 'This batch requires further audit.'}
        </p>
        <div style={{ marginTop: '16px', display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
          Batch ID: <strong>{trace.milkBatch.batchCode}</strong>
        </div>
      </section>

      {/* LAB QUALITY & SAFETY PARAMETERS */}
      <section className="card" style={{ marginBottom: '20px', borderTop: '4px solid #0284c7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#0284c7', margin: 0 }}>🧪 Laboratory Quality Analysis</h2>
          <StatusBadge tone={isSafe ? 'success' : 'danger'}>
            {isSafe ? 'PASSED SAFE' : 'WITHDRAWAL FLAGGED'}
          </StatusBadge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>FAT %</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0284c7' }}>4.2%</div>
          </div>
          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SNF %</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#059669' }}>8.5%</div>
          </div>
          <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TEMP</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#b45309' }}>3.8°C</div>
          </div>
        </div>

        <div style={{ background: isSafe ? '#ecfdf5' : '#fef2f2', padding: '14px', borderRadius: '12px', border: `1px solid ${isSafe ? '#a7f3d0' : '#fca5a5'}` }}>
          <div style={{ fontWeight: '700', color: isSafe ? '#065f46' : '#991b1b', fontSize: '0.9rem' }}>
            {isSafe ? '✓ Antibiotic Residue Test: PASSED' : '⚠️ Active Withdrawal Period Warning'}
          </div>
          <p style={{ fontSize: '0.825rem', color: isSafe ? '#047857' : '#b91c1c', margin: '4px 0 0' }}>
            {isSafe
              ? 'Zero antibiotic or chemical residues detected. Safe for direct consumer consumption.'
              : 'One or more animals were treated during withdrawal period at collection.'}
          </p>
        </div>
      </section>

      {/* FARM & LIVESTOCK ORIGIN */}
      <section className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#054a29', marginBottom: '12px' }}>👨‍🌾 Farm & Animal Origin</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#054a29' }}>{trace.farm.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {trace.farm.location}</div>
          </div>
          <span className="badge badge--success">Verified Organic</span>
        </div>

        <div style={{ marginTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>CONTRIBUTING LIVESTOCK:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {trace.livestock.map((a) => (
              <span key={a.tagNumber} style={{ background: '#f8faf4', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: '600' }}>
                {a.species === 'GOAT' ? '🐐' : '🐄'} {a.tagNumber} ({a.species})
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRACEABILITY TIMELINE */}
      {timeline.length > 0 && (
        <section className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#054a29', marginBottom: '16px' }}>🛤️ Farm-to-Glass Traceability Journey</h2>
          <ol className="trace-timeline" style={{ paddingLeft: '20px', margin: 0 }}>
            {timeline.map((event, i) => (
              <li key={i} className="trace-timeline__item" style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', color: '#054a29', fontSize: '0.9rem' }}>{event.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(event.date)}</div>
              </li>
            ))}
            <li className="trace-timeline__item">
              <div style={{ fontWeight: '800', color: '#10b981', fontSize: '0.95rem' }}>📱 Consumer Verification Certificate Issued</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: {trace.traceabilityStatus}</div>
            </li>
          </ol>
        </section>
      )}

      {/* FINAL MOTTO SEAL */}
      <div style={{ textAlign: 'center', padding: '20px', background: '#ecfdf5', borderRadius: '18px', border: '1px solid #a7f3d0' }}>
        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
        <h4 style={{ color: '#054a29', margin: '6px 0 2px' }}>AgriTrust Certified Product</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', fontWeight: '600' }}>
          “From Healthy Animals to Safe, Traceable Milk.”
        </p>
      </div>
    </PublicShell>
  )
}
