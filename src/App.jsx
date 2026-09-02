import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import Halaman Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Import Halaman Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import Transactions from './pages/dashboard/Transactions';
import Products from './pages/dashboard/Products';
import Inventory from './pages/dashboard/Inventory';
import Analytics from './pages/dashboard/Analytics';
import AiAdvisor from './pages/dashboard/AiAdvisor';
import Goals from './pages/dashboard/Goals';
import Reports from './pages/dashboard/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Mengarahkan halaman utama (/) langsung ke halaman Login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rute Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rute Dashboard — semuanya wajib login */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/ai-advisor" element={<ProtectedRoute><AiAdvisor /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
