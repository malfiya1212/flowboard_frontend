import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


// Page Components
import { Login } from './pages/auth/login';
import { SignUp } from './pages/auth/signup';
import { ForgotPassword } from './pages/auth/forgetpassword';

export default function App() {
  return (
    <BrowserRouter>
      
        <Routes>
          {/* Redirect root '/' to '/login' */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Catch-all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      
    </BrowserRouter>
  );
}