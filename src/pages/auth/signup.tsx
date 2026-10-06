import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SignUp: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        login(email);
        navigate('/dashboard');
      }, 1000);
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

        {/* Hero Headline */}
        <div className="my-auto py-6 max-w-xl space-y-6">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-3 text-[#091E42]">
              Join thousands of<br />
              productive <span className="text-[#0052CC]">teams.</span>
            </h1>
            <p className="text-[#5E6C84] text-sm xl:text-base font-normal leading-relaxed">
              Create your free account today and streamline your software development workflow from day one.
            </p>
          </div>

          {/* Kanban Feature Graphic */}
          <div className="bg-white/95 border border-[#B3D4FF] rounded-2xl p-5 shadow-lg space-y-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#DEEBFF] pb-2.5">
              <span className="text-xs font-bold text-[#0747A6]">🚀 Fast Setup</span>
              <span className="text-xs text-[#5E6C84]">No credit card required</span>
            </div>
            <p className="text-xs text-[#172B4D]">
              Get access to boards, backlog management, sprint planning, and team collaboration tools instantly.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-5 border-t border-[#B3D4FF]/50 text-xs text-[#5E6C84]">
          🔒 End-to-end encrypted workspace & enterprise security.
        </div>
      </div>

      {/* RIGHT SIDE FORM PANEL */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center items-center p-6 sm:p-8 bg-[#F4F5F7]">
        <div className="w-full max-w-sm sm:max-w-md">
          
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-black text-[#0052CC] tracking-tight">FlowBoard</h1>
            <p className="text-xs text-[#6B778C] mt-1">Software Development Task Management</p>
          </div>

          {/* Card Container */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#172B4D] mb-1">Create your account</h2>
            <p className="text-xs text-[#6B778C] mb-5">
              Join FlowBoard to manage tasks, sprints, and team projects.
            </p>

            {/* Alert Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#DE350B] text-xs rounded-lg font-semibold flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-[#36B37E] text-xs rounded-lg font-semibold flex items-center space-x-2">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full rounded-lg border border-[#DFE1E6] px-3.5 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                  disabled={isLoading}
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.johnson@example.com"
                  className="w-full rounded-lg border border-[#DFE1E6] px-3.5 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                  disabled={isLoading}
                />
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label htmlFor="phone" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Phone Number <span className="text-[#6B778C] font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-[#DFE1E6] px-3.5 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Password <span className="text-red-500">*</span>
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#DFE1E6] pl-3.5 pr-10 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B778C] hover:text-[#172B4D] p-1 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#0052CC] px-4 py-3 text-sm font-bold text-white hover:bg-[#003DD1] transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2 disabled:opacity-50 mt-2 shadow-md"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-5 pt-4 border-t border-[#DFE1E6] text-center">
              <p className="text-xs text-[#6B778C]">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#0052CC] hover:underline ml-1">
                  Login
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