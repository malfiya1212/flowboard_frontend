import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionsProvider } from './context/permision';
import { AuthProvider } from './context/authcontext';

// Auth Imports
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import ForgotPassword from './pages/auth/forgetpassword';

// Workspace Imports
import UserDashboard from './pages/dashiboard/user';
import ScrumMasterDashboard from './pages/scrum/scrumMaster';
import AdminDashboard from './pages/admin/admindashiboard';
import AdminLogin from './pages/admin/adminlogin';

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <Router>
          <Routes>
            {/* Direct Workspace Routes (No login required) */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/scrum-master" element={<ScrumMasterDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Optional Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Root now directs straight into Developer Dashboard (or change to /scrum-master) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </PermissionsProvider>
    </AuthProvider>
  );
}