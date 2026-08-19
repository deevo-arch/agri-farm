import { useState } from 'react'

const STAGES = [
  {
    step: 1,
    title: '🐄 Animal Health & Farm Origin',
    icon: '🐄',
    description: 'Livestock registered with RFID/Tag tags. Regular veterinary inspections & vaccination logging.',
    detail: 'Green Meadows Dairy Farm • Tag COW-101 • FMD Vaccinated',
    status: 'COMPLETED',
  },
  {
    step: 2,
    title: '🥛 Hygienic Milking & Pooling',
    icon: '🥛',
    description: 'Automated milking machines used under sanitary conditions. No withdrawal-restricted milk pooled.',
    detail: 'Daily Morning Batch • Cold Storage Tank #1',
    status: 'COMPLETED',
  },
  {
    step: 3,
    title: '🧪 Laboratory Safety & Quality Test',
    icon: '🧪',
    description: 'Instant testing for Fat %, SNF %, acidity, and zero antibiotic residues.',
    detail: 'Fat: 4.2% • SNF: 8.5% • Adulterants: ABSENT',
    status: 'COMPLETED',
  },
  {
    step: 4,
    title: '📦 Chilled Collection & Tanker Dispatch',
    icon: '📦',
    description: 'Milk maintained at optimal 3.8°C chilling temperature during transit.',
    detail: 'Insulated Refrigerated Transport Vehicle #GJ-01-AT-90',
    status: 'COMPLETED',
  },
  {
    step: 5,
    title: '🚚 Distribution & Processing Unit',
    icon: '🚚',
    description: 'Processing plant packaging with unique QR verification token generated.',
    detail: 'Batch Token: AGRI-TRACE-DEMO-TOKEN-8888',
    status: 'COMPLETED',
  },
  {
    step: 6,
    title: '📱 Consumer QR Scan Verification',
    icon: '📱',
    description: 'Consumers scan QR code on milk pouch to verify farm origin and safety certificate.',
    detail: '✓ VERIFIED MILK BATCH Certificate Issued',
    status: 'VERIFIED',
  },
]

export default function TraceabilityTimelinePage() {
  const [activeStep, setActiveStep] = useState(6)

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#054a29' }}>
          🛤️ End-to-End Supply Chain Traceability
        </h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          Transparent farm-to-glass tracking powered by MongoDB Atlas & Smart QR Verification
        </p>
      </div>

      {/* Visual Motto Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #054a29 0%, #065f46 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '20px',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(5, 74, 41, 0.2)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🛡️ AgriTrust Promise
          </span>
          <h2 style={{ fontSize: '1.5rem', color: 'white', margin: '4px 0 0' }}>
            “From Healthy Animals to Safe, Traceable Milk.”
          </h2>
        </div>
        <span className="badge badge--success" style={{ fontSize: '0.9rem', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none' }}>
          ✓ 100% Tamper-Evident Traceability
        </span>
      </div>

      {/* Interactive Stage Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {STAGES.map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActiveStep(s.step)}
            style={{
              padding: '12px 8px',
              borderRadius: '14px',
              border: activeStep === s.step ? '2px solid #059669' : '1px solid #e2e8f0',
              background: activeStep === s.step ? '#ecfdf5' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: activeStep === s.step ? '#054a29' : '#64748b' }}>
              Step {s.step}
            </span>
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      <div className="card" style={{ borderLeft: '6px solid #10b981', padding: '32px' }}>
        {(() => {
          const stage = STAGES.find((s) => s.step === activeStep)
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge--primary" style={{ fontSize: '0.85rem' }}>
                  Stage {stage.step} of 6
                </span>
                <span className="badge badge--success">✓ {stage.status}</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', color: '#054a29', marginBottom: '10px' }}>
                {stage.title}
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '16px', lineHeight: '1.6' }}>
                {stage.description}
              </p>
              <div style={{ background: '#f8faf4', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>REAL-TIME DATA AUDIT:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#054a29', marginTop: '4px' }}>
                  {stage.detail}
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
