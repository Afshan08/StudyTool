import React from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
