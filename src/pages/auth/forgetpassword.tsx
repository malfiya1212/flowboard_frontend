import React from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password reset link sent to your email.");
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#E6E5DF] items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-8">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="john@flowboard.com" required 
            />
          </div>

          <button type="submit" className="w-full bg-[#284B38] text-white rounded-lg py-3 font-semibold hover:bg-[#1E3A2B]">
            Send Reset Link
          </button>

          <div className="text-center text-sm text-gray-500 pt-4">
            Remembered your password? <Link to="/login" className="text-[#8B5A43] font-semibold hover:underline">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}