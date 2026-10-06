import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Enforce the Admin role for this entry point
    login({ email, password } as any);
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#284B38] items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10 border-t-8 border-[#8B5A43]">
        
        {/* Header Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#FDF9F1] text-[#284B38] px-4 py-2 rounded-lg font-bold text-xl border border-gray-200 tracking-wide">
            FlowBoard Admin
          </div>
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-center text-gray-900 mb-2">
          System Access
        </h2>
        <p className="text-sm text-center text-gray-500 mb-8">
          Authorized personnel only. Enter your admin credentials to continue.
        </p>

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Administrator Email
            </label>
            <input 
              id="admin-email"
              type="email" 
              className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A43] transition-shadow"
              placeholder="admin@flowboard.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Password
            </label>
            <input 
              id="admin-password"
              type="password" 
              className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A43] transition-shadow"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#8B5A43] text-white rounded-lg py-3 font-bold hover:bg-[#6A4331] transition-colors mt-2 shadow-md"
          >
            Access Control Panel
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            FlowBoard Original Software System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}