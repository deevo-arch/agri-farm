import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// Farmer pages
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import Animals from '../pages/farmer/Animals';
import AddAnimal from '../pages/farmer/AddAnimal';
import VetList from '../pages/farmer/VetList';
import BookAppointment from '../pages/farmer/BookAppointment';
import MyAppointments from '../pages/farmer/MyAppointments';

// Vet pages
import VetDashboard from '../pages/vet/VetDashboard';
import VetAppointments from '../pages/vet/Appointments';
import AnimalDetails from '../pages/vet/AnimalDetails';
import QRRegenerate from '../pages/vet/QRRegenerate';

// Authority pages
import AuthorityDashboard from '../pages/authority/AuthorityDashboard';
import CreateBatch from '../pages/authority/CreateBatch';
import Batches from '../pages/authority/Batches';
import ScanQR from '../pages/authority/ScanQR';
import FarmLivestock from '../pages/authority/FarmLivestock';

// Consumer pages
import ConsumerScan from '../pages/consumer/ConsumerScan';
import AlertResult from '../pages/consumer/AlertResult';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  
  return children;
};

const PublicRoutes = () => (
  <MainLayout>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/consumer/scan" element={<ConsumerScan />} />
      <Route path="/consumer/result" element={<AlertResult />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  </MainLayout>
);

const FarmerRoutes = () => (
  <RoleRoute allowedRoles={['farmer']}>
    <DashboardLayout>
      <Routes>
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/animals" element={<Animals />} />
        <Route path="/farmer/add-animal" element={<AddAnimal />} />
        <Route path="/farmer/vet-list" element={<VetList />} />
        <Route path="/farmer/book-appointment" element={<BookAppointment />} />
        <Route path="/farmer/appointments" element={<MyAppointments />} />
        <Route path="/farmer/*" element={<Navigate to="/farmer/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  </RoleRoute>
);

const VetRoutes = () => (
  <RoleRoute allowedRoles={['vet']}>
    <DashboardLayout>
      <Routes>
        <Route path="/vet/dashboard" element={<VetDashboard />} />
        <Route path="/vet/appointments" element={<VetAppointments />} />
        <Route path="/vet/animal-details" element={<AnimalDetails />} />
        <Route path="/vet/qr-regenerate" element={<QRRegenerate />} />
        <Route path="/vet/*" element={<Navigate to="/vet/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  </RoleRoute>
);

const AuthorityRoutes = () => (
  <RoleRoute allowedRoles={['authority']}>
    <DashboardLayout>
      <Routes>
        <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
        <Route path="/authority/create-batch" element={<CreateBatch />} />
        <Route path="/authority/batches" element={<Batches />} />
        <Route path="/authority/scan-qr" element={<ScanQR />} />
        <Route path="/authority/farm-livestock" element={<FarmLivestock />} />
        <Route path="/authority/*" element={<Navigate to="/authority/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  </RoleRoute>
);

const AppRoutes = () => (
  <AuthProvider>
    <UserProvider>
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/farmer/*" element={<FarmerRoutes />} />
        <Route path="/vet/*" element={<VetRoutes />} />
        <Route path="/authority/*" element={<AuthorityRoutes />} />
        <Route path="/unauthorized" element={<div style={{padding: 40, textAlign: 'center'}}><h2>Unauthorized</h2><p>You don't have permission to access this page.</p></div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </UserProvider>
  </AuthProvider>
);

export default AppRoutes;