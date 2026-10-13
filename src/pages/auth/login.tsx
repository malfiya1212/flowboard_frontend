import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, CheckSquare } from 'lucide-react';
import api from '../../service/api';
import ThemeToggle from '../../componets/commen/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/signin', { email, password });
      const data = response.data;
      const user = data.user;
      const userRole = user?.role;

      if (!userRole || userRole.toUpperCase() === 'PENDING') {
        setErrorMsg('Your account is awaiting Admin approval and role assignment.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('flowboard_token', data.token);
      localStorage.setItem('flowboard_user', JSON.stringify(user));
      if (userRole) {
        localStorage.setItem('user_role', userRole);
      }

      const normalizedRole = (userRole || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (normalizedRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (normalizedRole.includes('scrum')) {
        navigate('/scrumMaster'); 
      } else if (normalizedRole.includes('dev') || normalizedRole.includes('test')) {
        navigate('/developer-dashboard');
      } else {
        navigate('/user');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Invalid email or password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans antialiased bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#1F2937] dark:text-[#F8FAFC] relative transition-colors duration-200">
      
      {/* TOP RIGHT THEME TOGGLE */}
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* LEFT SIDE - 60/40 SPLIT WORKSTATION IDENTITY */}
      <div className="hidden md:flex flex-col justify-center items-start w-3/5 p-12 lg:pl-32 lg:pr-16 bg-white dark:bg-[#0E131F] border-r border-transparent dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 rounded-md bg-[#0F766E] text-white">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1F2937] dark:text-white">Flowboard</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-tight text-[#1F2937] dark:text-white">
            Organize work.<br />Build better software.
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            Manage development tasks, responsibilities, priorities and progress in one unified, agile workspace.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - FORM CONTAINER */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-[#F4F6F8] dark:bg-[#0B0F17] transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          
          <h2 className="text-lg font-bold tracking-tight mb-1 text-[#1F2937] dark:text-white">Welcome back</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Sign in to your workspace.</p>

          {/* FIXED-HEIGHT ERROR CONTAINER */}
          <div className="min-h-[42px] mb-3">
            {errorMsg && (
              <div 
                className="p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-slate-300">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="you@company.com"
                required
                className="w-full rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#1F2937] dark:text-white font-sans"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg px-3 py-2 text-xs pr-8 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#1F2937] dark:text-white font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#0F766E] focus:ring-[#0F766E] border-gray-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-slate-300 font-medium text-[11px]">Remember me</span>
              </label>

              <Link to="/forgot-password" className="font-semibold text-[#2563EB] dark:text-blue-400 hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-lg py-2.5 mt-2 font-semibold shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-xs text-white bg-[#0F766E] hover:bg-[#0D655E]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  <span className="text-white">Authenticating...</span>
                </>
              ) : (
                <span className="tracking-wide font-bold">Sign In</span>
              )}
            </button>

            {/* Sign Up Redirect */}
            <div className="text-center text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-100 dark:border-slate-800">
              <div>
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold underline text-[#2563EB] dark:text-blue-400 hover:text-blue-700">
                  Sign Up
                </Link>
              </div>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}