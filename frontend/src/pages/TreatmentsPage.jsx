import { useCallback, useEffect, useState } from 'react'
import { getLivestockByFarm, getLivestockHealth } from '../api/livestockApi'
import { getMedicationsByLivestock, getVaccinationsByLivestock } from '../api/treatmentApi'
import { getVetVisitsByVet } from '../api/vetVisitApi'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { useMyFarms } from '../hooks/useMyFarms'

function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TreatmentsPage() {
  const { role, userId } = useAuth()
  if (role === 'VET') return <VetTreatmentsView vetId={userId} />
  return <FarmerTreatmentsView />
}

function FarmerTreatmentsView() {
  const { farms, loading: farmsLoading, error: farmsError, primaryFarm } = useMyFarms()
  const [vaccinations, setVaccinations] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('vaccinations')

  const load = useCallback((farmId) => {
    setLoading(true)
    setError('')
    return getLivestockByFarm(farmId)
      .then((animals) => Promise.all(animals.map((animal) => getLivestockHealth(animal.id))))
      .then((healthRecords) => {
        setVaccinations(healthRecords.flatMap((h) => h.vaccinations))
        setMedications(healthRecords.flatMap((h) => h.medications))
      })
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (primaryFarm) load(primaryFarm.id)
  }, [primaryFarm, load])

  if (farmsLoading) return <LoadingState label="Loading farm treatments…" />
  if (farmsError) return <ErrorState message={farmsError} />

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farm registered yet"
        message="Treatment history will appear once you have a farm and livestock."
      />
    )
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>💉 Treatment & Medical Log</h1>
          <p className="page__note">Official traceability records for vaccinations and active medications.</p>
        </div>
      </div>
      {farms.length > 1 && <p className="page__note">Showing treatments for {primaryFarm.name}.</p>}

      <TreatmentTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        loading={loading}
        error={error}
        onRetry={() => load(primaryFarm.id)}
        vaccinations={vaccinations}
        medications={medications}
      />
    </div>
  )
}

function VetTreatmentsView({ vetId }) {
  const [vaccinations, setVaccinations] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('vaccinations')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return getVetVisitsByVet(vetId)
      .then((visits) => {
        const livestockIds = [...new Set(visits.map((v) => v.livestockId))]
        return Promise.all(
          livestockIds.map((id) => Promise.all([getVaccinationsByLivestock(id), getMedicationsByLivestock(id)])),
        )
      })
      .then((pairs) => {
        const isMine = (record) => Number(record.administeredById) === Number(vetId)
        setVaccinations(pairs.flatMap(([v]) => v).filter(isMine))
        setMedications(pairs.flatMap(([, m]) => m).filter(isMine))
      })
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [vetId])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>💉 Administered Treatments</h1>
          <p className="page__note">Historical log of all vaccinations and medications administered by you.</p>
        </div>
      </div>

      <TreatmentTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        loading={loading}
        error={error}
        onRetry={load}
        vaccinations={vaccinations}
        medications={medications}
      />
    </div>
  )
}

function TreatmentTabs({ activeTab, onChange, loading, error, onRetry, vaccinations, medications }) {
  return (
    <>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'vaccinations' ? 'tab--active' : ''}`}
          onClick={() => onChange('vaccinations')}
        >
          💉 Vaccinations ({vaccinations.length})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'medications' ? 'tab--active' : ''}`}
          onClick={() => onChange('medications')}
        >
          💊 Medications ({medications.length})
        </button>
      </div>

      {loading && <LoadingState label="Loading treatment records…" />}
      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && activeTab === 'vaccinations' && <VaccinationsTable vaccinations={vaccinations} />}
      {!loading && !error && activeTab === 'medications' && <MedicationsTable medications={medications} />}
    </>
  )
}

function VaccinationsTable({ vaccinations }) {
  if (vaccinations.length === 0) {
    return (
      <EmptyState
        title="No vaccinations logged"
        message="Vaccination records will appear here once logged during a vet visit."
      />
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Animal Tag</th>
            <th>Vaccine Name</th>
            <th>Administered Date</th>
            <th>Withdrawal Until</th>
            <th>Administered Vet</th>
          </tr>
        </thead>
        <tbody>
          {vaccinations.map((v) => (
            <tr key={v.id}>
              <td data-label="Animal Tag">
                <StatusBadge tone="primary">🐄 {v.livestockTagNumber}</StatusBadge>
              </td>
              <td data-label="Vaccine Name">
                <strong>{v.vaccineName}</strong>
              </td>
              <td data-label="Administered Date">📅 {formatDate(v.administeredDate)}</td>
              <td data-label="Withdrawal Until">
                <StatusBadge tone="warning">⏳ {formatDate(v.withdrawalEndDate)}</StatusBadge>
              </td>
              <td data-label="Administered Vet">🩺 {v.administeredByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MedicationsTable({ medications }) {
  if (medications.length === 0) {
    return (
      <EmptyState
        title="No medications logged"
        message="Medication records will appear here once logged during a vet visit."
      />
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Animal Tag</th>
            <th>Medication Name</th>
            <th>Dosage</th>
            <th>Administered Date</th>
            <th>Withdrawal Until</th>
            <th>Administered Vet</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((m) => (
            <tr key={m.id}>
              <td data-label="Animal Tag">
                <StatusBadge tone="primary">🐄 {m.livestockTagNumber}</StatusBadge>
              </td>
              <td data-label="Medication Name">
                <strong>{m.medicationName}</strong>
              </td>
              <td data-label="Dosage">{m.dosage || '—'}</td>
              <td data-label="Administered Date">📅 {formatDate(m.administeredDate)}</td>
              <td data-label="Withdrawal Until">
                <StatusBadge tone="warning">⏳ {formatDate(m.withdrawalEndDate)}</StatusBadge>
              </td>
              <td data-label="Administered Vet">🩺 {m.administeredByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
