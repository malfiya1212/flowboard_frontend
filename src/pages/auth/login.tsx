import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import { Eye, EyeOff } from 'lucide-react';

type Role = 'Developer' | 'ScrumMaster' ;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('Developer'); // For demonstration
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: '', name: '', email, role: selectedRole });
    
    // Redirect based on role
    
  };
  {/* REPLACE YOUR CURRENT PASSWORD DIV WITH THIS */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38] pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* END OF REPLACEMENT */}

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#FDF9F1] p-16">
        <div className="flex items-center gap-2 mb-12">
          <div className="bg-[#284B38] text-white p-2 rounded-md font-bold">F</div>
          <span className="text-xl font-semibold text-[#284B38]">FlowBoard</span>
        </div>
        <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">
          Organize work.<br />Build better software.
        </h1>
        <p className="text-lg text-gray-700 mb-11">
          Manage development tasks, responsibilities, priorities and progress in one organized workspace.
        </p>
        {/* Placeholder for the sticky note illustration */}
        
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#E6E5DF] flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Log in to continue to your workspace.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role Selector for testing - usually handled by backend auth response */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Login </label>
              <select 
                className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm"
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value as Role)}
              >
                <option value="Developer">Developer / Normal User</option>
                <option value="ScrumMaster">Scrum Master</option>
               
              </select>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-[#284B38]">Forgot password?</Link>
            </div>

            <button type="submit" className="w-full bg-[#284B38] text-white rounded-lg py-3 font-semibold hover:bg-[#1E3A2B] transition">
              Login
            </button>

            <div className="text-center text-sm text-gray-500 pt-4">
              Don't have an account? <Link to="/signup" className="text-[#8B5A43] font-semibold hover:underline">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}