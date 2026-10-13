import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import { Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../../service/api';
import ThemeToggle from '../../componets/commen/ThemeToggle';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      // Connect to backend authentication endpoint
      const response = await api.post('/auth/signin', { email: email.trim(), password });
      const data = response.data;
      const user = data.user;

      // Ensure the user actually has the Admin role
      const userRole = (user?.role || '').trim().toUpperCase();
      if (userRole !== 'ADMIN') {
        setErrorMsg('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }

      // Save real JWT token and user info to localStorage
      localStorage.setItem('flowboard_token', data.token);
      localStorage.setItem('flowboard_user', JSON.stringify(user));
      localStorage.setItem('user_role', 'Admin');

      // Update auth context
      login({
        id: String(user.id),
        name: user.name || 'System Admin',
        email: user.email,
        role: 'Admin',
      });

      // Route to protected Admin Dashboard
      navigate('/admin-dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans antialiased bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#1F2937] dark:text-[#F8FAFC] items-center justify-center p-6 relative transition-colors duration-200">
      
      {/* Top Right Navigation & Theme Toggle */}
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        <ThemeToggle />
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 hover:text-[#0F766E] dark:hover:text-teal-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-[#0F766E] px-3.5 py-2 rounded-md transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft size={13} className="text-[#0F766E] dark:text-teal-400" />
          <span>User Login</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-md p-8 sm:p-10 transition-colors duration-200">
        
        {/* Header Section */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2.5 bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 px-4 py-2 rounded-xl font-bold text-base border border-teal-200 dark:border-teal-800/60 shadow-xs">
            <ShieldCheck size={20} className="text-[#0F766E] dark:text-teal-400" />
            <span>FlowBoard Admin</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          System Access
        </h2>
        <p className="text-sm text-center text-gray-500 dark:text-slate-400 mb-6">
          Authorized personnel only. Enter your administrator credentials.
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
              Administrator Email
            </label>
            <input 
              id="admin-email"
              type="email" 
              className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#0F766E] dark:focus:border-teal-500 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all duration-200"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="admin-password" className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
              Password
            </label>
            <div className="relative">
              <input 
                id="admin-password"
                type={showPassword ? "text" : "password"} 
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#0F766E] dark:focus:border-teal-500 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 pr-10 transition-all duration-200"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0F766E] hover:bg-[#0D655E] dark:bg-teal-600 dark:hover:bg-teal-500 disabled:bg-gray-400 text-white rounded-lg py-3.5 mt-2 font-semibold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Access Control Panel</span>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-400 dark:text-slate-500 font-medium font-mono">
            FlowBoard Enterprise System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}