import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Bungkus halaman yang butuh login. Kalau belum login, otomatis
 * dilempar ke /login. Selama status auth masih dicek (loading),
 * tampilkan layar kosong sebentar supaya tidak "flash" ke halaman login
 * padahal sebenarnya user sudah login (token masih di localStorage).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
