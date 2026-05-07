import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AssetsPage from './pages/AssetsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AxiosSandboxPage = import.meta.env.DEV
  ? lazy(() => import('./pages/AxiosSandboxPage'))
  : null;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/signup" element={<SignupPage/>} />

      {/* Internal pages that require auth */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage/>} />
        <Route path="/assets" element={<AssetsPage/>} />
      </Route>

      {import.meta.env.DEV && AxiosSandboxPage && (
        <Route path="/__sandbox/axios" element={<Suspense fallback={null}><AxiosSandboxPage /></Suspense>} />
      )}
    </Routes>
  );
}
