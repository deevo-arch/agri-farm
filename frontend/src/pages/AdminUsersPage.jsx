import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { getUsers } from '../api/userApi'
import { resolveErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'

const ROLE_TONES = { ADMIN: 'primary', VET: 'success', FARMER: 'neutral' }

export default function AdminUsersPage() {
  const { role } = useAuth()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flashMessage] = useState(location.state?.successMessage ?? '')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return getUsers()
      .then(setUsers)
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (role === 'ADMIN') load()
  }, [role, load])

  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) return <LoadingState label="Loading users…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="page">
      <div className="page__header">
        <h1>Users</h1>
        <Link to="/admin/users/new" className="btn btn--primary">
          + Create User
        </Link>
      </div>

      {flashMessage && (
        <div className="alert alert--success" role="status">
          {flashMessage}
        </div>
      )}

      {users.length === 0 ? (
        <EmptyState title="No users found" message="Create the first account to get started." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Name">{user.fullName}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">
                    <StatusBadge tone={ROLE_TONES[user.role] ?? 'neutral'}>{user.role}</StatusBadge>
                  </td>
                  <td data-label="" className="data-table__actions">
                    <Link to={`/admin/users/${user.id}/edit`} className="btn btn--ghost">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
