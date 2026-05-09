import Layout from './components/layout/Layout';
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AssetsPage from './pages/AssetsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
          <Route path="/" element={<DashboardPage/>} />
          <Route path="/assets" element={<AssetsPage/>} />
        </Route>

        {import.meta.env.DEV && AxiosSandboxPage && (
          <Route path="/__sandbox/axios" element={<Suspense fallback={null}><AxiosSandboxPage /></Suspense>} />
        )}
      </Routes>
    </>
  );
}
