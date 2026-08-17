import { Navigate, Route, Routes } from "react-router-dom";
import SidebarLayout from "./layout/SidebarLayout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TreatmentLog from "./pages/TreatmentLog";
import FarmerRecords from "./pages/FarmerRecords";
import VetVerification from "./pages/VetVerification";
import Reports from "./pages/Reports";
import FarmerVerification from "./pages/FarmerVerification";
import VetRecords from "./pages/VetRecords";
import HelpDocumentation from "./pages/HelpDocumentation";
import AdminInvites from "./pages/AdminInvites";
import AuthCallback from "./pages/AuthCallback";
import ParticlePreloader from "./components/ParticlePreloader";
import { AuthProvider, useAuthContext } from "./context/AuthContext";

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#e8f0e4', color: '#2d8f4e',
        fontSize: '18px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

/** Consumer users can only access the Dashboard */
function ConsumerGuard({ children }: { children: JSX.Element }) {
  const { user } = useAuthContext();
  if (user?.role === 'consumer') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ParticlePreloader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route
          element={
            <Protected>
              <SidebarLayout />
            </Protected>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/treatments" element={<ConsumerGuard><TreatmentLog /></ConsumerGuard>} />
          <Route path="/farmers" element={<ConsumerGuard><FarmerRecords /></ConsumerGuard>} />
          <Route path="/vet-verification" element={<ConsumerGuard><VetVerification /></ConsumerGuard>} />
          <Route path="/farmer-verification" element={<ConsumerGuard><FarmerVerification /></ConsumerGuard>} />
          <Route path="/reports" element={<ConsumerGuard><Reports /></ConsumerGuard>} />
          <Route path="/vet-records" element={<ConsumerGuard><VetRecords /></ConsumerGuard>} />
          <Route path="/help" element={<HelpDocumentation />} />
          <Route path="/admin-invites" element={<ConsumerGuard><AdminInvites /></ConsumerGuard>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
