import Layout from './components/layout/Layout';
import { useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AssetsPage from './pages/AssetsPage';
import UsersPage from './pages/UsersPage';
import AllocationPage from './pages/AllocationPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * Listens for the custom 'assettrack:unauthorised' event dispatched by the 
 * API client and redirects the user to the login page.
 */
function UnauthorisedRedirectListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleUnauthorised = () => {
      console.log('Unauthorised access detected, redirecting to login...');
      navigate('/login');
    };
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
        <Route path="/unauthorized" element={<UnauthorizedPage/>} />

        {/* Internal pages that require auth */}
        <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage/>} />
          <Route path="/dashboard" element={<DashboardPage/>} />
          <Route path="/assets" element={<AssetsPage/>} />
          <Route path="/users" element={<UsersPage/>} />
          <Route path="/allocation" element={<AllocationPage/>} />
          <Route path="/settings" element={<SettingsPage/>} />
          <Route path="/support" element={<SupportPage/>} />
        </Route>

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
