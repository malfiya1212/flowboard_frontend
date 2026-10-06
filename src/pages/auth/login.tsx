import React, { useState } from 'react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // TODO: Connect to actual AuthContext/Backend API here
    setTimeout(() => {
      console.log('Authenticating:', { email, password });
      setIsLoading(false);
      // alert('Login simulation successful');
      // window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    /* Workspace Background: #F4F5F7 */
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center px-4">
      
      <div className="w-full max-w-md">
        {/* FlowBoard Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#0052CC] tracking-tight">
            FlowBoard
          </h1>
          <p className="mt-2 text-sm font-medium text-[#6B778C]">
            Software Development Task Management
          </p>
        </div>

        {/* Surface Card: #FFFFFF with #DFE1E6 border */}
        <div className="bg-[#FFFFFF] border border-[#DFE1E6] rounded-xl shadow-sm p-8">
          
          <h2 className="text-2xl font-bold text-[#172B4D] mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[#6B778C] mb-6">
            Sign in to continue to your workspace.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-[#DE350B] text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block mb-1.5 text-sm font-semibold text-[#172B4D]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@flowboard.com"
                className="w-full rounded-lg border border-[#DFE1E6] px-4 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-[#FFFFFF]"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block mb-1.5 text-sm font-semibold text-[#172B4D]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#DFE1E6] px-4 py-2.5 text-sm text-[#172B4D] placeholder-[#6B778C] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all bg-[#FFFFFF]"
                disabled={isLoading}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-[#0052CC] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#0052CC] px-4 py-3 text-sm font-bold text-white hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};