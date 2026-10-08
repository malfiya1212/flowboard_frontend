import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import { Eye, EyeOff, AlertCircle, Loader2, CheckSquare } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate('/user');
      } else {
        setErrorMsg('Invalid email or password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen font-sans antialiased bg-[var(--color-bg-right)] text-[oklch(15%_0.02_320)]">
      
      {/* GLOBAL AUTOFILL OVERRIDE */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px var(--color-input) inset !important;
          -webkit-text-fill-color: oklch(15%_0.02_320) !important;
          caret-color: oklch(15%_0.02_320);
        }
      `}</style>

      {/* LEFT SIDE - 65/35 SPLIT WORKSTATION IDENTITY */}
      <div className="hidden md:flex flex-col justify-center items-start w-3/5 p-12 lg:pl-32 lg:pr-16 bg-[var(--color-bg-left)]">
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 rounded-sm bg-[oklch(15%_0.02_320)] text-[var(--color-bg-left)]">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">Flowboard</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-tight">
            Organize work.<br />Build better software.
          </h1>
          
          <p className="text-sm text-gray-700 leading-relaxed">
            Manage development tasks, responsibilities, priorities and progress in one organized workspace.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - 35% FORM CONTAINER (SHARP CORNERS, 1PX BORDER) */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-[var(--color-bg-right)]">
        <div className="bg-white rounded-sm w-full max-w-sm p-6 sm:p-8 border border-[oklch(90%_0.02_320)] shadow-none">
          
          <h2 className="text-lg font-bold tracking-tight mb-1">Welcome back</h2>
          <p className="text-xs text-gray-600 mb-4">Sign in to your workspace.</p>

          {/* FIXED-HEIGHT ERROR CONTAINER */}
          <div className="min-h-[42px] mb-3">
            {errorMsg && (
              <div 
                className="p-2 rounded-sm flex items-center gap-2 text-xs font-mono"
                style={{
                  backgroundColor: 'oklch(15% 0.02 320)',
                  color: 'oklch(80% 0.14 20)',
                  border: '1px solid oklch(80% 0.14 20)'
                }}
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            
            {/* Email Field - Monospace Label */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-800">
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
                className="w-full rounded-sm px-3 py-2 text-xs bg-[var(--color-input)] border border-[oklch(90%_0.02_320)] focus:outline-none focus:ring-1 focus:ring-[oklch(15%_0.02_320)] font-sans"
              />
            </div>

            {/* Password Field - Monospace Label */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-800">
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
                  className="w-full rounded-sm px-3 py-2 text-xs pr-8 bg-[var(--color-input)] border border-[oklch(90%_0.02_320)] focus:outline-none focus:ring-1 focus:ring-[oklch(15%_0.02_320)] font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 cursor-pointer"
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
                  className="w-3 h-3 rounded-none text-[oklch(15%_0.02_320)] focus:ring-[oklch(15%_0.02_320)] border-gray-300 cursor-pointer"
                />
                <span className="text-gray-800 font-medium">Remember me</span>
              </label>

              <Link to="/forgot-password" className="font-semibold text-gray-800 hover:text-[oklch(15%_0.02_320)]">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-sm py-2.5 mt-2 font-semibold shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-xs"
              style={{ 
                backgroundColor: 'oklch(15% 0.02 320)', 
                color: 'oklch(80% 0.14 20)'            
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  <span className="text-white">Authenticating...</span>
                </>
              ) : (
                <span className="tracking-wide font-bold">Login</span>
              )}
            </button>

            {/* Sign Up Redirect */}
            <div className="text-center text-xs text-gray-700 pt-3 border-t border-gray-100">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold underline text-[oklch(15%_0.02_320)]">
                Sign Up
              </Link>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}