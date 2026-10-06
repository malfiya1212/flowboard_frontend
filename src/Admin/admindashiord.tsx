import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { 
  Users, ShieldCheck, KanbanSquare, Settings, LayoutDashboard, 
  LogOut, Menu, X, Search, Edit, Trash2, UserPlus, 
  Activity, Plus, Save, CheckCircle2, AlertCircle, 
  Briefcase, Users2, FileBarChart, History, KeyRound, 
  Power, Download, ChevronRight, FolderKanban
} from 'lucide-react';

// --- ENTERPRISE MOCK DATA ---
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@flowboard.com', role: 'Developer', status: 'Active', lastLogin: '2 mins ago' },
  { id: 2, name: 'Sarah Smith', email: 'sarah.s@flowboard.com', role: 'Scrum Master', status: 'Active', lastLogin: '1 hour ago' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@flowboard.com', role: 'Developer', status: 'Suspended', lastLogin: '5 days ago' },
  { id: 4, name: 'System Admin', email: 'admin@flowboard.com', role: 'Admin', status: 'Active', lastLogin: 'Just now' },
];

const mockTasks = [
  { id: 'TSK-101', title: 'Setup Authentication Pipeline', project: 'Core Platform', assignee: 'John Doe', status: 'In Progress' },
  { id: 'TSK-102', title: 'Design Database Schema', project: 'Core Platform', assignee: 'Sarah Smith', status: 'Review' },
  { id: 'TSK-145', title: 'Fix Navigation Bug on Mobile', project: 'Client Portal', assignee: 'Unassigned', status: 'Backlog' },
];

const mockAuditLogs = [
  { id: 1, action: 'User Permissions Modified', target: 'Mike Johnson', actor: 'System Admin', time: '10:42 AM', ip: '192.168.1.45' },
  { id: 2, action: 'Project Deleted', target: 'Legacy API V1', actor: 'Sarah Smith', time: '09:15 AM', ip: '10.0.0.12' },
  { id: 3, action: 'Failed Login Attempt', target: 'admin@flowboard.com', actor: 'System', time: '02:30 AM', ip: '45.22.19.8' },
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
    { id: 'teams', name: 'Teams', icon: <Users2 size={20} /> },
    { id: 'projects', name: 'Projects', icon: <Briefcase size={20} /> },
    { id: 'tasks', name: 'All Tasks', icon: <KanbanSquare size={20} /> },
    { id: 'reports', name: 'Reports', icon: <FileBarChart size={20} /> },
    { id: 'logs', name: 'Activity / Audit Logs', icon: <History size={20} /> },
    { id: 'settings', name: 'System Settings', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      
      // 1. SYSTEM OVERVIEW
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Users</h3>
                  <Users size={20} className="text-[#284B38]" />
                </div>
                <p className="text-3xl font-bold text-gray-900">124</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Projects</h3>
                  <Briefcase size={20} className="text-[#284B38]" />
                </div>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">System Alerts</h3>
                  <AlertCircle size={20} className="text-[#8B5A43]" />
                </div>
                <p className="text-3xl font-bold text-[#8B5A43]">3</p>
              </div>
              <div className="bg-[#284B38] text-white p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider">System Status</h3>
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
                <p className="text-2xl font-bold">Optimal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Recent Audit Logs</h3>
                  <button onClick={() => setActiveTab('logs')} className="text-sm font-semibold text-[#284B38] hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 mt-2 rounded-full ${log.actor === 'System' ? 'bg-red-500' : 'bg-[#8B5A43]'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                        <p className="text-xs text-gray-500">Target: {log.target} • By: {log.actor}</p>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{log.time}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab('users')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#284B38] hover:bg-gray-50 transition-all">
                    <span className="text-sm font-semibold text-gray-700">Add New User</span>
                    <Plus size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => setActiveTab('projects')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#284B38] hover:bg-gray-50 transition-all">
                    <span className="text-sm font-semibold text-gray-700">Create Project</span>
                    <FolderKanban size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => setActiveTab('reports')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#284B38] hover:bg-gray-50 transition-all">
                    <span className="text-sm font-semibold text-gray-700">Generate System Report</span>
                    <Download size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // 2. MANAGE USERS (Full CRUD + Activate/Reset)
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search users by name or email..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]/20 focus:border-[#284B38]" />
              </div>
              <button className="flex items-center gap-2 bg-[#284B38] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E3A2B] shadow-sm transition-all">
                <UserPlus size={18} /> Create User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${u.role === 'Admin' ? 'bg-[#8B5A43]/10 text-[#8B5A43] border border-[#8B5A43]/20' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button title="Reset Password" className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"><KeyRound size={16} strokeWidth={2.5} /></button>
                          <button title={u.status === 'Active' ? 'Suspend User' : 'Activate User'} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Power size={16} strokeWidth={2.5} /></button>
                          <button title="Edit Details" className="p-2 text-gray-500 hover:text-[#284B38] hover:bg-green-50 rounded-md transition-colors"><Edit size={16} strokeWidth={2.5} /></button>
                          <button title="Delete User" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} strokeWidth={2.5} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // 6. ALL TASKS (Delegation & Global View)
      case 'tasks':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
              <div className="flex items-center gap-3 text-orange-800">
                <AlertCircle size={20} />
                <div>
                  <span className="font-bold text-sm block">Global Task Override</span>
                  <span className="text-xs">As an Admin, you can view, force-reassign, edit, or delete any task across all projects.</span>
                </div>
              </div>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors">
                Create Global Task
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Task Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-400 mb-1">{t.id}</div>
                        <div className="font-bold text-gray-900">{t.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{t.project}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${t.assignee === 'Unassigned' ? 'text-orange-500 italic' : 'text-gray-800'}`}>
                          {t.assignee}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 border border-gray-200 rounded-md text-xs font-bold bg-white shadow-sm">{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                         <button className="text-sm font-bold text-[#284B38] hover:underline">Reassign</button>
                         <button className="text-sm font-bold text-gray-500 hover:text-gray-900 hover:underline">Edit</button>
                         <button className="text-sm font-bold text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // AUDIT LOGS
      case 'logs':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Audit Logs</h3>
                <p className="text-sm text-gray-500">Immutable record of system-level actions.</p>
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export CSV
              </button>
            </div>
            <div className="space-y-4">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{log.action} <span className="font-normal text-gray-500 ml-1">on {log.target}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Actor: <span className="font-semibold">{log.actor}</span> • IP: {log.ip}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-500 bg-white px-3 py-1.5 rounded border border-gray-200">
                    {log.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // FALLBACK FOR OTHER TABS (Roles, Teams, Projects, Reports, Settings)
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
              <Settings size={32} className="text-[#8B5A43]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Module Active</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              The <span className="font-semibold text-gray-700">{navItems.find(i => i.id === activeTab)?.name}</span> module is initialized. Full CRUD capabilities and settings will render here.
            </p>
            <button onClick={() => setActiveTab('users')} className="text-sm font-bold text-[#284B38] hover:underline flex items-center gap-1">
              Return to User Management <ChevronRight size={16} />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F1] font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Forest Green */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#284B38] text-white transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Area */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDF9F1] text-[#284B38] p-2 rounded-lg shadow-sm">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide block">Admin Panel</span>
              <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold block mt-0.5">Full Access Mode</span>
            </div>
          </div>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Add a visual separator before Settings
            const isSettings = item.id === 'settings';
            return (
              <React.Fragment key={item.id}>
                {isSettings && <div className="h-px bg-white/10 my-4 mx-2" />}
                <button 
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-[#8B5A43] text-white shadow-md shadow-black/10' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5A43] border-2 border-white/20 flex items-center justify-center font-bold text-sm shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{user?.name || 'System Admin'}</p>
              <p className="text-xs text-green-400 truncate font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Authenticated
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-200 bg-red-500/10 hover:bg-red-500/20 hover:text-red-100 transition-colors border border-red-500/20"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header Breadcrumb */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                {navItems.find(i => i.id === activeTab)?.name}
              </h1>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1 hidden sm:block">
                FlowBoard Enterprise Admin Workspace
              </p>
            </div>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}