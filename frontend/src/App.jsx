import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AssetsPage from './pages/AssetsPage';
const AxiosSandboxPage = import.meta.env.DEV
  ? lazy(() => import('./pages/AxiosSandboxPage'))
  : null;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage/>} />
      <Route path="/assets" element={<AssetsPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      {import.meta.env.DEV && AxiosSandboxPage && (
      <Route path="/__sandbox/axios" element={<Suspense fallback={null}><AxiosSandboxPage /></Suspense>} />
      )}
    </Routes>
  );
}
