import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth Wrappers
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import AssetRegistrationPage from './pages/AssetRegistrationPage';
import AssetReportsPage from './pages/AssetReportsPage';
import ConditionReportsPage from './pages/ConditionReportsPage';
import AllocationsPage from './pages/AllocationsPage';
import SpareLaptopsPage from './pages/SpareLaptopsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import AxiosSandboxPage from './pages/AxiosSandboxPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <Routes>
      {/* Public / Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard - ADMIN, MANAGER only */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Assets - ADMIN, MANAGER, DEVELOPER */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DEVELOPER']} />}>
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/:assetId/reports" element={<AssetReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Asset Registration - ADMIN only */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/assets/register" element={<AssetRegistrationPage />} />
          </Route>

          {/* Allocation & Spare Laptops - ADMIN, MANAGER only */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
            <Route path="/allocations" element={<AllocationsPage />} />
            <Route path="/spare-laptops" element={<SpareLaptopsPage />} />
            <Route path="/condition-reports" element={<ConditionReportsPage />} />
          </Route>

          {/* User Management - ADMIN only */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Common Protected Pages */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DEVELOPER']} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Support - All authenticated users */}
          <Route path="/support" element={<SupportPage />} />
          
          {/* Unauthorized Page */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Dev Sandbox - ADMIN only */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/sandbox/axios" element={<AxiosSandboxPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


