import { Navigate, Route, Routes } from 'react'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import AdminCreateUserPage from './pages/AdminCreateUserPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUserEditPage from './pages/AdminUserEditPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import FarmEditPage from './pages/FarmEditPage'
import FarmFormPage from './pages/FarmFormPage'
import FarmPage from './pages/FarmPage'
import LivestockDetailPage from './pages/LivestockDetailPage'
import LivestockEditPage from './pages/LivestockEditPage'
import LivestockFormPage from './pages/LivestockFormPage'
import LivestockListPage from './pages/LivestockListPage'
import LoginPage from './pages/LoginPage'
import MilkBatchDetailPage from './pages/MilkBatchDetailPage'
import MilkBatchFormPage from './pages/MilkBatchFormPage'
import MilkBatchListPage from './pages/MilkBatchListPage'
import MilkBatchQrPage from './pages/MilkBatchQrPage'
import MilkQualityPage from './pages/MilkQualityPage'
import ProfilePage from './pages/ProfilePage'
import PublicTracePage from './pages/PublicTracePage'
import QrCodesPage from './pages/QrCodesPage'
import RegisterPage from './pages/RegisterPage'
import RequestVetVisitPage from './pages/RequestVetVisitPage'
import TraceabilityTimelinePage from './pages/TraceabilityTimelinePage'
import TreatmentsPage from './pages/TreatmentsPage'
import VetDashboardPage from './pages/VetDashboardPage'
import VetVisitDetailPage from './pages/VetVisitDetailPage'
import VetVisitEditPage from './pages/VetVisitEditPage'
import VetVisitsPage from './pages/VetVisitsPage'

function dashboardPathForRole(role) {
  if (role === 'VET') return '/vet/dashboard'
  if (role === 'ADMIN') return '/admin/dashboard'
  return '/dashboard'
}

export default function App() {
  const { isAuthenticated, role } = useAuth()
  const homePath = isAuthenticated ? dashboardPathForRole(role) : '/login'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={homePath} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={homePath} replace /> : <RegisterPage />}
      />

      <Route path="/trace/:token" element={<PublicTracePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/farms/new" element={<FarmFormPage />} />
          <Route path="/farm" element={<FarmPage />} />
          <Route path="/farm/edit" element={<FarmEditPage />} />
          <Route path="/livestock" element={<LivestockListPage />} />
          <Route path="/livestock/new" element={<LivestockFormPage />} />
          <Route path="/livestock/:id" element={<LivestockDetailPage />} />
          <Route path="/livestock/:id/edit" element={<LivestockEditPage />} />
          <Route path="/livestock/:id/vet-visit" element={<RequestVetVisitPage />} />
          <Route path="/treatments" element={<TreatmentsPage />} />
          <Route path="/milk-batches" element={<MilkBatchListPage />} />
          <Route path="/milk-batches/new" element={<MilkBatchFormPage />} />
          <Route path="/milk-batches/:id/qr" element={<MilkBatchQrPage />} />
          <Route path="/milk-batches/:id" element={<MilkBatchDetailPage />} />
          <Route path="/milk-quality" element={<MilkQualityPage />} />
          <Route path="/qr-codes" element={<QrCodesPage />} />
          <Route path="/traceability" element={<TraceabilityTimelinePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/vet-visits" element={<VetVisitsPage />} />
          <Route path="/vet-visits/:id" element={<VetVisitDetailPage />} />
          <Route path="/vet-visits/:id/edit" element={<VetVisitEditPage />} />
          <Route path="/vet/dashboard" element={<VetDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/new" element={<AdminCreateUserPage />} />
          <Route path="/admin/users/:id/edit" element={<AdminUserEditPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  )
}
