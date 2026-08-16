import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import ComingSoonPage from './pages/ComingSoonPage'
import DashboardPage from './pages/DashboardPage'
import LivestockDetailPage from './pages/LivestockDetailPage'
import LivestockFormPage from './pages/LivestockFormPage'
import LivestockListPage from './pages/LivestockListPage'
import LoginPage from './pages/LoginPage'
import PublicTracePage from './pages/PublicTracePage'
import RegisterPage from './pages/RegisterPage'
import TreatmentsPage from './pages/TreatmentsPage'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      <Route path="/trace/:token" element={<PublicTracePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/livestock" element={<LivestockListPage />} />
          <Route path="/livestock/new" element={<LivestockFormPage />} />
          <Route path="/livestock/:id" element={<LivestockDetailPage />} />
          <Route path="/treatments" element={<TreatmentsPage />} />
          <Route path="/milk-batches" element={<ComingSoonPage title="Milk Batches" />} />
          <Route
            path="/milk-batches/:id/qr"
            element={<ComingSoonPage title="Milk Batch QR" />}
          />
          <Route path="/qr-codes" element={<ComingSoonPage title="QR Codes" />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}
