import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, FolderKanban, CheckSquare, 
  BarChart3, Activity, Settings, Lock, LogOut, Shield, Key 
} from 'lucide-react';
import api from '../../service/api';
import RoleManagement from './RoleManagement';
import ThemeToggle from '../../componets/commen/ThemeToggle';
import Badge from '../../componets/commen/Badge';
import { STATUS_COLORS } from '../../utils/statusColors';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Scrum Master' | 'Developer' | string;
  status: 'Active' | 'Deactivated' | 'Pending' | string;
  is_verified?: boolean;
}

interface Project {
  id: string;
  name: string;
  workspace: string;
  status: 'Active' | 'Archived';
}

interface Team {
  id: string;
  name: string;
  membersCount: number;
  lead: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  assignee: string;
  priority: string;
  dueDate: string;
}

export default function AdminDashboard() {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'users' | 'roles' | 'permissions' | 'projects' | 'tasks' | 'teams' | 'reports' | 'logs' | 'settings'
  >('overview');

  const [users, setUsers] = useState<UserAccount[]>([]);

  const [permissions, setPermissions] = useState([
    { module: 'User Management', admin: true, scrumMaster: false, developer: false },
    { module: 'Role & Permission Assignment', admin: true, scrumMaster: true, developer: false },
    { module: 'Project CRUD & Archiving', admin: true, scrumMaster: true, developer: false },
    { module: 'Company Task Intervention', admin: true, scrumMaster: true, developer: false },
    { module: 'Team Creation & Membership', admin: true, scrumMaster: true, developer: false },
    { module: 'System Security & Logs', admin: true, scrumMaster: false, developer: false },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: 'PRJ-101', name: 'FlowBoard Core Engine', workspace: 'Enterprise Workspace', status: 'Active' },
    { id: 'PRJ-102', name: 'OKLCH Design Token Migration', workspace: 'Design System', status: 'Active' },
  ]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'FB-201', title: 'Refactor authentication state hook', status: 'Backlog', assignee: 'Developer User', priority: 'High', dueDate: '2026-10-15' },
    { id: 'FB-202', title: 'Implement Tailwind v4 layout grid', status: 'To Do', assignee: 'Developer User', priority: 'Critical', dueDate: '2026-10-10' },
    { id: 'FB-203', title: 'Optimize OKLCH design tokens', status: 'Blocked', assignee: 'malefiya', priority: 'Medium', dueDate: '2026-10-12' },
  ]);

  const [teams, setTeams] = useState<Team[]>([
    { id: 'TEAM-01', name: 'Core Engineering', membersCount: 4, lead: 'Scrum Lead' },
    { id: 'TEAM-02', name: 'UI/UX Design Systems', membersCount: 2, lead: 'malefiya' },
  ]);

  const [logs, setLogs] = useState<string[]>([
    'System cluster initialized with full administrative privileges.',
    'Admin delegation matrix updated successfully.',
    'User permission set verified for Scrum Master role.',
  ]);

  const [settings, setSettings] = useState({
    systemName: 'FlowBoard Enterprise',
    maintenanceMode: false,
    strictSecurity: true,
    sessionTimeoutMins: 30,
  });

  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data.map((u: any) => ({
          id: String(u.id),
          name: u.name || 'User',
          email: u.email,
          role: u.role || 'Pending Role Assignment',
          status: u.status === 'ACTIVE' ? 'Active' : (u.status || 'PENDING_APPROVAL'),
          is_verified: u.is_verified,
        })));
      }
    } catch (err) {
      console.error('Error fetching admin users from backend:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Deactivated' : 'Active' } : u));
    setLogs(prev => [`Toggled status for user ID ${id}`, ...prev]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setLogs(prev => [`Deleted user account ID ${id}`, ...prev]);
  };

  const handleRoleChange = async (id: string, newRole: any) => {
    const targetUser = users.find(u => u.id === id);
    setActionStatus(`Assigning ${newRole} to ${targetUser?.email || id}...`);
    try {
      await api.put('/admin/update-role', {
        userId: id,
        email: targetUser?.email,
        role: newRole,
      });

      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole, status: 'Active' } : u));
      setLogs(prev => [`Assigned role ${newRole} to ${targetUser?.email || id} and sent notification email.`, ...prev]);
      setActionStatus(`Role '${newRole}' assigned to ${targetUser?.email} and notification email sent!`);
      setTimeout(() => setActionStatus(null), 5000);
    } catch (err: any) {
      console.error('Role update error:', err);
      setActionStatus(null);
      alert(err.response?.data?.message || 'Failed to update role in database.');
    }
  };

  const handleTogglePermission = (index: number, roleKey: 'admin' | 'scrumMaster' | 'developer') => {
    setPermissions(prev => prev.map((p, i) => i === index ? { ...p, [roleKey]: !p[roleKey as keyof typeof p] } : p));
    setLogs(prev => [`Modified permission matrix for module ${permissions[index].module}`, ...prev]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between shrink-0 font-sans text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-200 shadow-2xs">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg text-white bg-[#0F766E] shadow-2xs">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="font-bold text-xs text-[#1F2937] dark:text-white block font-sans">FlowBoard</span>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 block font-semibold">Admin Console</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-mono">
          <div className="text-[10px] uppercase text-gray-400 dark:text-slate-500 tracking-wider px-3 pb-1">Governance</div>
          
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'roles', label: 'Role Management', icon: Shield },
            { id: 'permissions', label: 'Permission Config', icon: Key },
            { id: 'projects', label: 'Project Workspaces', icon: FolderKanban },
            { id: 'tasks', label: 'Task Intervention', icon: CheckSquare },
            { id: 'teams', label: 'Team Management', icon: Users },
            { id: 'reports', label: 'Company Reports', icon: BarChart3 },
            { id: 'logs', label: 'Activity Logs', icon: Activity },
            { id: 'settings', label: 'System Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveAdminTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeAdminTab === item.id 
                    ? 'bg-[#0F766E] text-white font-bold shadow-2xs' 
                    : 'text-[#1F2937] dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <Icon size={14} /> {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('flowboard_token');
              localStorage.removeItem('flowboard_user');
              localStorage.removeItem('token');
              localStorage.removeItem('fb_user');
              window.location.href = '/admin/login';
            }} 
            className="w-full flex items-center gap-2 p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-mono cursor-pointer transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F8] dark:bg-[#0B0F17] transition-colors duration-200">
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
          <h1 className="text-sm font-mono font-bold tracking-tight text-[#1F2937] dark:text-white uppercase">
            Admin Governance & Capability Matrix — [{activeAdminTab.toUpperCase()}]
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 text-[#0F766E] dark:text-teal-400 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <Lock size={12} /> Secure Cluster Active
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* OVERVIEW */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6 max-w-5xl font-mono text-xs">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Total Users</p>
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">{users.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Total Projects</p>
                  <p className="text-2xl font-bold text-[#0F766E] dark:text-teal-400">{projects.length}</p>
                </div>
                {/* Blocked tasks using #D97706 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Blocked Tasks</p>
                  <p className="text-2xl font-bold" style={{ color: STATUS_COLORS.BLOCKED }}>
                    {tasks.filter(t => t.status === 'Blocked').length}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">0</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
                <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Recent System Activity</h3>
                <div className="space-y-2">
                  {logs.slice(0, 5).map((l, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-800 flex justify-between items-center text-[#1F2937] dark:text-slate-300">
                      <span>{l}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">Live</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {activeAdminTab === 'users' && (
            <div className="space-y-4 max-w-5xl font-mono text-xs">
              {actionStatus && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-mono font-bold">
                  ✉️ {actionStatus}
                </div>
              )}
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">User Accounts & Delegation Management</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const name = prompt('Enter user name:');
                    if(!name) return;
                    setUsers(prev => [...prev, { id: `USR-0${users.length+1}`, name, email: `${name.toLowerCase()}@flowboard.com`, role: 'Developer', status: 'Active' }]);
                    setLogs(prev => [`Created user account for ${name}`, ...prev]);
                  }} 
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                >
                  + Add User Account
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 text-[11px]">
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-[#0F766E] dark:text-teal-400 font-mono">{u.id}</td>
                        <td className="p-3 text-[#1F2937] dark:text-white font-bold">{u.name}</td>
                        <td className="p-3 text-gray-600 dark:text-slate-300">{u.email}</td>
                        <td className="p-3">
                          <select 
                            value={u.role || 'Member'} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-[#0F766E] dark:text-teal-400 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer focus:ring-1 focus:ring-[#0F766E] focus:outline-none"
                          >
                            <option value="Member">Member</option>
                            <option value="Developer">Developer</option>
                            <option value="Scrum Master">Scrum Master</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.status === 'Active' 
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button 
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id)} 
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs cursor-pointer transition-colors border border-gray-200 dark:border-slate-700"
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteUser(u.id)} 
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded text-xs cursor-pointer transition-colors border border-rose-500/20"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROLE MANAGEMENT COMPONENT */}
          {activeAdminTab === 'roles' && (
            <RoleManagement />
          )}

          {/* PERMISSION CONFIGURATION */}
          {activeAdminTab === 'permissions' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Role-Based Permission Configuration</h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 text-[11px]">
                      <th className="p-3">Module / Capability</th>
                      <th className="p-3 text-center">Admin</th>
                      <th className="p-3 text-center">Scrum Master</th>
                      <th className="p-3 text-center">Developer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-[#1F2937] dark:text-white">{p.module}</td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={p.admin} disabled className="accent-[#0F766E] w-4 h-4" />
                        </td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={p.scrumMaster} onChange={() => handleTogglePermission(idx, 'scrumMaster')} className="accent-[#0F766E] w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={p.developer} onChange={() => handleTogglePermission(idx, 'developer')} className="accent-[#0F766E] w-4 h-4 cursor-pointer" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeAdminTab === 'projects' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Company Project Workspaces</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const name = prompt('Enter project name:');
                    if(!name) return;
                    setProjects(prev => [...prev, { id: `PRJ-10${projects.length+1}`, name, workspace: 'Enterprise Workspace', status: 'Active' }]);
                  }} 
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                >
                  + Create Project
                </button>
              </div>

              <div className="space-y-3">
                {projects.map(pr => (
                  <div key={pr.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-xs transition-colors">
                    <div className="space-y-1">
                      <span className="text-[#0F766E] dark:text-teal-400 font-bold">{pr.id}</span>
                      <h4 className="text-[#1F2937] dark:text-white font-bold text-sm">{pr.name}</h4>
                      <p className="text-gray-500 dark:text-slate-400 text-[11px]">{pr.workspace}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setProjects(prev => prev.filter(x => x.id !== pr.id))} 
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-rose-500/20"
                    >
                      Archive / Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS (TASK INTERVENTION) */}
          {activeAdminTab === 'tasks' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Company-Wide Task Intervention & Oversight</h3>
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-xs transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#0F766E] dark:text-teal-400 font-bold">{t.id}</span>
                        {/* Using Badge component with canonical status colors across both modes */}
                        <Badge label={t.status} />
                      </div>
                      <h4 className="text-[#1F2937] dark:text-white font-bold text-xs">{t.title}</h4>
                      <p className="text-gray-500 dark:text-slate-400 text-[11px]">Assignee: {t.assignee} | Priority: {t.priority}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: x.status === 'Blocked' ? 'In Progress' : 'Blocked' } : x));
                      }} 
                      className="px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors border"
                      style={{
                        color: t.status === 'Blocked' ? STATUS_COLORS.IN_PROGRESS : STATUS_COLORS.BLOCKED,
                        borderColor: t.status === 'Blocked' ? `${STATUS_COLORS.IN_PROGRESS}50` : `${STATUS_COLORS.BLOCKED}50`,
                        backgroundColor: t.status === 'Blocked' ? `${STATUS_COLORS.IN_PROGRESS}15` : `${STATUS_COLORS.BLOCKED}15`,
                      }}
                    >
                      {t.status === 'Blocked' ? 'Unblock Task' : 'Force Block'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEAMS */}
          {activeAdminTab === 'teams' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Enterprise Team Management</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const name = prompt('Enter team name:');
                    if(!name) return;
                    setTeams(prev => [...prev, { id: `TEAM-0${teams.length+1}`, name, membersCount: 1, lead: 'System Admin' }]);
                  }} 
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                >
                  + Create Team
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {teams.map(tm => (
                  <div key={tm.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-[#1F2937] dark:text-white text-sm">{tm.name}</span>
                      <span className="text-[#0F766E] dark:text-teal-400 font-bold">{tm.id}</span>
                    </div>
                    <p className="text-gray-500 dark:text-slate-400">Team Lead: <strong className="text-[#1F2937] dark:text-white">{tm.lead}</strong></p>
                    <p className="text-gray-500 dark:text-slate-400">Active Members: <strong className="text-[#1F2937] dark:text-white">{tm.membersCount}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeAdminTab === 'reports' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Company-Wide Task & Project Progress Reports</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Total Active Tasks</p>
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">{tasks.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Blocked Items</p>
                  <p className="text-2xl font-bold" style={{ color: STATUS_COLORS.BLOCKED }}>
                    {tasks.filter(t => t.status === 'Blocked').length}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Active Workspaces</p>
                  <p className="text-2xl font-bold text-[#0F766E] dark:text-teal-400">{projects.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* LOGS */}
          {activeAdminTab === 'logs' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Security & Audit Activity Logs</h3>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
                {logs.map((lg, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-800 flex justify-between items-center text-[#1F2937] dark:text-slate-300">
                    <span>{lg}</span>
                    <span className="text-[10px] text-[#0F766E] dark:text-teal-400 font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">SECURE LOG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-4 max-w-3xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">System Configuration & Security Settings</h3>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                  <span className="text-[#1F2937] dark:text-white font-bold">System Name</span>
                  <input 
                    type="text" 
                    value={settings.systemName} 
                    onChange={e => setSettings({...settings, systemName: e.target.value})} 
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]" 
                  />
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                  <span className="text-[#1F2937] dark:text-white font-bold">Strict Security Mode</span>
                  <input 
                    type="checkbox" 
                    checked={settings.strictSecurity} 
                    onChange={e => setSettings({...settings, strictSecurity: e.target.checked})} 
                    className="w-4 h-4 accent-[#0F766E] cursor-pointer" 
                  />
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[#1F2937] dark:text-white font-bold">Session Timeout (Minutes)</span>
                  <input 
                    type="number" 
                    value={settings.sessionTimeoutMins} 
                    onChange={e => setSettings({...settings, sessionTimeoutMins: Number(e.target.value)})} 
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[#1F2937] dark:text-white w-20 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]" 
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}