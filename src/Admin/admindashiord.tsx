import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { 
  Users, ShieldCheck, KanbanSquare, Settings, LayoutDashboard, 
  LogOut, Menu, X, Search, Edit, Trash2, UserPlus, 
  Plus, Save, CheckCircle2, AlertCircle, 
  Briefcase, Users2, FileBarChart, History, KeyRound, 
  Power, Download, FolderKanban, Lock, Moon
} from 'lucide-react';

// --- MOCK DATA ---
const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@flowboard.com', role: 'Developer', status: 'Active' },
  { id: 2, name: 'Sarah Smith', email: 'sarah.s@flowboard.com', role: 'Scrum Master', status: 'Active' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@flowboard.com', role: 'Developer', status: 'Suspended' },
  { id: 4, name: 'System Admin', email: 'admin@flowboard.com', role: 'Admin', status: 'Active' },
];

const initialRoles = [
  { id: 1, name: 'Admin', users: 2, permissions: ['Full System Access', 'Manage Users', 'Configure Settings'] },
  { id: 2, name: 'Scrum Master', users: 5, permissions: ['Manage Sprints', 'Assign Tasks', 'View Reports'] },
  { id: 3, name: 'Developer', users: 18, permissions: ['Update Task Status', 'Log Hours', 'Add Comments'] },
];

const initialTeams = [
  { id: 1, name: 'Frontend Guild', members: 8, lead: 'Sarah Smith' },
  { id: 2, name: 'Backend Services', members: 6, lead: 'John Doe' },
  { id: 3, name: 'QA & Testing', members: 4, lead: 'Mike Johnson' },
];

const initialProjects = [
  { id: 1, name: 'Core Platform V2', status: 'Active', progress: 75, team: 'Backend Services' },
  { id: 2, name: 'Client Mobile App', status: 'Planning', progress: 10, team: 'Frontend Guild' },
  { id: 3, name: 'Legacy API Migration', status: 'On Hold', progress: 45, team: 'Backend Services' },
];

const initialTasks = [
  { id: 'TSK-101', title: 'Setup Authentication Pipeline', project: 'Core Platform V2', assignee: 'John Doe', status: 'In Progress' },
  { id: 'TSK-102', title: 'Design Database Schema', project: 'Core Platform V2', assignee: 'Sarah Smith', status: 'Review' },
  { id: 'TSK-145', title: 'Fix Navigation Bug on Mobile', project: 'Client Mobile App', assignee: 'Unassigned', status: 'Backlog' },
];

const mockAuditLogs = [
  { id: 1, action: 'User Permissions Modified', target: 'Mike Johnson', actor: 'System Admin', time: '10:42 AM', ip: '192.168.1.45' },
  { id: 2, action: 'Project Deleted', target: 'Legacy API V1', actor: 'Sarah Smith', time: '09:15 AM', ip: '10.0.0.12' },
  { id: 3, action: 'Failed Login Attempt', target: 'admin@flowboard.com', actor: 'System', time: '02:30 AM', ip: '45.22.19.8' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // Defaulting to Settings to see the new toggle
  
  // --- SETTINGS STATE ---
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('FlowBoard Enterprise');

  // --- DATA STATES ---
  const [usersData, setUsersData] = useState(initialUsers);
  const [rolesData, setRolesData] = useState(initialRoles);
  const [teamsData, setTeamsData] = useState(initialTeams);
  const [projectsData, setProjectsData] = useState(initialProjects);
  const [tasksData, setTasksData] = useState(initialTasks);

  // --- MODAL STATES ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  // --- VERY SIMPLE ACTION FUNCTIONS ---
  
  // Users
  const handleDeleteUser = (id: number, name: string) => {
    if(window.confirm(`Permanently delete ${name}?`)) setUsersData(usersData.filter(u => u.id !== id));
  };
  const handleToggleStatus = (id: number) => {
    setUsersData(usersData.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };
  const handleUserFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string, newEmail = formData.get('email') as string, newRole = formData.get('role') as string;
    if (userModalMode === 'edit' && selectedUser) setUsersData(usersData.map(u => u.id === selectedUser.id ? { ...u, name: newName, email: newEmail, role: newRole } : u));
    else setUsersData([...usersData, { id: Date.now(), name: newName, email: newEmail, role: newRole, status: 'Active' }]);
    setIsUserModalOpen(false);
  };

  // Roles
  const handleDeleteRole = (id: number, name: string) => {
    if (name === 'Admin') return alert("System Action Blocked: You cannot delete the core Admin role.");
    if(window.confirm(`Delete the ${name} role?`)) setRolesData(rolesData.filter(r => r.id !== id));
  };
  const handleRoleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string, newPerms = (formData.get('permissions') as string).split(',').map(p => p.trim()).filter(p => p);
    if (roleModalMode === 'edit' && selectedRole) setRolesData(rolesData.map(r => r.id === selectedRole.id ? { ...r, name: newName, permissions: newPerms } : r));
    else setRolesData([...rolesData, { id: Date.now(), name: newName, users: 0, permissions: newPerms.length ? newPerms : ['Basic Access'] }]);
    setIsRoleModalOpen(false);
  };

  // Teams
  const handleDeleteTeam = (id: number, name: string) => {
    if(window.confirm(`Disband the ${name} team?`)) setTeamsData(teamsData.filter(t => t.id !== id));
  };
  const handleTeamFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string, newLead = formData.get('lead') as string, newMembers = parseInt(formData.get('members') as string) || 0;
    if (teamModalMode === 'edit' && selectedTeam) setTeamsData(teamsData.map(t => t.id === selectedTeam.id ? { ...t, name: newName, lead: newLead, members: newMembers } : t));
    else setTeamsData([...teamsData, { id: Date.now(), name: newName, lead: newLead, members: newMembers }]);
    setIsTeamModalOpen(false);
  };

  // Projects
  const handleDeleteProject = (id: number, name: string) => {
    if(window.confirm(`Permanently delete the project "${name}"?`)) setProjectsData(projectsData.filter(p => p.id !== id));
  };
  const handleProjectFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string, newStatus = formData.get('status') as string, newTeam = formData.get('team') as string, newProgress = parseInt(formData.get('progress') as string) || 0;
    if (projectModalMode === 'edit' && selectedProject) setProjectsData(projectsData.map(p => p.id === selectedProject.id ? { ...p, name: newName, status: newStatus, team: newTeam, progress: newProgress } : p));
    else setProjectsData([...projectsData, { id: Date.now(), name: newName, status: newStatus, team: newTeam, progress: newProgress }]);
    setIsProjectModalOpen(false);
  };

  // Tasks
  const handleDeleteTask = (id: string, title: string) => {
    if(window.confirm(`WARNING: Force-delete the task "${title}"? This cannot be undone.`)){
      setTasksData(tasksData.filter(t => t.id !== id));
    }
  };
  const handleTaskFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = formData.get('title') as string, newProject = formData.get('project') as string, newAssignee = formData.get('assignee') as string, newStatus = formData.get('status') as string;
    if (taskModalMode === 'edit' && selectedTask) setTasksData(tasksData.map(t => t.id === selectedTask.id ? { ...t, title: newTitle, project: newProject, assignee: newAssignee, status: newStatus } : t));
    else setTasksData([...tasksData, { id: `TSK-${Math.floor(Math.random() * 900) + 100}`, title: newTitle, project: newProject, assignee: newAssignee, status: newStatus }]);
    setIsTaskModalOpen(false);
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
      
      // 1. OVERVIEW
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Users</h3>
                  <Users size={20} className="text-[#284B38]" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{usersData.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Projects</h3>
                  <Briefcase size={20} className="text-[#284B38]" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{projectsData.length}</p>
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
                  {/* THIS IS THE VIEW ALL BUTTON! It jumps to 'logs' */}
                  <button onClick={() => setActiveTab('logs')} className="text-sm font-bold text-[#284B38] hover:underline">View All</button>
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
                  {/* THESE SHORTCUTS OPEN THE MODALS DIRECTLY */}
                  <button onClick={() => { setActiveTab('users'); setUserModalMode('create'); setSelectedUser(null); setIsUserModalOpen(true); }} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#284B38] hover:bg-gray-50 transition-all">
                    <span className="text-sm font-semibold text-gray-700">Add New User</span>
                    <Plus size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => { setActiveTab('projects'); setProjectModalMode('create'); setSelectedProject(null); setIsProjectModalOpen(true); }} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#284B38] hover:bg-gray-50 transition-all">
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

      // 2. USERS
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search users by name or email..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]/20 focus:border-[#284B38]" />
              </div>
              <button onClick={() => { setUserModalMode('create'); setSelectedUser(null); setIsUserModalOpen(true); }} className="flex items-center gap-2 bg-[#284B38] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E3A2B] shadow-sm transition-all">
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
                  {usersData.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td></tr>
                  ) : usersData.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${u.role === 'Admin' ? 'bg-[#8B5A43]/10 text-[#8B5A43] border border-[#8B5A43]/20' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>{u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleResetPassword(u.email)} title="Reset Password" className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors shadow-sm"><KeyRound size={16} strokeWidth={2.5} /></button>
                          <button onClick={() => handleToggleStatus(u.id)} title={u.status === 'Active' ? 'Suspend User' : 'Activate User'} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors shadow-sm"><Power size={16} strokeWidth={2.5} /></button>
                          <button onClick={() => { setUserModalMode('edit'); setSelectedUser(u); setIsUserModalOpen(true); }} title="Edit Details" className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors shadow-sm"><Edit size={16} strokeWidth={2.5} /></button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} title="Delete User" className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm"><Trash2 size={16} strokeWidth={2.5} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // 3. ROLES
      case 'roles':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Access Control</h3>
                <p className="text-sm text-gray-500">Manage global roles and granular permissions.</p>
              </div>
              <button onClick={() => { setRoleModalMode('create'); setSelectedRole(null); setIsRoleModalOpen(true); }} className="flex items-center gap-2 bg-[#8B5A43] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#6A4331]">
                <Plus size={18} /> New Role
              </button>
            </div>
            <div className="grid gap-4">
              {rolesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">No roles found.</div>
              ) : rolesData.map(role => (
                <div key={role.id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#284B38] transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{role.name}</h4>
                      {role.name === 'Admin' && <Lock size={14} className="text-red-500" title="System Protected Role" />}
                    </div>
                    <p className="text-sm text-gray-500">{role.users} active users assigned</p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {role.permissions.map(p => (
                      <span key={p} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md border border-gray-200">{p}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button onClick={() => { setRoleModalMode('edit'); setSelectedRole(role); setIsRoleModalOpen(true); }} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors shadow-sm" title="Edit Permissions">
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    {role.name !== 'Admin' && (
                      <button onClick={() => handleDeleteRole(role.id, role.name)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm" title="Delete Role">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 4. TEAMS
      case 'teams':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="text-lg font-bold text-gray-900">Organization Teams</h3>
               <button onClick={() => { setTeamModalMode('create'); setSelectedTeam(null); setIsTeamModalOpen(true); }} className="flex items-center gap-2 bg-[#284B38] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E3A2B] shadow-sm">
                 <Users2 size={18} /> Create Team
               </button>
             </div>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-200 bg-white">
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Name</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Lead</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Members Count</th>
                   <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {teamsData.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">No teams found.</td></tr>
                  ) : teamsData.map((team) => (
                   <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4 font-bold text-gray-900">{team.name}</td>
                     <td className="px-6 py-4 text-sm font-medium text-gray-700">{team.lead}</td>
                     <td className="px-6 py-4">
                       <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{team.members} Members</span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setTeamModalMode('edit'); setSelectedTeam(team); setIsTeamModalOpen(true); }} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors shadow-sm" title="Edit Team">
                            <Edit size={16} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => handleDeleteTeam(team.id, team.name)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm" title="Delete Team">
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        );

      // 5. PROJECTS
      case 'projects':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Global Project Directory</h3>
              <button onClick={() => { setProjectModalMode('create'); setSelectedProject(null); setIsProjectModalOpen(true); }} className="flex items-center gap-2 bg-[#284B38] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#1E3A2B]">
                <FolderKanban size={18} /> New Project
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projectsData.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">No projects found.</div>
              ) : projectsData.map(proj => (
                <div key={proj.id} className="border border-gray-200 rounded-xl p-5 hover:border-[#284B38] transition-colors relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{proj.name}</h4>
                      <span className={`mt-1 inline-block text-[10px] uppercase font-bold px-2 py-1 rounded-md ${proj.status === 'Active' ? 'bg-green-100 text-green-700' : proj.status === 'On Hold' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{proj.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setProjectModalMode('edit'); setSelectedProject(proj); setIsProjectModalOpen(true); }} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors shadow-sm" title="Edit Project">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleDeleteProject(proj.id, proj.name)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm" title="Delete Project">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 font-semibold uppercase">Assigned to: <span className="text-gray-800">{proj.team}</span></p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1"><div className="bg-[#284B38] h-2 rounded-full" style={{ width: `${proj.progress}%` }}></div></div>
                  <p className="text-xs text-right font-bold text-gray-400">{proj.progress}% Complete</p>
                </div>
              ))}
            </div>
          </div>
        );

      // 6. TASKS
      case 'tasks':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
              <div className="flex items-center gap-3 text-orange-800">
                <AlertCircle size={20} />
                <div>
                  <span className="font-bold text-sm block">Global Task Override</span>
                  <span className="text-xs">As an Admin, you can force-reassign, edit, or delete any task across all projects.</span>
                </div>
              </div>
              <button onClick={() => { setTaskModalMode('create'); setSelectedTask(null); setIsTaskModalOpen(true); }} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors">
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
                  {tasksData.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No tasks found.</td></tr>
                  ) : tasksData.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-400 mb-1">{t.id}</div>
                        <div className="font-bold text-gray-900">{t.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{t.project}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        <span className={t.assignee === 'Unassigned' ? 'text-orange-500 italic' : ''}>{t.assignee}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 border border-gray-200 rounded-md text-xs font-bold bg-white shadow-sm">{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button onClick={() => { setTaskModalMode('edit'); setSelectedTask(t); setIsTaskModalOpen(true); }} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors shadow-sm" title="Edit/Reassign Task">
                             <Edit size={16} strokeWidth={2.5} />
                           </button>
                           <button onClick={() => handleDeleteTask(t.id, t.title)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm" title="Force Delete Task">
                             <Trash2 size={16} strokeWidth={2.5} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // 7. REPORTS
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[400px]">
            <FileBarChart size={48} className="text-[#8B5A43] mb-4" />
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Generate System Reports</h2>
            <p className="text-gray-500 mb-6 max-w-md text-center">Export comprehensive data regarding user activity, project velocity, and system health.</p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button onClick={() => alert('Downloading User Export CSV...')} className="bg-[#284B38] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#1E3A2B] flex items-center justify-center gap-2"><Download size={18}/> User Export (CSV)</button>
               <button onClick={() => alert('Downloading Audit Log PDF...')} className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-200 flex items-center justify-center gap-2"><Download size={18}/> Full Audit Log</button>
            </div>
          </div>
        );

      // 8. LOGS
      case 'logs':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Audit Logs</h3>
                <p className="text-sm text-gray-500">Immutable record of system-level actions.</p>
              </div>
            </div>
            <div className="space-y-4">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400"><History size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{log.action} <span className="font-normal text-gray-500 ml-1">on {log.target}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Actor: <span className="font-semibold">{log.actor}</span> • IP: {log.ip}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-500 bg-white px-3 py-1.5 rounded border border-gray-200 mt-3 sm:mt-0">{log.time}</div>
                </div>
              ))}
            </div>
          </div>
        );

      // 9. SETTINGS (Now with fully active toggle switches!)
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Global Configuration</h3>
            <form className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Workspace Name</label>
                <input 
                  type="text" 
                  value={workspaceName} 
                  onChange={(e) => setWorkspaceName(e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#284B38]" 
                />
              </div>
              
              {/* MAINTENANCE MODE TOGGLE */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-800">Maintenance Mode</h4>
                  <p className="text-xs text-gray-500">Lock out all non-admin users immediately.</p>
                </div>
                <div 
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)} 
                  className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-300 ${isMaintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow ${isMaintenanceMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
              </div>

              {/* DARK MODE TOGGLE */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><Moon size={16} /> Dark Mode (Beta)</h4>
                  <p className="text-xs text-gray-500">Switch dashboard to a darker color theme.</p>
                </div>
                <div 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-300 ${isDarkMode ? 'bg-[#284B38]' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button type="button" onClick={() => alert('Global settings successfully saved!')} className="flex items-center gap-2 bg-[#284B38] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#1E3A2B]">
                  <Save size={18} /> Save Global Settings
                </button>
              </div>
            </form>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className={`flex h-screen font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-[#F3F4F1]'}`}>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#284B38] text-white transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDF9F1] text-[#284B38] p-2 rounded-lg shadow-sm"><ShieldCheck size={24} strokeWidth={2.5} /></div>
            <div>
              <span className="text-xl font-bold tracking-wide block">Admin Panel</span>
              <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold block mt-0.5">Full Access Mode</span>
            </div>
          </div>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <React.Fragment key={item.id}>
              {item.id === 'settings' && <div className="h-px bg-white/10 my-4 mx-2" />}
              <button onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === item.id ? 'bg-[#8B5A43] text-white shadow-md shadow-black/10' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                {item.icon} {item.name}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5A43] border-2 border-white/20 flex items-center justify-center font-bold text-sm shadow-inner">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{user?.name || 'System Admin'}</p>
              <p className="text-xs text-green-400 truncate font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Authenticated</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-200 bg-red-500/10 hover:bg-red-500/20 hover:text-red-100 transition-colors border border-red-500/20">
            <LogOut size={16} strokeWidth={2.5} /> Secure Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">{navItems.find(i => i.id === activeTab)?.name}</h1>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1 hidden sm:block">{workspaceName} Admin Workspace</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8"><div className="max-w-7xl mx-auto">{renderContent()}</div></div>
      </main>

      {/* --- ALL MODALS --- */}
      
      {/* 1. USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{userModalMode === 'create' ? 'Create New User' : 'Edit User Details'}</h2>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors border border-gray-200"><X size={18} /></button>
            </div>
            <form onSubmit={handleUserFormSubmit} className="p-6 space-y-5">
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Full Name</label><input type="text" name="name" defaultValue={selectedUser?.name || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label><input type="email" name="email" defaultValue={selectedUser?.email || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">System Role</label><select name="role" defaultValue={selectedUser?.role || 'Developer'} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]"><option value="Developer">Developer</option><option value="Scrum Master">Scrum Master</option><option value="Admin">Admin</option></select></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6"><button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#284B38] hover:bg-[#1E3A2B] rounded-lg shadow-sm">{userModalMode === 'create' ? 'Create User' : 'Save Changes'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRoleModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{roleModalMode === 'create' ? 'Create New Role' : 'Edit Role Permissions'}</h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors border border-gray-200"><X size={18} /></button>
            </div>
            <form onSubmit={handleRoleFormSubmit} className="p-6 space-y-5">
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Role Name</label><input type="text" name="name" defaultValue={selectedRole?.name || ''} readOnly={selectedRole?.name === 'Admin'} className={`w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38] ${selectedRole?.name === 'Admin' ? 'opacity-60 cursor-not-allowed' : ''}`} required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Assigned Permissions</label><textarea name="permissions" defaultValue={selectedRole?.permissions?.join(', ') || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" rows={4} required></textarea></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6"><button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#8B5A43] hover:bg-[#6A4331] rounded-lg shadow-sm">{roleModalMode === 'create' ? 'Create Role' : 'Save Changes'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TEAM MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTeamModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{teamModalMode === 'create' ? 'Create New Team' : 'Manage Team Details'}</h2>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors border border-gray-200"><X size={18} /></button>
            </div>
            <form onSubmit={handleTeamFormSubmit} className="p-6 space-y-5">
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Team Name</label><input type="text" name="name" defaultValue={selectedTeam?.name || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Team Lead Name</label><input type="text" name="lead" defaultValue={selectedTeam?.lead || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Members</label><input type="number" name="members" min="1" defaultValue={selectedTeam?.members || 1} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6"><button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#284B38] hover:bg-[#1E3A2B] rounded-lg shadow-sm">{teamModalMode === 'create' ? 'Create Team' : 'Save Changes'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProjectModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{projectModalMode === 'create' ? 'Create New Project' : 'Edit Project'}</h2>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors border border-gray-200"><X size={18} /></button>
            </div>
            <form onSubmit={handleProjectFormSubmit} className="p-6 space-y-5">
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Project Name</label><input type="text" name="name" defaultValue={selectedProject?.name || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Assigned Team</label><select name="team" defaultValue={selectedProject?.team || teamsData[0]?.name || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]">{teamsData.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Status</label><select name="status" defaultValue={selectedProject?.status || 'Planning'} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]"><option value="Planning">Planning</option><option value="Active">Active</option><option value="On Hold">On Hold</option><option value="Completed">Completed</option></select></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Progress (0-100)</label><input type="number" name="progress" min="0" max="100" defaultValue={selectedProject?.progress || 0} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38]" required /></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6"><button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#284B38] hover:bg-[#1E3A2B] rounded-lg shadow-sm">{projectModalMode === 'create' ? 'Create Project' : 'Save Changes'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTaskModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-orange-50/50">
              <h2 className="text-xl font-bold text-gray-900">{taskModalMode === 'create' ? 'Create Global Task' : 'Admin Task Override'}</h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors border border-gray-200"><X size={18} /></button>
            </div>
            <form onSubmit={handleTaskFormSubmit} className="p-6 space-y-5">
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Task Title</label><input type="text" name="title" defaultValue={selectedTask?.title || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A43]" required /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Associated Project</label><select name="project" defaultValue={selectedTask?.project || projectsData[0]?.name || ''} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A43]">{projectsData.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}<option value="General System Operations">General System Operations</option></select></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Assignee</label><select name="assignee" defaultValue={selectedTask?.assignee || 'Unassigned'} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A43]">{usersData.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}<option value="Unassigned">Unassigned</option></select></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Status</label><select name="status" defaultValue={selectedTask?.status || 'Backlog'} className="w-full bg-[#F3F4F1] border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A43]"><option value="Backlog">Backlog</option><option value="Planning">Planning</option><option value="In Progress">In Progress</option><option value="Review">Review</option><option value="Done">Done</option></select></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6"><button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm">{taskModalMode === 'create' ? 'Create Task' : 'Confirm Override'}</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}