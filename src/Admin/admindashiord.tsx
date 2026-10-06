import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { 
  Users, ShieldCheck, KanbanSquare, Settings, LayoutDashboard, 
  LogOut, Menu, X, Search, Edit, Trash2, UserPlus, 
  Activity, Plus, Save, CheckCircle2, AlertCircle
} from 'lucide-react';

// --- MOCK DATA ---
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@flowboard.com', role: 'Developer', status: 'Active' },
  { id: 2, name: 'Sarah Smith', email: 'sarah.s@flowboard.com', role: 'Scrum Master', status: 'Active' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@flowboard.com', role: 'Developer', status: 'Offline' },
  { id: 4, name: 'System Admin', email: 'admin@flowboard.com', role: 'Admin', status: 'Active' },
];

const mockTasks = [
  { id: 'TSK-101', title: 'Setup Authentication Pipeline', assignee: 'John Doe', status: 'In Progress', priority: 'High' },
  { id: 'TSK-102', title: 'Design Database Schema', assignee: 'Sarah Smith', status: 'Done', priority: 'Critical' },
  { id: 'TSK-103', title: 'Fix Navigation Bug on Mobile', assignee: 'Unassigned', status: 'Backlog', priority: 'Medium' },
];

const mockRoles = [
  { id: 1, name: 'Admin', users: 2, permissions: ['Full Access', 'Delete Users', 'System Config'] },
  { id: 2, name: 'Scrum Master', users: 5, permissions: ['Create Tasks', 'Assign Users', 'Edit Sprints'] },
  { id: 3, name: 'Developer', users: 18, permissions: ['Move Tasks', 'Comment', 'Log Time'] },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const navItems = [
    { id: 'overview', name: 'System Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'users', name: 'Manage Users', icon: <Users size={20} /> },
    { id: 'roles', name: 'Roles & Permissions', icon: <ShieldCheck size={20} /> },
    { id: 'tasks', name: 'Global Tasks', icon: <KanbanSquare size={20} /> },
    { id: 'settings', name: 'System Settings', icon: <Settings size={20} /> },
  ];

  // --- RENDER CONTENT BASED ON ACTIVE TAB ---
  const renderContent = () => {
    switch (activeTab) {
      
      // 1. SYSTEM OVERVIEW
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#284B38]">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">System Status</h3>
                <p className="text-3xl font-bold text-[#284B38] flex items-center gap-2"><CheckCircle2 size={24}/> Online</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity size={20}/> Recent System Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#8B5A43]"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Admin generated new workspace report.</p>
                      <p className="text-xs text-gray-400">{i * 2} hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // 2. MANAGE USERS
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]/20 focus:border-[#284B38] transition-all" />
              </div>
              <button className="flex items-center gap-2 bg-[#284B38] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1E3A2B] transition-colors">
                <UserPlus size={18} /> Create User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-600">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors mx-1"><Edit size={18} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors mx-1"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // 3. ROLES & PERMISSIONS
      case 'roles':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">System Roles</h3>
              <button className="flex items-center gap-2 bg-[#8B5A43] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#6A4331] transition-colors">
                <Plus size={18} /> New Role
              </button>
            </div>
            <div className="p-6 grid gap-4">
              {mockRoles.map(role => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#284B38] transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{role.name}</h4>
                    <p className="text-sm text-gray-500">{role.users} Active Users assigned</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map(p => (
                      <span key={p} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md">{p}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[#284B38] hover:underline text-sm font-semibold">Edit Policy</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 4. GLOBAL TASKS
      case 'tasks':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <span className="font-semibold text-sm">Admin Override Mode: You can force-delete or reassign any task.</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-400 font-mono mb-1">{t.id}</div>
                        <div className="font-semibold text-gray-800">{t.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.assignee}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 border border-gray-200 rounded-full text-xs font-semibold bg-gray-50">{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-sm font-semibold text-blue-600 hover:underline mx-2">Reassign</button>
                         <button className="text-sm font-semibold text-red-600 hover:underline mx-2">Force Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // 5. SYSTEM SETTINGS
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Global Configuration</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Workspace Name</label>
                <input type="text" defaultValue="FlowBoard Enterprise" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#284B38]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                <input type="email" defaultValue="support@flowboard.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#284B38]" />
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-800">Maintenance Mode</h4>
                  <p className="text-xs text-gray-500">Lock out all non-admin users immediately.</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full cursor-pointer relative transition-colors"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div></div>
              </div>
              <div className="pt-6">
                <button type="button" className="flex items-center gap-2 bg-[#284B38] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1E3A2B] transition-colors">
                  <Save size={18} /> Save Settings
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F1] font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Forest Green */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#284B38] text-white transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDF9F1] text-[#284B38] p-1.5 rounded-lg font-bold">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold tracking-wide">Admin Panel</span>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? 'bg-[#8B5A43] text-white shadow-md' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-black/20">
            <div className="w-8 h-8 rounded-full bg-[#8B5A43] flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold truncate">{user?.name || 'System Admin'}</p>
              <p className="text-xs text-gray-400 truncate">Full System Access</p>
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-600 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-serif font-bold text-gray-800">
              {navItems.find(i => i.id === activeTab)?.name}
            </h1>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}