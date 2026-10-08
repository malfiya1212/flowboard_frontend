import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import ForgotPassword from './pages/auth/forgetpassword';
import ScrumMaster from './scrum/scrumMaster'; 
import AdminLogin from './pages/admin/adminlogin'; 
import AdminDashboard from './pages/admin/admindashiboard';

// Direct import of your fully engineered developer dashboard
import User from './pages/dashiboard/user'; 

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Both routes now point directly to your professional dashboard component */}
          <Route path="/dashiboard" element={<User />} />
          <Route path="/User" element={<User />} />
          
          <Route path="/scrumMaster" element={<ScrumMaster />} />
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}