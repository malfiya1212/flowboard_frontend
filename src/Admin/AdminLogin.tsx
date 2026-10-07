import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: 'admin_01', name: 'System Admin', email, role: 'Admin' });
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#E6EDE9] items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(248, 244, 244, 0.24)] w-full max-w-md p-8 sm:p-10 border-t-8 border-[#8B5A43]">
        
        {/* Header Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#FDF9F1] text-[#284B38] px-5 py-2.5 rounded-lg font-bold text-xl border border-gray-200 tracking-wide shadow-sm">
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
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Administrator Email
            </label>
            <input 
              id="admin-email"
              type="email" 
              className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#8B5A43] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#8B5A43]/10 transition-all duration-200"
              placeholder="admin@flowboard.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="admin-password" className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input 
                id="admin-password"
                type={showPassword ? "text" : "password"} 
                className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#8B5A43] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#8B5A43]/10 pr-10 transition-all duration-200"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#8B5A43] focus:outline-none transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* FIXED BUTTON: Changed bg-[rgb(...)] to bg-[#8B5A43] so the white text is visible */}
          <button 
            type="submit" 
            className="w-full bg-[#8B5A43] text-white rounded-lg py-3.5 mt-2 font-semibold hover:bg-[#6A4331] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
          >
            Access Control Panel
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">
            FlowBoard Original Software System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}