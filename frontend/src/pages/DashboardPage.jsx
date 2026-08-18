import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getLivestockByFarm } from '../api/livestockApi'
import { getMyVetVisits } from '../api/vetVisitApi'
import { resolveErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../auth/useAuth'
import { useMyFarms } from '../hooks/useMyFarms'

const ROLE_LABELS = {
  FARMER: 'Farmer',
  VET: 'Veterinarian',
  ADMIN: 'Administrator',
}

function DashboardHeader({ name, role }) {
  return (
    <header className="dashboard__header">
      <div>
        <h1>Welcome back, {name}</h1>
        <StatusBadge tone="primary">{ROLE_LABELS[role] ?? role}</StatusBadge>
      </div>
    </header>
  )
}

function PlaceholderDashboard({ name, role, cards }) {
  return (
    <div className="dashboard">
      <DashboardHeader name={name} role={role} />
      <section className="dashboard__grid">
        {cards.map((card) => (
          <article className="card" key={card.title}>
            <div className="card__header">
              <h2>{card.title}</h2>
              <StatusBadge tone="neutral">Placeholder</StatusBadge>
            </div>
            <p>{card.description}</p>
            <p className="card__note">Live data connects in a future update.</p>
          </article>
        ))}
      </section>
    </div>
  )
}

function FarmerDashboard({ name }) {
  const { farms, loading: farmsLoading, error: farmsError, primaryFarm } = useMyFarms()
  const [livestockCount, setLivestockCount] = useState(null)
  const [countLoading, setCountLoading] = useState(false)
  const [countError, setCountError] = useState('')
  const [vetVisits, setVetVisits] = useState(null)
  const [vetVisitsError, setVetVisitsError] = useState('')

  useEffect(() => {
    if (!primaryFarm) return
    setCountLoading(true)
    setCountError('')
    getLivestockByFarm(primaryFarm.id)
      .then((data) => setLivestockCount(data.length))
      .catch((err) => setCountError(resolveErrorMessage(err)))
      .finally(() => setCountLoading(false))
  }, [primaryFarm])

  useEffect(() => {
    getMyVetVisits()
      .then(setVetVisits)
      .catch((err) => setVetVisitsError(resolveErrorMessage(err)))
  }, [])

  const activeVisitCount = vetVisits?.filter((v) => v.status === 'REQUESTED' || v.status === 'ACCEPTED').length ?? 0

  return (
    <div className="dashboard">
      <DashboardHeader name={name} role="FARMER" />

      {farmsLoading && <LoadingState label="Loading your farm…" />}
      {!farmsLoading && farmsError && <ErrorState message={farmsError} />}

      {!farmsLoading && !farmsError && farms.length === 0 && (
        <EmptyState
          title="No farm registered yet"
          message="Create your farm to start managing livestock and milk batches."
          action={
            <Link to="/farms/new" className="btn btn--primary">
              + Create Farm
            </Link>
          }
        />
      )}

      {!farmsLoading && !farmsError && primaryFarm && (
        <section className="dashboard__grid">
          <article className="card">
            <div className="card__header">
              <h2>{primaryFarm.name}</h2>
              <StatusBadge tone="primary">Farm</StatusBadge>
            </div>
            <p>{primaryFarm.location}</p>
            {farms.length > 1 && (
              <p className="card__note">Showing your primary farm ({farms.length} total).</p>
            )}
            <Link to="/farm" className="btn btn--ghost">
              View Farm
            </Link>
          </article>

          <article className="card">
            <div className="card__header">
              <h2>Animals</h2>
            </div>
            {countLoading && <p>Loading…</p>}
            {!countLoading && countError && <p className="card__note">{countError}</p>}
            {!countLoading && !countError && livestockCount !== null && (
              <p className="dashboard__stat">
                {livestockCount === 0 ? 'No livestock registered yet.' : livestockCount}
              </p>
            )}
            <Link to="/livestock" className="btn btn--ghost">
              View Livestock
            </Link>
          </article>

          <article className="card">
            <div className="card__header">
              <h2>Milk Batches</h2>
            </div>
            <p>Record milk collection and view eligibility.</p>
            <Link to="/milk-batches" className="btn btn--ghost">
              View Milk Batches
            </Link>
          </article>

          <article className="card">
            <div className="card__header">
              <h2>Vet Visits</h2>
            </div>
            {vetVisitsError && <p className="card__note">{vetVisitsError}</p>}
            {!vetVisitsError && vetVisits === null && <p>Loading…</p>}
            {!vetVisitsError && vetVisits !== null && (
              <p className="dashboard__stat">
                {activeVisitCount === 0 ? 'No active requests' : activeVisitCount}
              </p>
            )}
            <Link to="/vet-visits" className="btn btn--ghost">
              View Vet Visits
            </Link>
          </article>
        </section>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { name, role } = useAuth()

  if (role === 'FARMER') return <FarmerDashboard name={name} />
  if (role === 'VET') return <Navigate to="/vet/dashboard" replace />
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <PlaceholderDashboard name={name} role={role} cards={[]} />
}
