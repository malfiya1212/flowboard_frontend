import React from 'react';
import { useAuth } from '../context/authcontext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // Route protection: If not logged in, or not an Admin, kick them out
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'Admin') return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-[#FDF9F1] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Control Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-[#E6E5DF] px-3 py-1 rounded-full">
              {user.name} (Admin)
            </span>
            <button onClick={logout} className="text-sm text-red-600 font-semibold hover:underline">
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-4">Manage users, roles, and permissions.</p>
            <button className="text-sm bg-[#284B38] text-white px-4 py-2 rounded-lg">Manage Users</button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">System Settings</h3>
            <p className="text-sm text-gray-600 mb-4">Configure global FlowBoard settings.</p>
            <button className="text-sm bg-[#284B38] text-white px-4 py-2 rounded-lg">Open Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}