import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, FolderKanban, CheckSquare, 
  BarChart3, Activity, Settings, Lock, Plus, Trash2, Edit3, CheckCircle2, LogOut, Shield, Key 
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Scrum Master' | 'Developer';
  status: 'Active' | 'Deactivated';
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

  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'USR-01', name: 'System Admin', email: 'admin@flowboard.com', role: 'Admin', status: 'Active' },
    { id: 'USR-02', name: 'Scrum Lead', email: 'scrum@flowboard.com', role: 'Scrum Master', status: 'Active' },
    { id: 'USR-03', name: 'Developer User', email: 'dev@flowboard.com', role: 'Developer', status: 'Active' },
  ]);

  const [roles, setRoles] = useState([
    { role: 'Admin', description: 'Full system access and delegation capability' },
    { role: 'Scrum Master', description: 'Manage sprints, review queues, and team workflows' },
    { role: 'Developer', description: 'Execute assigned tasks and update task progress' },
  ]);

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

  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Deactivated' : 'Active' } : u));
    setLogs(prev => [`Toggled status for user ID ${id}`, ...prev]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setLogs(prev => [`Deleted user account ID ${id}`, ...prev]);
  };

  const handleRoleChange = (id: string, newRole: any) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    setLogs(prev => [`Updated role for user ID ${id} to ${newRole}`, ...prev]);
  };

  const handleTogglePermission = (index: number, roleKey: 'admin' | 'scrumMaster' | 'developer') => {
    setPermissions(prev => prev.map((p, i) => i === index ? { ...p, [roleKey]: !p[roleKey as keyof typeof p] } : p));
    setLogs(prev => [`Modified permission matrix for module ${permissions[index].module}`, ...prev]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#0F172A] text-gray-100">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-[#090D16] border-r border-gray-800 flex flex-col justify-between shrink-0 font-sans text-gray-100">
        <div className="p-4 border-b border-gray-800 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <ShieldAlert size={16} />
            </div>
            <span className="font-bold text-xs uppercase font-mono tracking-wider text-white">Admin Control Center</span>
          </div>
          <p className="text-[10px] font-mono text-red-400 pl-9 font-semibold">FULL ACCESS & DELEGATION</p>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-mono">
          <div className="text-[10px] uppercase text-gray-500 tracking-wider px-3 pb-1">Governance</div>
          
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
                onClick={() => setActiveAdminTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeAdminTab === item.id ? 'bg-red-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800/60'
                }`}
              >
                <Icon size={14} /> {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => window.location.href = '/login'} 
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-mono cursor-pointer transition-colors px-2 py-1"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0F172A]">
        <header className="h-14 bg-[#0F172A] border-b border-gray-800 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-sm font-semibold tracking-wide text-gray-100 uppercase font-mono">
            Admin Governance & Capability Matrix — [{activeAdminTab.toUpperCase()}]
          </h1>
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <Lock size={12} /> Secure Cluster Active
          </span>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* OVERVIEW */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6 max-w-5xl font-mono text-xs">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Total Projects</p>
                  <p className="text-2xl font-bold text-blue-400">{projects.length}</p>
                </div>
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Blocked Tasks</p>
                  <p className="text-2xl font-bold text-red-400">{tasks.filter(t => t.status === 'Blocked').length}</p>
                </div>
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-amber-400">0</p>
                </div>
              </div>

              <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800 space-y-3">
                <h3 className="font-bold uppercase text-white">Recent System Activity</h3>
                <div className="space-y-2">
                  {logs.slice(0, 5).map((l, i) => (
                    <div key={i} className="p-3 bg-[#0F172A] rounded-lg border border-gray-800 flex justify-between items-center text-gray-300">
                      <span>{l}</span>
                      <span className="text-[10px] text-green-400">Live</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {activeAdminTab === 'users' && (
            <div className="space-y-4 max-w-5xl font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase text-white">User Accounts & Delegation Management</h3>
                <button onClick={() => {
                  const name = prompt('Enter user name:');
                  if(!name) return;
                  setUsers(prev => [...prev, { id: `USR-0${users.length+1}`, name, email: `${name.toLowerCase()}@flowboard.com`, role: 'Developer', status: 'Active' }]);
                  setLogs(prev => [`Created user account for ${name}`, ...prev]);
                }} className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer">
                  + Add User Account
                </button>
              </div>

              <div className="bg-[#1E293B] rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-800 text-gray-400">
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
                      <tr key={u.id} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                        <td className="p-3 font-bold text-red-400">{u.id}</td>
                        <td className="p-3 text-white font-bold">{u.name}</td>
                        <td className="p-3 text-gray-300">{u.email}</td>
                        <td className="p-3">
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-[#0F172A] border border-gray-700 rounded px-2 py-1 text-xs text-blue-400 font-bold"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Scrum Master">Scrum Master</option>
                            <option value="Developer">Developer</option>
                          </select>
                        </td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded ${u.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.status}</span></td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => handleToggleUserStatus(u.id)} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded cursor-pointer">
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded cursor-pointer">
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

          {/* ROLE MANAGEMENT WITH ASSIGN BUTTON */}
          {activeAdminTab === 'roles' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase text-white">System Roles & Delegation Matrix</h3>
                <button onClick={() => {
                  const targetUser = prompt('Enter user email to assign role:');
                  const targetRole = prompt('Enter Role (Admin, Scrum Master, Developer):');
                  if (!targetUser || !targetRole) return;
                  setUsers(prev => prev.map(u => u.email === targetUser ? { ...u, role: targetRole as any } : u));
                  setLogs(prev => [`Assigned role ${targetRole} to ${targetUser}`, ...prev]);
                }} className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer shadow-sm">
                  + Assign Role to User
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {roles.map((r, i) => (
                  <div key={i} className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-3 shadow-lg flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 rounded font-bold uppercase text-[10px]">{r.role}</span>
                      <p className="text-gray-300 pt-2">{r.description}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                      <span className="text-[10px] text-green-400">Assigned Users: {users.filter(u => u.role === r.role).length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PERMISSION CONFIGURATION */}
          {activeAdminTab === 'permissions' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-white">Role-Based Permission Configuration</h3>
              <div className="bg-[#1E293B] rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-800 text-gray-400">
                      <th className="p-3">Module / Capability</th>
                      <th className="p-3 text-center">Admin</th>
                      <th className="p-3 text-center">Scrum Master</th>
                      <th className="p-3 text-center">Developer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                        <td className="p-3 font-bold text-white">{p.module}</td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={p.admin} disabled className="accent-red-600 w-4 h-4" />
                        </td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={p.scrumMaster} onChange={() => handleTogglePermission(idx, 'scrumMaster')} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={p.developer} onChange={() => handleTogglePermission(idx, 'developer')} className="accent-blue-600 w-4 h-4 cursor-pointer" />
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
                <h3 className="font-bold uppercase text-white">Company Project Workspaces</h3>
                <button onClick={() => {
                  const name = prompt('Enter project name:');
                  if(!name) return;
                  setProjects(prev => [...prev, { id: `PRJ-10${projects.length+1}`, name, workspace: 'Enterprise Workspace', status: 'Active' }]);
                }} className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer">
                  + Create Project
                </button>
              </div>

              <div className="space-y-3">
                {projects.map(pr => (
                  <div key={pr.id} className="bg-[#1E293B] border border-gray-800 rounded-xl p-4 flex justify-between items-center shadow-lg">
                    <div className="space-y-1">
                      <span className="text-blue-400 font-bold">{pr.id}</span>
                      <h4 className="text-white font-bold text-sm">{pr.name}</h4>
                      <p className="text-gray-400 text-[11px]">{pr.workspace}</p>
                    </div>
                    <button onClick={() => setProjects(prev => prev.filter(x => x.id !== pr.id))} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg cursor-pointer">
                      Archive / Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          {activeAdminTab === 'tasks' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-white">Company-Wide Task Intervention & Oversight</h3>
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="bg-[#1E293B] border border-gray-800 rounded-xl p-4 flex justify-between items-center shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold">{t.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${t.status === 'Blocked' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{t.status}</span>
                      </div>
                      <h4 className="text-white font-bold text-xs">{t.title}</h4>
                      <p className="text-gray-400 text-[11px]">Assignee: {t.assignee} | Priority: {t.priority}</p>
                    </div>
                    <button onClick={() => {
                      setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: x.status === 'Blocked' ? 'In Progress' : 'Blocked' } : x));
                    }} className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg cursor-pointer">
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
                <h3 className="font-bold uppercase text-white">Enterprise Team Management</h3>
                <button onClick={() => {
                  const name = prompt('Enter team name:');
                  if(!name) return;
                  setTeams(prev => [...prev, { id: `TEAM-0${teams.length+1}`, name, membersCount: 1, lead: 'System Admin' }]);
                }} className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer">
                  + Create Team
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {teams.map(tm => (
                  <div key={tm.id} className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-3 shadow-lg">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="font-bold text-white text-sm">{tm.name}</span>
                      <span className="text-red-400 font-bold">{tm.id}</span>
                    </div>
                    <p className="text-gray-400">Team Lead: <strong className="text-white">{tm.lead}</strong></p>
                    <p className="text-gray-400">Active Members: <strong className="text-white">{tm.membersCount}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeAdminTab === 'reports' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-white">Company-Wide Task & Project Progress Reports</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Total Active Tasks</p>
                  <p className="text-2xl font-bold text-white">{tasks.length}</p>
                </div>
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Blocked Items</p>
                  <p className="text-2xl font-bold text-red-400">{tasks.filter(t => t.status === 'Blocked').length}</p>
                </div>
                <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <p className="text-gray-400 uppercase">Active Workspaces</p>
                  <p className="text-2xl font-bold text-blue-400">{projects.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* LOGS */}
          {activeAdminTab === 'logs' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-white">Security & Audit Activity Logs</h3>
              <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800 space-y-3 shadow-lg">
                {logs.map((lg, i) => (
                  <div key={i} className="p-3 bg-[#0F172A] rounded-lg border border-gray-800 flex justify-between items-center text-gray-300">
                    <span>{lg}</span>
                    <span className="text-[10px] text-red-400 font-bold">SECURE LOG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-4 max-w-3xl font-mono text-xs">
              <h3 className="font-bold uppercase text-white">System Configuration & Security Settings</h3>
              <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800 space-y-4 shadow-lg">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-white font-bold">System Name</span>
                  <input type="text" value={settings.systemName} onChange={e => setSettings({...settings, systemName: e.target.value})} className="bg-[#0F172A] border border-gray-700 px-3 py-1 rounded text-white" />
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-white font-bold">Strict Security Mode</span>
                  <input type="checkbox" checked={settings.strictSecurity} onChange={e => setSettings({...settings, strictSecurity: e.target.checked})} className="w-4 h-4 accent-red-600 cursor-pointer" />
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-white font-bold">Session Timeout (Minutes)</span>
                  <input type="number" value={settings.sessionTimeoutMins} onChange={e => setSettings({...settings, sessionTimeoutMins: Number(e.target.value)})} className="bg-[#0F172A] border border-gray-700 px-3 py-1 rounded text-white w-20" />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}