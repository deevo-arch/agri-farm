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
import ParticlePreloader from "./components/ParticlePreloader";
import { AuthProvider, useAuthContext } from "./context/AuthContext";

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ParticlePreloader />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <Protected>
              <SidebarLayout />
            </Protected>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/treatments" element={<TreatmentLog />} />
          <Route path="/farmers" element={<FarmerRecords />} />
          <Route path="/vet-verification" element={<VetVerification />} />
          <Route path="/farmer-verification" element={<FarmerVerification />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/vet-records" element={<VetRecords />} />
          <Route path="/help" element={<HelpDocumentation />} />
          <Route path="/admin-invites" element={<AdminInvites />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
