import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = sessionStorage.getItem('@admin_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};