import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic here (create user, set initial role)
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#E6E5DF] items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">Create Account</h2>
        <p className="text-sm text-gray-500 mb-8">Join FlowBoard to start organizing your work.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="John Doe" required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="john@flowboard.com" required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="••••••••" required 
            />
          </div>

          <button type="submit" className="w-full bg-[#284B38] text-white rounded-lg py-3 font-semibold hover:bg-[#1E3A2B] mt-4">
            Sign Up
          </button>

          <div className="text-center text-sm text-gray-500 pt-4">
            Already have an account? <Link to="/login" className="text-[#8B5A43] font-semibold hover:underline">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}