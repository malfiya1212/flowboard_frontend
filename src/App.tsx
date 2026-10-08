import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Context
import { AuthProvider } from './context/authcontext';

// Auth Pages (Standard Users)
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import ForgotPassword from './pages/auth/forgetpassword';

// FIX 1: Capitalize the import name and fix the spelling
import ScrumMaster from './scrum/scrumMaster'; 

// Admin Pages
import AdminLogin from './pages/admin/adminlogin'; // <-- New Admin Login Page
import AdminDashboard from './pages/admin/admindashiboard';

// Mock standard dashboard for Developers/Scrum Masters
const StandardDashboard = () => <div>Standard Dashboard (In Progress)</div>;

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default User Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<StandardDashboard />} />
          
          {/* FIX 2: Change path to match exactly "/scrumMaster" with a capital M */}
          <Route path="/scrumMaster" element={<ScrumMaster />} />

          {/* Secure Admin Routes (Separated) */}
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}