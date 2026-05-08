import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import RoleProtectedRoute from '../../../components/auth/RoleProtectedRoute';
import useAuthStore from '../../../store/useAuthStore';

// Helper component to track the current location during navigation
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Auth Route Wrappers', () => {
  beforeEach(() => {
    // Reset global auth store state before each test
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to /login', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<LocationDisplay />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });

    it('allows authenticated users to access protected routes', () => {
      useAuthStore.setState({ user: { email: 'test@example.com' }, isAuthenticated: true });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<LocationDisplay />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('location-display')).not.toBeInTheDocument();
    });
  });

  describe('RoleProtectedRoute', () => {
    it('redirects unauthenticated users to /login even if roles are provided', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<LocationDisplay />} />
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<div data-testid="admin">Admin Panel</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
    });

    it('redirects DEVELOPER to /unauthorized when trying to access /admin', () => {
      useAuthStore.setState({ user: { email: 'dev@example.com', role: 'DEVELOPER' }, isAuthenticated: true });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/unauthorized" element={<LocationDisplay />} />
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<div data-testid="admin">Admin Panel</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/unauthorized');
      expect(screen.queryByTestId('admin')).not.toBeInTheDocument();
    });

    it('allows ADMIN to access /admin', () => {
      useAuthStore.setState({ user: { email: 'admin@example.com', role: 'ADMIN' }, isAuthenticated: true });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/unauthorized" element={<LocationDisplay />} />
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<div data-testid="admin">Admin Panel</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('admin')).toBeInTheDocument();
    });
  });
});
