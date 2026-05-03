import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AssetsPage from './pages/AssetsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage/>} />
      <Route path="/assets" element={<AssetsPage/>} />
      <Route path="/login" element={<LoginPage/>} />
    </Routes>
  );
}
