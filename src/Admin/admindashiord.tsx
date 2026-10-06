import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { 
  Users, 
  ShieldCheck, 
  KanbanSquare, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  // Navigation items mapped directly to your SRS requirements
  const navItems = [
    { name: 'System Overview', icon: <LayoutDashboard size={20} />, active: true },
    { name: 'Manage Users', icon: <Users size={20} /> },
    { name: 'Roles & Permissions', icon: <ShieldCheck size={20} /> },
    { name: 'Task Management', icon: <KanbanSquare size={20} /> },
    { name: 'System Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F1] font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Forest Green */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#284B38] text-white transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDF9F1] text-[#284B38] p-1.5 rounded-lg font-bold">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold tracking-wide">Admin Panel</span>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-[#8B5A43] text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-black/20">
            <div className="w-8 h-8 rounded-full bg-[#8B5A43] flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold truncate">{user?.name || 'System Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@flowboard.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut size={20} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-serif font-bold text-gray-800">System Overview</h1>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {/* SRS Feature Cards (Placeholders for future development) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">124</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Tasks</h3>
              <p className="text-3xl font-bold text-gray-900">856</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-yellow-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Roles Configured</h3>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#8B5A43]">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">System Status</h3>
              <p className="text-3xl font-bold text-green-600">Online</p>
            </div>

          </div>

          {/* Placeholder for Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center h-96 flex flex-col items-center justify-center">
            <LayoutDashboard size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Select a module from the sidebar</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              You have full system access. From here you can manage users, assign tasks, and configure roles.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}