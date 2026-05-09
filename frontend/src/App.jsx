import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import Layout from './components/layout/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Guest Routes (only for non-authenticated users) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
