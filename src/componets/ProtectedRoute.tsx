import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  allowedRoles = ['Admin'],
  redirectPath = '/admin/login',
  children,
}: ProtectedRouteProps) {
  // Check token and stored user object from database login
  const token = localStorage.getItem('flowboard_token') || localStorage.getItem('token');
  const storedUserRaw = localStorage.getItem('flowboard_user') || localStorage.getItem('fb_user');

  let userRole: string | null = null;
  if (storedUserRaw) {
    try {
      const parsed = JSON.parse(storedUserRaw);
      userRole = parsed?.role || null;
    } catch {
      userRole = null;
    }
  }

  // If not authenticated via token, redirect to Admin Login
  if (!token || !userRole) {
    return <Navigate to={redirectPath} replace />;
  }

  // If role is not authorized for this route, block and redirect to Admin Login
  const normalizedUserRole = userRole.toUpperCase().replace(/\s+/g, '_');
  const isAuthorized = allowedRoles.some(
    (role) => role.toUpperCase().replace(/\s+/g, '_') === normalizedUserRole
  );

  if (!isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
