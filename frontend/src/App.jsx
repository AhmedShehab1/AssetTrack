import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AssetsPage from './pages/AssetsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthStore from './store/useAuthStore';
import { clearToken } from './api/client';

const AxiosSandboxPage = import.meta.env.DEV
  ? lazy(() => import('./pages/AxiosSandboxPage'))
  : null;

function UnauthorisedRedirectListener() {
  const navigate = useNavigate();
  const logout = useAuthStore(function (state) {
    return state.logout;
  });

  useEffect(function () {
    function handleUnauthorised() {
      clearToken();
      logout();
      navigate('/login', { replace: true });
    }

    globalThis.addEventListener('assettrack:unauthorised', handleUnauthorised);

    return function () {
      globalThis.removeEventListener('assettrack:unauthorised', handleUnauthorised);
    };
  }, [logout, navigate]);

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
        <Route element={<ProtectedRoute />}>
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
