import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AssetsPage from './pages/AssetsPage';
import AxiosSandboxPage from './pages/AxiosSandboxPage';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage/>} />
      <Route path="/assets" element={<AssetsPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      {import.meta.env.DEV && (
      <Route path="/__sandbox/axios" element={<AxiosSandboxPage />} />
      )}
    </Routes>
  );
}
