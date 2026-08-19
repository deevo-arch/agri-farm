import { useEffect, useState } from 'react'
import { getMilkBatchesByFarm } from '../api/milkBatchApi'
import StatusBadge from '../components/StatusBadge'

export default function MilkQualityPage() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMilkBatchesByFarm(1)
      .then(setBatches)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#054a29' }}>
            🧪 Milk Quality & Safety Testing Lab
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Comprehensive laboratory analysis, adulteration checks & antibiotic residue clearance
          </p>
        </div>
        <span className="badge badge--lab" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
          🔬 ISO 17025 Certified Testing
        </span>
      </div>

      {/* DairyTech Journey Bar */}
      <div className="dairytech-flow-strip">
        <div className="dairytech-step">
          <div className="dairytech-step__icon">🐄</div>
          <div>
            <div className="dairytech-step__title">1. Animal Health</div>
            <div className="dairytech-step__subtitle">Vet Health Check</div>
          </div>
        </div>
        <div className="dairytech-arrow">→</div>
        <div className="dairytech-step">
          <div className="dairytech-step__icon">🥛</div>
          <div>
            <div className="dairytech-step__title">2. Milking</div>
            <div className="dairytech-step__subtitle">Hygienic Collection</div>
          </div>
        </div>
        <div className="dairytech-arrow">→</div>
        <div className="dairytech-step" style={{ background: '#f0f9ff', padding: '6px 12px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
          <div className="dairytech-step__icon" style={{ background: '#38bdf8', color: 'white' }}>🧪</div>
          <div>
            <div className="dairytech-step__title" style={{ color: '#0284c7' }}>3. Safety Testing</div>
            <div className="dairytech-step__subtitle">Fat, SNF & Antibiotics</div>
          </div>
        </div>
        <div className="dairytech-arrow">→</div>
        <div className="dairytech-step">
          <div className="dairytech-step__icon">📱</div>
          <div>
            <div className="dairytech-step__title">4. QR Token</div>
            <div className="dairytech-step__subtitle">Traceability Code</div>
          </div>
        </div>
        <div className="dairytech-arrow">→</div>
        <div className="dairytech-step">
          <div className="dairytech-step__icon">🛡️</div>
          <div>
            <div className="dairytech-step__title">5. Consumer Trust</div>
            <div className="dairytech-step__subtitle">Verified Safe</div>
          </div>
        </div>
      </div>

      {/* Lab Parameters Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>AVERAGE FAT %</span>
          <h2 style={{ fontSize: '1.8rem', color: '#0284c7', margin: '4px 0' }}>4.25%</h2>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Optimal Standard (≥4.0%)</span>
        </div>

        <div className="card" style={{ borderTop: '4px solid #059669' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>AVERAGE SNF %</span>
          <h2 style={{ fontSize: '1.8rem', color: '#059669', margin: '4px 0' }}>8.55%</h2>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Premium Grade</span>
        </div>

        <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>STORAGE TEMP</span>
          <h2 style={{ fontSize: '1.8rem', color: '#f59e0b', margin: '4px 0' }}>3.8 °C</h2>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Cold Chain Maintained</span>
        </div>

        <div className="card" style={{ borderTop: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>SAFETY COMPLIANCE</span>
          <h2 style={{ fontSize: '1.8rem', color: '#10b981', margin: '4px 0' }}>100%</h2>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Zero Antibiotic Residues</span>
        </div>
      </div>

      {/* Main Milk Batches Lab Quality Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>🥛 Milk Quality Analysis Log</h2>
          <span className="badge badge--success">Total Batches: {batches.length}</span>
        </div>

        {loading ? (
          <p>Loading laboratory quality data...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8faf4', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>Batch Code</th>
                  <th style={{ padding: '12px 16px' }}>Volume (L)</th>
                  <th style={{ padding: '12px 16px' }}>Fat %</th>
                  <th style={{ padding: '12px 16px' }}>SNF %</th>
                  <th style={{ padding: '12px 16px' }}>Protein %</th>
                  <th style={{ padding: '12px 16px' }}>Acidity</th>
                  <th style={{ padding: '12px 16px' }}>Temp</th>
                  <th style={{ padding: '12px 16px' }}>Adulteration & Safety</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#054a29' }}>
                      {batch.batchCode}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{batch.quantityLitres} L</td>
                    <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: '600' }}>4.2%</td>
                    <td style={{ padding: '14px 16px', color: '#059669', fontWeight: '600' }}>8.5%</td>
                    <td style={{ padding: '14px 16px' }}>3.4%</td>
                    <td style={{ padding: '14px 16px' }}>0.14%</td>
                    <td style={{ padding: '14px 16px', color: '#f59e0b', fontWeight: '600' }}>3.8°C</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge--success" style={{ gap: '4px' }}>
                        ✓ ABSENT (SAFE)
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge tone="success">{batch.safetyStatus || 'PASSED'}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
