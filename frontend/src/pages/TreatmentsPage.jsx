import { useCallback, useEffect, useState } from 'react'
import { getLivestockByFarm, getLivestockHealth } from '../api/livestockApi'
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

export default function TreatmentsPage() {
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

  if (farmsLoading) return <LoadingState label="Loading your farm…" />
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
      <h1>Treatments</h1>
      {farms.length > 1 && <p className="page__note">Showing treatments for {primaryFarm.name}.</p>}

      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'vaccinations' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('vaccinations')}
        >
          Vaccinations
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'medications' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('medications')}
        >
          Medications
        </button>
      </div>

      {loading && <LoadingState label="Loading treatment history…" />}
      {!loading && error && (
        <ErrorState message={error} onRetry={() => load(primaryFarm.id)} />
      )}

      {!loading && !error && activeTab === 'vaccinations' && (
        <VaccinationsTable vaccinations={vaccinations} />
      )}

      {!loading && !error && activeTab === 'medications' && (
        <MedicationsTable medications={medications} />
      )}
    </div>
  )
}

function VaccinationsTable({ vaccinations }) {
  if (vaccinations.length === 0) {
    return (
      <EmptyState
        title="No vaccinations yet"
        message="Vaccination records will appear here once a vet logs one."
      />
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Animal</th>
            <th>Vaccine</th>
            <th>Administered</th>
            <th>Withdrawal Until</th>
            <th>Vet</th>
          </tr>
        </thead>
        <tbody>
          {vaccinations.map((v) => (
            <tr key={v.id}>
              <td data-label="Animal">{v.livestockTagNumber}</td>
              <td data-label="Vaccine">{v.vaccineName}</td>
              <td data-label="Administered">{formatDate(v.administeredDate)}</td>
              <td data-label="Withdrawal Until">{formatDate(v.withdrawalEndDate)}</td>
              <td data-label="Vet">{v.administeredByName}</td>
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
        title="No medications yet"
        message="Medication records will appear here once a vet logs one."
      />
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Animal</th>
            <th>Medication</th>
            <th>Administered</th>
            <th>Withdrawal Until</th>
            <th>Vet</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((m) => (
            <tr key={m.id}>
              <td data-label="Animal">{m.livestockTagNumber}</td>
              <td data-label="Medication">{m.medicationName}</td>
              <td data-label="Administered">{formatDate(m.administeredDate)}</td>
              <td data-label="Withdrawal Until">{formatDate(m.withdrawalEndDate)}</td>
              <td data-label="Vet">{m.administeredByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
