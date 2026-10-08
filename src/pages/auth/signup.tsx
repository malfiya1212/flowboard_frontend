import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Name required check
    if (!name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    // 2. Email valid check using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // 3. Password minimum length check (e.g., at least 6 characters)
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // 4. Passwords must match check
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    // Attempt signup through auth context
    const success = signup(name, email, password);
    if (success) {
      alert(`Signup successful, ${name}! Please check your email to verify your account before logging in.`);
      navigate('/login');
    } else {
      setErrorMsg('An account with this email already exists.');
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex flex-col justify-center items-end w-1/2 bg-[#FDF9F1] pl-8 md:pr-12 lg:pr-24 xl:pr-32 py-16">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 mb-7">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[rgb(214, 234, 231)]">
              <path d="M75 20 H35 C28 20 20 25 18 32 L15 40 H75 Z" fill="currentColor"/>
              <path d="M65 45 H25 C18 45 10 50 8 57 L5 65 H65 Z" fill="currentColor"/>
              <path d="M55 70 H15 C8 70 0 75 -2 82 L-5 90 H55 Z" fill="currentColor"/>
            </svg>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Flowboard</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 leading-tight">
            Join the team.<br />Start building.
          </h1>
          
          <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed">
            Create your account to access tasks, track your progress, and collaborate seamlessly.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP FORM */}
      <div className="w-full md:w-1/2 bg-[#E6E5DF] flex items-center justify-center md:justify-start p-6 sm:p-12 md:pl-12 lg:pl-24 xl:pl-32">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md p-8 sm:p-10 border border-gray-100">
          
          {/* Mobile-only logo */}
          <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#008f7a]">
              <path d="M75 20 H35 C28 20 20 25 18 32 L15 40 H75 Z" fill="currentColor"/>
              <path d="M65 45 H25 C18 45 10 50 8 57 L5 65 H65 Z" fill="currentColor"/>
              <path d="M55 70 H15 C8 70 0 75 -2 82 L-5 90 H55 Z" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Flowboard</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Create an account</h2>
          <p className="text-sm text-gray-500 mb-4">Enter your details to get started.</p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input 
                type="text" 
                className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#284B38] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#284B38]/10 transition-all duration-200"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#284B38] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#284B38]/10 transition-all duration-200"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#284B38] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#284B38]/10 pr-10 transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="w-full bg-[#F3F4F1] border border-transparent focus:bg-white focus:border-[#284B38] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#284B38]/10 pr-10 transition-all duration-200"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#284B38] focus:outline-none transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#284B38] text-white rounded-lg py-3.5 mt-4 font-semibold hover:bg-[#1E3A2B] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
            >
              Sign Up
            </button>

            <div className="text-center text-sm text-gray-600 pt-4 mt-2 border-t border-gray-100">
              Already have an account? <Link to="/login" className="text-[#8B5A43] font-bold hover:underline transition-all">Log in</Link>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
}