import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Context
import { AuthProvider } from './context/authcontext';

// Auth Pages (Standard Users)
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import ForgotPassword from './pages/auth/forgetpassword';

// Admin Pages
import AdminLogin from './Admin//AdminLogin'; // <-- New Admin Login Page
import AdminDashboard from './Admin/admindashiord';

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

          {/* Secure Admin Routes (Separated) */}
         <Route element="{<AdminLogin" path="/admin-login"/>
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}