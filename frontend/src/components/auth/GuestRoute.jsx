import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

/**
 * GuestRoute — the inverse of ProtectedRoute.
 * If the user is already authenticated, redirect them to the dashboard.
 * Otherwise, render the child route (login / signup).
 */
const GuestRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
