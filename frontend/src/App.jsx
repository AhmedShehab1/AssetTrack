import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AssetsPage from './pages/AssetsPage';
import AssetReportsPage from './pages/AssetReportsPage';
import ConditionReportsPage from './pages/ConditionReportsPage';
import UsersPage from './pages/UsersPage';
import AllocationsPage from './pages/AllocationsPage';
// ... other imports

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* ... other public routes */}
      
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:assetId/reports" element={<AssetReportsPage />} />
        <Route path="/condition-reports" element={<ConditionReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/allocations" element={<AllocationsPage />} />
        {/* ... other protected routes */}
      </Route>
    </Routes>
  );
}
