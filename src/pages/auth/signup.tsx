import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, EyeOff, CheckSquare, 
  CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import api from '../../service/api';
import ThemeToggle from '../../componets/commen/ThemeToggle';

export default function Signup() {
  const [step, setStep] = useState<'signup' | 'success'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle initial signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/signup', {
        name,
        email,
        password,
        role: 'Member'
      });

      // No email verification needed: directly show success
      setStep('success');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message || 
        'The signup service could not be reached. Please check the backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // STEP 2: SUCCESS SCREEN
  // =========================================================================
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] dark:bg-[#0B0F17] p-6 font-sans relative transition-colors duration-200">
        <div className="absolute top-5 right-6 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 text-center space-y-6 shadow-sm transition-colors duration-200">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-full flex items-center justify-center mx-auto text-[#0F766E] dark:text-teal-400">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white">Account Created!</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Your account has been created with Member access. You can now log in to your workspace.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-lg border border-gray-100 dark:border-slate-700 text-xs text-left space-y-1.5 font-mono">
            <div><span className="text-gray-400 dark:text-slate-400">Name:</span> <span className="text-[#1F2937] dark:text-white font-semibold">{name}</span></div>
            <div><span className="text-gray-400 dark:text-slate-400">Email:</span> <span className="text-[#1F2937] dark:text-white font-semibold">{email}</span></div>
            <div><span className="text-gray-400 dark:text-slate-400">Default Role:</span> <span className="text-blue-600 dark:text-blue-400 font-bold">Member</span></div>
            <div><span className="text-gray-400 dark:text-slate-400">Account Status:</span> <span className="text-[#15803D] dark:text-emerald-400 font-bold">Active</span></div>
          </div>

          <Link
            to="/login"
            className="block w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs text-center"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 1: INITIAL SIGNUP FORM
  // =========================================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] dark:bg-[#0B0F17] p-6 font-sans relative transition-colors duration-200">
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 space-y-6 shadow-sm transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#0F766E] text-white">
              <CheckSquare size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-[#1F2937] dark:text-white">FlowBoard</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937] dark:text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Enter your details to create an account and access your workspace.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
              placeholder="e.g. Alex Johnson"
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-slate-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
              placeholder="you@company.com"
              required
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-slate-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-slate-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-70 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="font-bold underline text-[#2563EB] dark:text-blue-400 hover:text-blue-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}