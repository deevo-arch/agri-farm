import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import DashboardPage from './pages/DashboardPage'
import FarmFormPage from './pages/FarmFormPage'
import FarmPage from './pages/FarmPage'
import LivestockDetailPage from './pages/LivestockDetailPage'
import LivestockFormPage from './pages/LivestockFormPage'
import LivestockListPage from './pages/LivestockListPage'
import LoginPage from './pages/LoginPage'
import MilkBatchDetailPage from './pages/MilkBatchDetailPage'
import MilkBatchFormPage from './pages/MilkBatchFormPage'
import MilkBatchListPage from './pages/MilkBatchListPage'
import MilkBatchQrPage from './pages/MilkBatchQrPage'
import PublicTracePage from './pages/PublicTracePage'
import QrCodesPage from './pages/QrCodesPage'
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
          <Route path="/farms/new" element={<FarmFormPage />} />
          <Route path="/farm" element={<FarmPage />} />
          <Route path="/livestock" element={<LivestockListPage />} />
          <Route path="/livestock/new" element={<LivestockFormPage />} />
          <Route path="/livestock/:id" element={<LivestockDetailPage />} />
          <Route path="/treatments" element={<TreatmentsPage />} />
          <Route path="/milk-batches" element={<MilkBatchListPage />} />
          <Route path="/milk-batches/new" element={<MilkBatchFormPage />} />
          <Route path="/milk-batches/:id/qr" element={<MilkBatchQrPage />} />
          <Route path="/milk-batches/:id" element={<MilkBatchDetailPage />} />
          <Route path="/qr-codes" element={<QrCodesPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}
