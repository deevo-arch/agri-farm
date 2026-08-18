import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getUsers } from '../api/userApi'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'

function countByRole(users) {
  return users.reduce((counts, user) => {
    counts[user.role] = (counts[user.role] ?? 0) + 1
    return counts
  }, {})
}

export default function AdminDashboardPage() {
  const { name, role } = useAuth()
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role !== 'ADMIN') return
    setLoading(true)
    setError('')
    getUsers()
      .then(setUsers)
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [role])

  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) return <LoadingState label="Loading admin dashboard…" />
  if (error) return <ErrorState message={error} />

  const counts = countByRole(users ?? [])

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="page__note">Welcome back, {name}.</p>
        </div>
      </header>

      <section className="dashboard__grid">
        <article className="card">
          <div className="card__header">
            <h2>Users</h2>
            <StatusBadge tone="primary">{users?.length ?? 0} total</StatusBadge>
          </div>
          <p>
            {counts.FARMER ?? 0} farmer(s) · {counts.VET ?? 0} vet(s) · {counts.ADMIN ?? 0} admin(s)
          </p>
          <Link to="/admin/users" className="btn btn--ghost">
            Manage Users
          </Link>
        </article>

        <article className="card">
          <div className="card__header">
            <h2>Create User</h2>
          </div>
          <p>Add a new account with any role — farmer, vet, or admin.</p>
          <Link to="/admin/users/new" className="btn btn--ghost">
            + Create User
          </Link>
        </article>

        <article className="card">
          <div className="card__header">
            <h2>Create Vet</h2>
          </div>
          <p>Provision a veterinarian account so they can log in and manage vet visits.</p>
          <Link to="/admin/users/new" className="btn btn--primary">
            + Create Vet Account
          </Link>
        </article>
      </section>
    </div>
  )
}
