import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionsProvider } from './context/permision';
import { AuthProvider } from './context/authcontext';
import { ThemeProvider } from './context/themecontext';

// Auth Imports
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import ForgotPassword from './pages/auth/forgetpassword';

// Workspace Imports
import UserDashboard from './pages/dashiboard/user';
import ScrumMasterDashboard from './pages/scrum/scrumMaster';
import AdminDashboard from './pages/admin/admindashiboard';
import AdminLogin from './pages/admin/adminlogin';
import TaskDetails from './pages/tasks/taskDetail';
import ProtectedRoute from './componets/ProtectedRoute';

function RootRedirect() {
  const raw = localStorage.getItem('flowboard_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      const role = (user?.role || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (role.includes('scrum')) return <Navigate to="/scrumMaster" replace />;
      if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
      return <Navigate to="/developer-dashboard" replace />;
    } catch {
      return <Navigate to="/user" replace />;
    }
  }
  return <Navigate to="/user" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionsProvider>
        <Router>
          <Routes>
            {/* Correct Role-Specific Paths */}
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/developer-dashboard" element={<UserDashboard />} />
            <Route path="/scrum" element={<ScrumMasterDashboard />} />
            <Route path="/scrumMaster" element={<ScrumMasterDashboard />} />
            <Route path="/tasks/:taskId" element={<TaskDetails />} />
            
            {/* Protected Admin Routes - Redirects to Admin Login page */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']} redirectPath="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['Admin']} redirectPath="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Optional Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Root & Catch-All redirects intelligently based on authenticated role */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </PermissionsProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}