import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
  // Reset method: 'email' | 'phone'
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetMethod === 'email' && !email) {
      setError('Please enter your email address.');
      return;
    }

    if (resetMethod === 'phone' && !phone) {
      setError('Please enter your phone number.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (resetMethod === 'email') {
        setSuccess(`A password reset link has been sent to ${email}. Check your inbox!`);
      } else {
        setSuccess(`A 6-digit verification code has been sent via SMS to ${phone}.`);
      }
    }, 1000);
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

        {/* Hero Body */}
        <div className="my-auto py-6 max-w-xl space-y-6">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-3 text-[#091E42]">
              Account Recovery<br />
              made <span className="text-[#0052CC]">simple.</span>
            </h1>
            <p className="text-[#5E6C84] text-sm xl:text-base font-normal leading-relaxed">
              Don't worry! It happens. Choose your preferred recovery method below to reset your password and get back into your workspace quickly.
            </p>
          </div>

          <div className="bg-white/95 border border-[#B3D4FF] rounded-2xl p-5 shadow-lg space-y-3 backdrop-blur-sm">
            <div className="flex items-center space-x-3 text-xs font-semibold text-[#0747A6]">
              <span className="p-2 bg-[#E3F2FD] rounded-lg">🔑</span>
              <span>Fast & Secure Verification</span>
            </div>
            <p className="text-xs text-[#5E6C84]">
              We offer both Email links and Instant SMS Verification Codes so you can recover your account anytime.
            </p>
          </div>
        </div>

        <div className="pt-5 border-t border-[#B3D4FF]/50 text-xs text-[#5E6C84]">
          Need help? Contact support@flowboard.com
        </div>
      </div>

      {/* RIGHT SIDE FORM PANEL */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center items-center p-6 sm:p-8 bg-[#F4F5F7]">
        <div className="w-full max-w-sm sm:max-w-md">
          
          {/* Card Container */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#172B4D] mb-1">Forgot password?</h2>
            <p className="text-xs text-[#6B778C] mb-5">
              Select how you would like to reset your password.
            </p>

            {/* Toggle Between Email / Phone */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F5F7] rounded-xl border border-[#DFE1E6] mb-5">
              <button
                type="button"
                onClick={() => { setResetMethod('email'); setError(''); setSuccess(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  resetMethod === 'email'
                    ? 'bg-white text-[#0052CC] shadow-xs border border-[#DFE1E6]'
                    : 'text-[#6B778C] hover:text-[#172B4D]'
                }`}
              >
                <span>✉️</span>
                <span>Email Address</span>
              </button>

              <button
                type="button"
                onClick={() => { setResetMethod('phone'); setError(''); setSuccess(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  resetMethod === 'phone'
                    ? 'bg-white text-[#0052CC] shadow-xs border border-[#DFE1E6]'
                    : 'text-[#6B778C] hover:text-[#172B4D]'
                }`}
              >
                <span>📱</span>
                <span>Phone Number</span>
              </button>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#DE350B] text-xs rounded-lg font-semibold flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-[#36B37E] text-xs rounded-lg font-semibold flex items-start space-x-2">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {resetMethod === 'email' ? (
                /* Email Input */
                <div>
                  <label htmlFor="recoveryEmail" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                    Your Email Address
                  </label>
                  <input
                    id="recoveryEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@flowboard.com"
                    className="w-full rounded-lg border border-[#DFE1E6] px-3.5 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                /* Phone Input */
                <div>
                  <label htmlFor="recoveryPhone" className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                    Your Phone Number
                  </label>
                  <input
                    id="recoveryPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-[#DFE1E6] px-3.5 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-white"
                    disabled={isLoading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#0052CC] px-4 py-3 text-sm font-bold text-white hover:bg-[#003DD1] transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2 disabled:opacity-50 mt-2 shadow-md"
              >
                {isLoading
                  ? 'Sending...'
                  : resetMethod === 'email'
                  ? 'Send Reset Link'
                  : 'Send Verification Code'}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-5 pt-4 border-t border-[#DFE1E6] text-center">
              <Link to="/login" className="text-xs font-bold text-[#0052CC] hover:underline flex items-center justify-center space-x-1">
                <span>← Back to Login</span>
              </Link>
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