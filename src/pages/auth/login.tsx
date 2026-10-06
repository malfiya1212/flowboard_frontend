import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: 'user_123', name: email.split('@')[0], email, role: 'Developer | Scrum Master' });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen font-sans">
      
      {/* 
        LEFT SIDE - BRANDING 
        Responsive: Hidden on small mobile. Shows as 50% width on tablet (md) and up. 
        Spacing: Uses 'items-end' and 'pr-16 lg:pr-24' to create a large gap away from the center split.
      */}
      <div className="hidden md:flex flex-col justify-center items-end w-1/2 bg-[#FDF9F1] pl-8 md:pr-12 lg:pr-24 xl:pr-32 py-16">
        <div className="max-w-md w-full">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-7">
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-[rgb(214, 234, 231)]"
            >
              <path d="M75 20 H35 C28 20 20 25 18 32 L15 40 H75 Z" fill="currentColor"/>
              <path d="M65 45 H25 C18 45 10 50 8 57 L5 65 H65 Z" fill="currentColor"/>
              <path d="M55 70 H15 C8 70 0 75 -2 82 L-5 90 H55 Z" fill="currentColor"/>
            </svg>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Flowboard</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 leading-tight">
            Organize work.<br />Build better software.
          </h1>
          
          <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed">
            Manage development tasks, responsibilities, priorities and progress in one organized workspace.
          </p>
        </div>
      </div>

      {/* 
        RIGHT SIDE - LOGIN FORM 
        Responsive: 100% width on mobile, 50% width on tablet (md) and up.
        Spacing: Uses 'items-start' and 'pl-16 lg:pl-24' to push the form away from the center split. 
      */}
      <div className="w-full md:w-1/3 bg-[#E6E5DF] flex items-center justify-center md:justify-start p-6 sm:p-12 md:pl-12 lg:pl-24 xl:pl-32">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md p-8 sm:p-10 border border-gray-100">
          
          {/* Mobile-only logo (shows up when the left side is hidden) */}
          <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#008f7a]">
              <path d="M75 20 H35 C28 20 20 25 18 32 L15 40 H75 Z" fill="currentColor"/>
              <path d="M65 45 H25 C18 45 10 50 8 57 L5 65 H65 Z" fill="currentColor"/>
              <path d="M55 70 H15 C8 70 0 75 -2 82 L-5 90 H55 Z" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Flowboard</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Log in to continue to your workspace.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#284B38] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#284B38]/10 transition-all duration-200"
                placeholder="please enter valid email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#284B38] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#284B38]/10 pr-10 transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#284B38] focus:outline-none transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-[#284B38] font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#284B38] text-white rounded-lg py-3.5 mt-2 font-semibold hover:bg-[#1E3A2B] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
            >
              Login
            </button>

            <div className="text-center text-sm text-gray-600 pt-5 mt-2 border-t border-gray-100">
              Don't have an account? <Link to="/signup" className="text-[#8B5A43] font-bold hover:underline transition-all">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
}