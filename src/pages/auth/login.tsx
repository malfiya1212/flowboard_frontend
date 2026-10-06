import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


export const Login: React.FC = () => {
 
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const successLogin = login(email);
      if (successLogin) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F5F7] font-sans">
      
      {/* LEFT SIDE HERO BANNER */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#EBF3FF] via-[#F4F8FF] to-[#DEEBFF] text-[#172B4D] p-8 xl:p-12 flex-col justify-between border-r border-[#DFE1E6]">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#0052CC] flex items-center justify-center font-black text-2xl text-white shadow-sm">
            F
          </div>
          <span className="text-2xl font-black tracking-tight text-[#0747A6]">
            Flow<span className="text-[#0052CC]">Board</span>
          </span>
        </div>

        {/* Graphic Frame */}
        <div className="my-auto py-6 max-w-xl space-y-6">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-3 text-[#091E42]">
              Organize work.<br />
              Build better <span className="text-[#0052CC]">software.</span>
            </h1>
            <p className="text-[#5E6C84] text-sm xl:text-base font-normal leading-relaxed">
              Manage development tasks, responsibilities, priorities and progress in one organized workspace.
            </p>
          </div>

          <div className="bg-white/95 border border-[#B3D4FF] rounded-2xl p-5 shadow-lg space-y-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#DEEBFF] pb-2.5">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#D83915]"></div>
                <div className="w-3 h-3 rounded-full bg-[#E0AA3F]"></div>
                <div className="w-3 h-3 rounded-full bg-[#36B35C]"></div>
              </div>
              <span className="text-xs font-semibold text-[#0747A6]">FlowBoard Sprint Workspace</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F4F5F7] p-2.5 rounded-xl border border-[#DFE1E6]">
                <span className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider block mb-2">Backlog</span>
                <div className="bg-white p-2 rounded-lg border border-[#DFE1E6] shadow-xs mb-1.5">
                  <div className="h-2 w-14 bg-[#0052CC]/40 rounded mb-1"></div>
                  <div className="h-1.5 w-8 bg-[#97A0AF]/30 rounded"></div>
                </div>
              </div>

              <div className="bg-[#E3F2FD] p-2.5 rounded-xl border border-[#B3D4FF]">
                <span className="text-[11px] font-bold text-[#0747A6] uppercase tracking-wider block mb-2">In Progress</span>
                <div className="bg-white p-2 rounded-lg border border-[#B3D4FF] shadow-xs">
                  <div className="h-2 w-16 bg-[#0052CC] rounded mb-1"></div>
                  <div className="h-1.5 w-10 bg-[#0747A6]/30 rounded"></div>
                </div>
              </div>

              <div className="bg-[#E3FCEF] p-2.5 rounded-xl border border-[#ABF5D1]">
                <span className="text-[11px] font-bold text-[#006644] uppercase tracking-wider block mb-2">Done</span>
                <div className="bg-white p-2 rounded-lg border border-[#ABF5D1] shadow-xs">
                  <div className="h-2 w-12 bg-[#36B37E] rounded mb-1"></div>
                  <div className="h-1.5 w-7 bg-[#006644]/30 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 pt-5 border-t border-[#B3D4FF]/50">
          <div className="bg-white/80 border border-[#B3D4FF]/60 p-3 rounded-xl">
            <h4 className="text-xs font-bold text-[#0747A6] mb-0.5">Task Management</h4>
            <p className="text-[11px] text-[#5E6C84] leading-tight">Track tasks easily</p>
          </div>
          <div className="bg-white/80 border border-[#B3D4FF]/60 p-3 rounded-xl">
            <h4 className="text-xs font-bold text-[#0747A6] mb-0.5">Team Collaboration</h4>
            <p className="text-[11px] text-[#5E6C84] leading-tight">Achieve more together</p>
          </div>
          <div className="bg-white/80 border border-[#B3D4FF]/60 p-3 rounded-xl">
            <h4 className="text-xs font-bold text-[#0747A6] mb-0.5">Secure & Reliable</h4>
            <p className="text-[11px] text-[#5E6C84] leading-tight">Data protected</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FORM PANEL */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center items-center p-6 sm:p-8 bg-[#F4F5F7]">
        <div className="w-full max-w-sm sm:max-w-md">
          
          <div className="bg-white border border-[#DFE1E6] rounded-2xl shadow-sm p-6 sm:p-8">

            <h2 className="text-2xl font-bold text-[#172B4D] mb-1">Welcome back</h2>
            <p className="text-xs text-[#6B778C] mb-6">Log in to continue to your workspace.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#DE350B] text-xs rounded-lg font-semibold flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@flowboard.com"
                  className="w-full rounded-lg border border-[#DFE1E6] px-3.5 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#DFE1E6] pl-3.5 pr-10 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B778C] hover:text-[#172B4D] p-1 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 012.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
                <Link to="/forgot-password" className="text-xs font-bold text-[#0052CC] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#0052CC] px-4 py-3 text-sm font-bold text-white hover:bg-[#003DD1] transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2 disabled:opacity-50 mt-1 shadow-md"
              >
                {isLoading ? 'Logging In...' : 'Login'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#DFE1E6] text-center">
              <p className="text-xs text-[#6B778C]">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-[#0052CC] hover:underline ml-1">
                  Sign Up
                </Link>
              </p>
            </div>

          </div>

          <p className="mt-6 text-center text-xs text-[#6B778C]">
            FlowBoard Original Software System © 2026
          </p>

        </div>
      </div>

    </div>
  );
};