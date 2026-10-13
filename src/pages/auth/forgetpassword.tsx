import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, ArrowLeft, Loader2, CheckSquare, AlertCircle } from 'lucide-react';
import api from '../../service/api';
import ThemeToggle from '../../componets/commen/ThemeToggle';

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState('');
  
  // 6-digit code state
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

  // 1. STEP 1: Handle Send Reset Link / Code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSuccessMsg(response.data?.message || 'Verification code sent to your email.');
      
      if (response.data?.devCode) {
        setDevCode(response.data.devCode);
        const chars = String(response.data.devCode).slice(0, 6).split('');
        if (chars.length === 6) {
          setCode(chars);
        }
      }

      setStep('verify');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'Could not send reset code. Please check that the email is registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle single digit input
  const handleCodeChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const newCode = [...code];
      pasted.forEach((ch, i) => {
        if (index + i < 6) newCode[index + i] = ch;
      });
      setCode(newCode);
      const nextIdx = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = cleaned;
    setCode(newCode);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 2. STEP 2: Handle Verify Code and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the full 6-digit code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: fullCode,
        newPassword
      });

      setStep('success');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'Invalid or expired verification code. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResend = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setResending(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (response.data?.devCode) {
        setDevCode(response.data.devCode);
        const chars = String(response.data.devCode).slice(0, 6).split('');
        if (chars.length === 6) {
          setCode(chars);
        }
      }
      setSuccessMsg(response.data?.message || 'A new 6-digit code has been sent to your email.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#1F2937] dark:text-[#F8FAFC] items-center justify-center p-6 relative transition-colors duration-200">
      
      {/* TOP NAVIGATION LINK & THEME TOGGLE */}
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        <ThemeToggle />
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 hover:text-[#0F766E] dark:hover:text-teal-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-[#0F766E] px-3.5 py-2 rounded-md transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft size={13} className="text-[#0F766E] dark:text-teal-400" />
          <span>Back to Login</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm w-full max-w-md p-6 sm:p-8 space-y-6 transition-colors duration-200">
        
        {/* BRAND LOGO HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#0F766E] text-white shadow-2xs">
              <CheckSquare size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-[#1F2937] dark:text-white">FlowBoard</span>
          </div>
          <span className="text-[11px] font-mono text-gray-400 dark:text-slate-400 uppercase tracking-wider">Account Recovery</span>
        </div>

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">Password Reset Complete!</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                Your password has been successfully updated. You can now log in to your workspace.
              </p>
            </div>

            <Link
              to="/login"
              className="block w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs text-center cursor-pointer"
            >
              Sign In to FlowBoard
            </Link>
          </div>
        ) : step === 'verify' ? (
          /* STEP 2: 6-DIGIT CODE & NEW PASSWORD INPUT */
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-[#0F766E] dark:hover:text-teal-400 flex items-center gap-1 mb-2 cursor-pointer transition-colors"
              >
                <ArrowLeft size={13} /> Change Email
              </button>
              <h2 className="text-xl font-bold text-[#1F2937] dark:text-white">Enter Verification Code</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                We sent a 6-digit code to <strong className="text-[#1F2937] dark:text-white">{email}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 text-xs rounded-lg">
                {successMsg}
              </div>
            )}

            {devCode && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-300 text-xs font-mono">
                Dev Mode Code: <strong className="text-blue-900 dark:text-blue-200 tracking-wider text-sm">{devCode}</strong>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* 6 Digit Code Input Boxes */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                  6-Digit Security Code
                </label>
                <div className="flex justify-between gap-2">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={e => handleCodeChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#1F2937] dark:text-white focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#1F2937] dark:text-white focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
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

              <button
                type="submit"
                disabled={loading || code.join('').length !== 6 || !newPassword}
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <><Loader2 size={15} className="animate-spin text-white" /> Updating Password...</> : 'Reset Password'}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50 font-medium"
                >
                  {resending ? 'Resending code...' : "Didn't receive code? Resend"}
                </button>
                <Link to="/login" className="text-gray-600 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 font-medium">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 1: INITIAL EMAIL INPUT SCREEN */
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#1F2937] dark:text-white tracking-tight">Reset Password</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Enter your email address and we'll send you a 6-digit verification code.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#1F2937] dark:text-white focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  placeholder="you@company.com" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-70 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <><Loader2 size={15} className="animate-spin text-white" /> Sending Code...</> : 'Send Reset Link'}
              </button>

              <div className="text-center text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-100 dark:border-slate-800">
                Remembered your password?{' '}
                <Link to="/login" className="font-bold underline text-[#2563EB] dark:text-blue-400 hover:text-blue-700">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}