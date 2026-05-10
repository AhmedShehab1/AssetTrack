import Layout from './components/layout/Layout';
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AssetsPage from './pages/AssetsPage';
import AssetRegistrationPage from './pages/AssetRegistrationPage';
import AllocationsPage from './pages/AllocationsPage';
import UsersPage from './pages/UsersPage';
import SpareLaptopsPage from './pages/SpareLaptopsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import AssetReportsPage from './pages/AssetReportsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

const AxiosSandboxPage = import.meta.env.DEV
  ? lazy(() => import('./pages/AxiosSandboxPage'))
  : null;

/**
 * Global listener for the 'assettrack:unauthorised' event.
 * Dispatched by the API client on 401 responses.
 */
function UnauthorisedRedirectListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleUnauthorised = () => navigate('/login');
    window.addEventListener('assettrack:unauthorised', handleUnauthorised);
    return () => window.removeEventListener('assettrack:unauthorised', handleUnauthorised);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <>
      <UnauthorisedRedirectListener />
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
        <Route path="/unauthorized" element={<UnauthorizedPage/>} />

        {/* Internal pages that require auth */}
        <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
          
          {/* Users: ADMIN only for management list */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/users" element={<UsersPage/>} />
          </Route>

          {/* Dashboard, Allocations, and Spare Laptops: ADMIN, MANAGER */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
            <Route path="/" element={<DashboardPage/>} />
            <Route path="/spare-laptops" element={<SpareLaptopsPage/>} />
            <Route path="/allocations" element={<AllocationsPage/>} />
          </Route>

          <Route path="/assets" element={<AssetsPage/>} />
          <Route path="/assets/:assetId/reports" element={<AssetReportsPage/>} />
          <Route path="/condition-reports" element={<ConditionReportsPage/>} />
          
          {/* Profile: Any user for self, Admin/Manager for others */}
          <Route path="/profile" element={<ProfilePage/>} />
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
            <Route path="/users/:userId/profile" element={<ProfilePage/>} />
          </Route>

          {/* Registration: ADMIN only */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/assets/register" element={<AssetRegistrationPage/>} />
          </Route>

          <Route path="/settings" element={<SettingsPage/>} />
          <Route path="/support" element={<SupportPage/>} />
        </Route>

        {import.meta.env.DEV && AxiosSandboxPage && (
          <Route path="/__sandbox/axios" element={<Suspense fallback={null}><AxiosSandboxPage /></Suspense>} />
        )}
      </Routes>
    </>
  );
}
