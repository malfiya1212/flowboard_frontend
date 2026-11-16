import { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, FolderKanban, CheckSquare,
  BarChart3, Activity, LogOut, Shield, RefreshCw,
  LayoutDashboard, Calendar, X, AlertCircle, Plus, ChevronDown,
  User, Camera, KeyRound
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
  role: 'Admin' | 'Scrum Master' | 'Developer' | 'Tester' | 'Member' | string;
  status: 'Active' | 'Deactivated' | 'Pending' | string;
  is_verified?: boolean;
}

interface Project {
  id: string;
  name: string;
  project_key?: string;
  description?: string;
  project_type?: string;
  start_date?: string;
  target_end_date?: string;
  workspace?: string;
  status: 'Active' | 'Archived' | string;
  created_at?: string;
}

interface Team {
  id: string;
  name: string;
  membersCount: number;
  lead: string;
  leadEmail?: string;
  leadRole?: string;
  projectId?: string;
  projectName?: string;
  projectKey?: string;
  createdAt?: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  assignee: string;
  priority: string;
  dueDate: string;
}

interface AuditLog {
  id: number;
  actor_email: string;
  action: string;
  target_email: string | null;
  detail: string;
  success: boolean;
  created_at: string;
}

const TAB_LABELS: Record<string, string> = {
  overview: 'Dashboard',
  users: 'Users',
  roles: 'Roles & Permissions',
  projects: 'Projects',
  tasks: 'Tasks',
  teams: 'Teams',
  reports: 'Reports',
  logs: 'Activity Logs',
  settings: 'Admin Profile',
};

// Helper to automatically generate standard short Project Key from Project Name
export function generateProjectKey(name: string): string {
  if (!name || !name.trim()) return '';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(w => w.length > 0);

  if (words.length >= 2) {
    // Multi-word acronym: e.g. "FlowBoard Core Web" -> "FCW", "Mobile App" -> "MA"
    const acronym = words.map(w => w.charAt(0).toUpperCase()).join('').slice(0, 5);
    if (acronym.length >= 2) return acronym;
  }

  const firstWord = words[0];
  if (firstWord) {
    // Single word: e.g. "Frontend" -> "FRON", "Backend" -> "BACK"
    const single = firstWord.toUpperCase();
    return single.length > 4 ? single.slice(0, 4) : single;
  }

  return clean.slice(0, 4).toUpperCase() || 'PRJ';
}

export default function AdminDashboard() {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'users' | 'roles' | 'permissions' | 'projects' | 'tasks' | 'teams' | 'reports' | 'logs' | 'settings'
  >('overview');

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Project creation & edit modal state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    project_key: '',
    description: '',
    project_type: 'Software Development',
    start_date: new Date().toISOString().split('T')[0],
    target_end_date: '',
    status: 'Active',
  });
  const [projectFormError, setProjectFormError] = useState<string | null>(null);
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Team creation form state (matches Admin "Create New Team" design)
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    leadId: '',
    projectId: '',
  });
  const [teamFormError, setTeamFormError] = useState<string | null>(null);
  const [teamSuccessMsg, setTeamSuccessMsg] = useState<string | null>(null);
  const [teamSubmitting, setTeamSubmitting] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Admin Profile state (Edit name, Edit email, Change profile picture)
  const [adminProfile, setAdminProfile] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    avatar: null as string | null,
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Admin Password state (Change password)
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

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
          status: u.status === 'ACTIVE' ? 'Active' : u.status === 'DEACTIVATED' ? 'Deactivated' : (u.status || 'Pending'),
          is_verified: u.is_verified,
        })));
      }
    } catch (err) {
      console.error('Error fetching admin users from backend:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await api.get('/admin/projects');
      if (Array.isArray(res.data)) {
        setProjects(res.data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          project_key: p.project_key || `PRJ-${p.id}`,
          description: p.description || '',
          project_type: p.project_type || 'Software Development',
          start_date: p.start_date || '',
          target_end_date: p.target_end_date || '',
          workspace: p.workspace || 'Enterprise Workspace',
          status: p.status || 'Active',
          created_at: p.created_at,
        })));
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const res = await api.get('/admin/teams');
      if (Array.isArray(res.data)) {
        setTeams(res.data.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          membersCount: t.members_count ?? 0,
          lead: t.lead_name || 'Unassigned',
          leadEmail: t.lead_email,
          leadRole: t.lead_role,
          projectId: t.project_id ? String(t.project_id) : undefined,
          projectName: t.project_name,
          projectKey: t.project_key,
          createdAt: t.created_at,
        })));
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (Array.isArray(res.data)) setAuditLogs(res.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAdminProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get('/admin/profile');
      if (res.data) {
        setAdminProfile(res.data);
        setProfileFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          avatar: res.data.avatar || null,
        });
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchTeams();
    fetchAuditLogs();
    fetchAdminProfile();
  }, []);

  // Handle avatar image selection via file reader
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileErrorMsg('Image size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileFormData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Submit profile details (Name, Email, Picture)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (!profileFormData.name.trim()) {
      setProfileErrorMsg('Name cannot be empty.');
      return;
    }
    if (!profileFormData.email.trim()) {
      setProfileErrorMsg('Email cannot be empty.');
      return;
    }

    setProfileSubmitting(true);
    try {
      const res = await api.put('/admin/profile', {
        name: profileFormData.name.trim(),
        email: profileFormData.email.trim(),
        avatar: profileFormData.avatar,
      });

      setAdminProfile(res.data.user);
      setProfileSuccessMsg('Admin profile updated successfully.');
      fetchAuditLogs();
      fetchUsers();
      setTimeout(() => setProfileSuccessMsg(null), 5000);
    } catch (err: any) {
      setProfileErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Submit password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    const { currentPassword, newPassword, confirmPassword } = passwordFormData;

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await api.put('/admin/profile/password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccessMsg('Password changed successfully.');
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      fetchAuditLogs();
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch (err: any) {
      setPasswordErrorMsg(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Toggle user status via backend — only update local state after server confirms
  const handleToggleUserStatus = async (id: string) => {
    try {
      const res = await api.patch(`/admin/users/${id}/status`);
      const updated = res.data.user;
      setUsers(prev => prev.map(u => u.id === id
        ? { ...u, status: updated.status === 'ACTIVE' ? 'Active' : 'Deactivated' }
        : u
      ));
      fetchAuditLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  // Delete user via backend — requires confirmation and won't allow self-deletion
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      fetchAuditLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Role change via backend — inline dropdown in user table
  const handleRoleChange = async (id: string, newRole: any) => {
    const targetUser = users.find(u => u.id === id);
    if (!window.confirm(`Assign role '${newRole}' to ${targetUser?.email || id}? This will be recorded in the audit log.`)) return;
    setActionStatus(`Assigning ${newRole} to ${targetUser?.email || id}…`);
    try {
      const res = await api.post('/admin/assign-role', { userId: id, role: newRole });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole, status: 'Active' } : u));
      const emailNote = res.data.emailSent === false ? ' (email notification could not be delivered)' : ' Notification email sent.';
      setActionStatus(`Role '${newRole}' assigned to ${targetUser?.email}.${emailNote}`);
      fetchAuditLogs();
      setTimeout(() => setActionStatus(null), 6000);
    } catch (err: any) {
      setActionStatus(null);
      alert(err.response?.data?.message || 'Failed to update role in database.');
    }
  };

  // Open project creation modal
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectFormData({
      name: '',
      project_key: '',
      description: '',
      project_type: 'Software Development',
      start_date: new Date().toISOString().split('T')[0],
      target_end_date: '',
      status: 'Active',
    });
    setProjectFormError(null);
    setProjectModalOpen(true);
  };

  // Open project edit modal
  const handleOpenEditProject = (pr: Project) => {
    setEditingProject(pr);
    setProjectFormData({
      name: pr.name || '',
      project_key: pr.project_key || '',
      description: pr.description || '',
      project_type: pr.project_type || 'Software Development',
      start_date: pr.start_date || new Date().toISOString().split('T')[0],
      target_end_date: pr.target_end_date || '',
      status: pr.status || 'Active',
    });
    setProjectFormError(null);
    setProjectModalOpen(true);
  };

  // Submit project creation or update
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectFormError(null);

    const { name, project_key, description, project_type, start_date, target_end_date, status } = projectFormData;

    if (!name.trim()) {
      setProjectFormError('Project Name is required.');
      return;
    }
    const finalKey = (project_key || generateProjectKey(name)).trim().toUpperCase() || 'PRJ';
    if (!description.trim()) {
      setProjectFormError('Description is required.');
      return;
    }
    if (!project_type.trim()) {
      setProjectFormError('Project Type is required.');
      return;
    }
    if (!start_date.trim()) {
      setProjectFormError('Start Date is required.');
      return;
    }

    setProjectSubmitting(true);
    try {
      if (editingProject) {
        await api.put(`/admin/projects/${editingProject.id}`, {
          name: name.trim(),
          project_key: finalKey,
          description: description.trim(),
          project_type: project_type.trim(),
          start_date: start_date.trim(),
          target_end_date: target_end_date ? target_end_date.trim() : null,
          status: status || 'Active',
        });
      } else {
        await api.post('/admin/projects', {
          name: name.trim(),
          project_key: finalKey,
          description: description.trim(),
          project_type: project_type.trim(),
          start_date: start_date.trim(),
          target_end_date: target_end_date ? target_end_date.trim() : null,
        });
      }

      setProjectModalOpen(false);
      setEditingProject(null);
      fetchProjects();
      fetchAuditLogs();
    } catch (err: any) {
      setProjectFormError(err.response?.data?.message || (editingProject ? 'Failed to update project.' : 'Failed to create project.'));
    } finally {
      setProjectSubmitting(false);
    }
  };

  // Delete project via real API
  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      fetchAuditLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  // Create team via real API (3 required fields: Team Name, Team Lead [Scrum Master], Project)
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamFormError(null);
    setTeamSuccessMsg(null);

    const { name, leadId, projectId } = teamFormData;

    if (!name.trim()) {
      setTeamFormError('Team Name is required.');
      return;
    }
    if (!leadId) {
      setTeamFormError('Team Lead (Scrum Master) is required.');
      return;
    }
    if (!projectId) {
      setTeamFormError('Project is required.');
      return;
    }

    setTeamSubmitting(true);
    try {
      await api.post('/admin/teams', {
        name: name.trim(),
        leadId: Number(leadId),
        projectId: Number(projectId),
      });

      setTeamSuccessMsg(`Team "${name.trim()}" created successfully!`);
      setTeamFormData({ name: '', leadId: '', projectId: '' });
      fetchTeams();
      fetchProjects();
      fetchAuditLogs();
      setTimeout(() => setTeamSuccessMsg(null), 5000);
    } catch (err: any) {
      setTeamFormError(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setTeamSubmitting(false);
    }
  };

  // Delete team via real API
  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Delete this team?')) return;
    try {
      await api.delete(`/admin/teams/${id}`);
      setTeams(prev => prev.filter(t => t.id !== id));
      fetchAuditLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete team.');
    }
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
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'roles', label: 'Roles & Permissions', icon: Shield },
            { id: 'projects', label: 'Projects', icon: FolderKanban },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'logs', label: 'Activity Logs', icon: Activity },
            { id: 'settings', label: 'Admin Profile', icon: User },
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

        <div className="p-3 border-t border-gray-200 dark:border-slate-800 space-y-1">
          <button
            type="button"
            onClick={() => setActiveAdminTab('settings')}
            className={`w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer ${
              activeAdminTab === 'settings' ? 'bg-gray-100 dark:bg-slate-800' : ''
            }`}
            title="Open Admin Profile"
          >
            {adminProfile?.avatar ? (
              <img
                src={adminProfile.avatar}
                alt={adminProfile.name}
                className="w-8 h-8 rounded-full object-cover border border-[#0F766E] shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 font-bold flex items-center justify-center text-xs border border-teal-300 dark:border-teal-800 shrink-0">
                {adminProfile?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1F2937] dark:text-white truncate">
                {adminProfile?.name || 'System Admin'}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-400 truncate">
                {adminProfile?.email || 'Admin'}
              </p>
            </div>
          </button>

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
            Admin Governance & Capability Matrix — [{(TAB_LABELS[activeAdminTab] || activeAdminTab).toUpperCase()}]
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />
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
                <div className="flex justify-between items-center">
                  <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Recent System Activity</h3>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">From persisted audit log</span>
                </div>
                <div className="space-y-2">
                  {logsLoading ? (
                    <div className="text-gray-400 text-xs animate-pulse py-2">Loading audit logs…</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-gray-400 text-xs py-2">No audit log entries yet.</div>
                  ) : (
                    auditLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-800 flex justify-between items-center text-[#1F2937] dark:text-slate-300">
                        <div className="space-y-0.5 min-w-0">
                          <span className="block text-xs">{log.detail}</span>
                          <span className="block text-[10px] text-gray-400 dark:text-slate-500">{log.actor_email} · {new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`shrink-0 ml-3 text-[10px] font-bold px-2 py-0.5 rounded border ${log.success ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' : 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'}`}>
                          {log.success ? 'OK' : 'FAILED'}
                        </span>
                      </div>
                    ))
                  )}
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
                  onClick={() => { fetchUsers(); fetchAuditLogs(); }}
                  disabled={usersLoading}
                  title="Refresh"
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-200 font-bold rounded-lg cursor-pointer transition-colors shadow-2xs border border-gray-200 dark:border-slate-700 text-xs flex items-center justify-center"
                >
                  <RefreshCw size={13} className={usersLoading ? 'animate-spin' : ''} />
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
                            disabled={u.role === 'Admin'}
                            title={u.role === 'Admin' ? 'Admin role is permanent and cannot be reassigned here' : 'Assign role to user'}
                            className={`bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-[#0F766E] dark:text-teal-400 rounded-lg px-2.5 py-1 text-xs font-bold focus:ring-1 focus:ring-[#0F766E] focus:outline-none ${u.role === 'Admin' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {u.role === 'Admin' && <option value="Admin">Admin</option>}
                            <option value="Member">Member</option>
                            <option value="Developer">Developer</option>
                            <option value="Tester">Tester</option>
                            <option value="Scrum Master">Scrum Master</option>
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

          {/* PROJECTS */}
          {activeAdminTab === 'projects' && (
            <div className="space-y-4 max-w-5xl font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold uppercase text-[#1F2937] dark:text-white text-sm">Software Project Workspaces</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateProject}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={14} /> Create Project
                </button>
              </div>

              {projectsLoading ? (
                <div className="text-gray-400 animate-pulse text-xs py-4">Loading projects…</div>
              ) : projects.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                  No projects configured yet. Click "+ Create Project" above to create your first project.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(pr => (
                    <div 
                      key={pr.id} 
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors space-y-4"
                    >
                      <div className="space-y-2.5">
                        {/* Header: Project ID, Key, Type, Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/60 font-mono">
                              {pr.project_key || `PRJ-${pr.id}`}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                              ID: #{pr.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {pr.project_type && (
                              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 rounded text-[10px] font-bold">
                                {pr.project_type}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              pr.status === 'Active' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                            }`}>
                              {pr.status || 'Active'}
                            </span>
                          </div>
                        </div>

                        {/* Project Name */}
                        <h4 className="text-[#1F2937] dark:text-white font-bold text-base leading-snug">
                          {pr.name}
                        </h4>

                        {/* Description */}
                        {pr.description && (
                          <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-3">
                            {pr.description}
                          </p>
                        )}
                      </div>

                      {/* Footer: Dates & Actions */}
                      <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-slate-400">
                        <div className="flex items-center gap-4 flex-wrap">
                          {pr.start_date && (
                            <div className="flex items-center gap-1.5" title="Project Start Date">
                              <Calendar size={13} className="text-[#0F766E] dark:text-teal-400 shrink-0" />
                              <span>Start: <strong>{pr.start_date}</strong></span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5" title="Target End Date">
                            <Calendar size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
                            <span>Target: <strong>{pr.target_end_date || 'Flexible'}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(pr)}
                            className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/30 hover:bg-[#0F766E] text-[#0F766E] dark:text-teal-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-teal-200 dark:border-teal-900/60 text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(pr.id)}
                            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-rose-200 dark:border-rose-900/60 text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE PROJECT MODAL ─────────────────────────────────────── */}
          {projectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 my-8 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 rounded-lg">
                      <FolderKanban size={18} />
                    </div>
                    <h3 className="font-bold text-sm text-[#1F2937] dark:text-white">
                      {editingProject ? 'Edit Project' : 'Create New Project'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProjectModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {projectFormError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2 text-xs">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{projectFormError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProject} className="space-y-3.5">
                  {/* Project Name (Required) */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={projectFormData.name}
                      onChange={e => {
                        const newName = e.target.value;
                        setProjectFormData(prev => ({
                          ...prev,
                          name: newName,
                          project_key: generateProjectKey(newName)
                        }));
                      }}
                      placeholder="e.g. FlowBoard Core Web"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                    />
                  </div>

                  {/* Project Key & Project Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Project Key
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={projectFormData.project_key || ''}
                        placeholder="Project Key"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg text-[#0F766E] dark:text-teal-400 font-bold font-mono uppercase text-xs focus:outline-none cursor-default select-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Project Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={projectFormData.project_type}
                        onChange={e => setProjectFormData(prev => ({ ...prev, project_type: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] cursor-pointer"
                      >
                        <option value="Software Development">Software Development</option>
                        <option value="Scrum Project">Scrum Project</option>
                        <option value="Kanban Project">Kanban Project</option>
                        <option value="Web Application">Web Application</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="DevOps / Infrastructure">DevOps / Infrastructure</option>
                        <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description (Required) */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={projectFormData.description}
                      onChange={e => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Project description..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                    />
                  </div>

                  {/* Dates Grid: Start Date & Target End Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={projectFormData.start_date}
                        onChange={e => setProjectFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Target End Date
                      </label>
                      <input
                        type="date"
                        value={projectFormData.target_end_date}
                        onChange={e => setProjectFormData(prev => ({ ...prev, target_end_date: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  {/* Status (Only in Edit mode) */}
                  {editingProject && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={projectFormData.status}
                        onChange={e => setProjectFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  )}

                  {/* Modal Buttons */}
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setProjectModalOpen(false)}
                      disabled={projectSubmitting}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={projectSubmitting}
                      className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      {editingProject
                        ? (projectSubmitting ? 'Saving Changes…' : 'Save Changes')
                        : (projectSubmitting ? 'Creating Project…' : 'Create Project')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TASKS (TASK INTERVENTION) */}
          {activeAdminTab === 'tasks' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Company-Wide Task Intervention & Oversight</h3>
              {tasks.length === 0 ? (
                <div className="text-gray-400 text-xs py-4">No tasks available for intervention.</div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(t => (
                    <div key={t.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-xs transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[#0F766E] dark:text-teal-400 font-bold">{t.id}</span>
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
              )}
            </div>
          )}

          {/* TEAMS */}
          {activeAdminTab === 'teams' && (
            <div className="space-y-6 max-w-4xl font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold uppercase text-[#1F2937] dark:text-white text-sm">Enterprise Team Management</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(prev => !prev)}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={14} /> {showCreateTeam ? 'Hide Form' : 'Create Team'}
                </button>
              </div>

              {/* CREATE TEAM CARD (Matches FlowBoard theme and color scheme) */}
              {showCreateTeam && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs max-w-xl transition-colors">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-slate-800">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 rounded-lg">
                      <Users size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-[#1F2937] dark:text-white">
                      Create New Team
                    </h4>
                  </div>

                  {teamFormError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2 text-xs">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{teamFormError}</span>
                    </div>
                  )}

                  {teamSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-xs">
                      <CheckSquare size={14} className="shrink-0" />
                      <span>{teamSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveTeam} className="space-y-3.5">
                    {/* 1. Team Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        required
                        value={teamFormData.name}
                        onChange={e => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Mobile Development Team"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      />
                    </div>

                    {/* 2. Team Lead (Scrum Master) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Team Lead (Scrum Master)
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={teamFormData.leadId}
                          onChange={e => setTeamFormData(prev => ({ ...prev, leadId: e.target.value }))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] appearance-none pr-9 cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-400 bg-white dark:bg-slate-800">
                            Select Scrum Master
                          </option>
                          {users
                            .filter(u => (u.role || '').toLowerCase().includes('scrum'))
                            .map(sm => (
                              <option key={sm.id} value={sm.id} className="bg-white dark:bg-slate-800 text-[#1F2937] dark:text-white">
                                {sm.name || sm.email} ({sm.email})
                              </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* 3. Project */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                        Project
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={teamFormData.projectId}
                          onChange={e => setTeamFormData(prev => ({ ...prev, projectId: e.target.value }))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] appearance-none pr-9 cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-400 bg-white dark:bg-slate-800">
                            Select project
                          </option>
                          {projects.map(pr => (
                            <option key={pr.id} value={pr.id} className="bg-white dark:bg-slate-800 text-[#1F2937] dark:text-white">
                              {pr.name} {pr.project_key ? `(${pr.project_key})` : ''}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={teamSubmitting}
                        className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
                      >
                        {teamSubmitting ? 'Creating Team…' : 'Create Team'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* CONFIGURED TEAMS LIST */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-700 dark:text-slate-300 uppercase text-xs">
                  Configured Enterprise Teams ({teams.length})
                </h4>

                {teamsLoading ? (
                  <div className="text-gray-400 animate-pulse text-xs py-4">Loading teams…</div>
                ) : teams.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                    No teams yet. Fill in the form above to create your first team.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map(tm => (
                      <div key={tm.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F2937] dark:text-white text-sm">{tm.name}</span>
                            {tm.projectKey && (
                              <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-md text-[10px] font-bold">
                                {tm.projectKey}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#0F766E] dark:text-teal-400 font-bold text-[10px]">#{tm.id}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(tm.id)}
                              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 text-[10px] font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-gray-500 dark:text-slate-400 text-xs">
                          <p>
                            Team Lead (Scrum Master): <strong className="text-[#1F2937] dark:text-white">{tm.lead}</strong>
                            {tm.leadEmail ? ` (${tm.leadEmail})` : ''}
                          </p>
                          <p>
                            Assigned Project: <strong className="text-[#1F2937] dark:text-white">{tm.projectName || 'Unassigned'}</strong>
                          </p>
                          <p>
                            Active Members: <strong className="text-[#1F2937] dark:text-white">{tm.membersCount}</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeAdminTab === 'reports' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Company-Wide Task & Project Progress Reports</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Total Users</p>
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">{users.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Active Workspaces</p>
                  <p className="text-2xl font-bold text-[#0F766E] dark:text-teal-400">{projects.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <p className="text-gray-500 dark:text-slate-400 uppercase text-[11px]">Active Teams</p>
                  <p className="text-2xl font-bold text-[#0F766E] dark:text-teal-400">{teams.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS (server-persisted) */}
          {activeAdminTab === 'logs' && (
            <div className="space-y-4 max-w-4xl font-mono text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold uppercase text-[#1F2937] dark:text-white">Security & Audit Activity Logs</h3>
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  disabled={logsLoading}
                  title="Refresh"
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-200 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer text-xs shadow-2xs transition-colors flex items-center justify-center"
                >
                  <RefreshCw size={13} className={logsLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
                {logsLoading ? (
                  <div className="text-gray-400 animate-pulse text-xs py-2">Loading audit logs…</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-gray-400 text-xs py-2">No audit entries recorded yet. Entries are created automatically when admin actions are performed.</div>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-800 flex justify-between items-start text-[#1F2937] dark:text-slate-300">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="block font-bold text-xs">{log.action}</span>
                        <span className="block text-[11px] text-gray-600 dark:text-slate-300">{log.detail}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500">
                          By: {log.actor_email}
                          {log.target_email && ` → ${log.target_email}`}
                          {' · '}{new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span className={`shrink-0 ml-3 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        log.success
                          ? 'text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60'
                          : 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'
                      }`}>
                        {log.success ? 'OK' : 'FAILED'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}


          {/* ADMIN PROFILE */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-6 max-w-3xl font-mono text-xs">
              <div>
                <h3 className="font-bold uppercase text-[#1F2937] dark:text-white text-sm">Admin Profile</h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">Manage your personal credentials, email, and profile avatar.</p>
              </div>

              {profileLoading ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 text-center text-gray-400">
                  Loading admin profile…
                </div>
              ) : (
                <div className="space-y-6">
                  {/* PROFILE DETAILS CARD */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                      <User size={16} className="text-[#0F766E] dark:text-teal-400" />
                      <h4 className="font-bold text-[#1F2937] dark:text-white uppercase text-xs">Personal Information</h4>
                    </div>

                    {profileSuccessMsg && (
                      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-300 rounded-lg text-xs font-bold">
                        ✓ {profileSuccessMsg}
                      </div>
                    )}

                    {profileErrorMsg && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={14} /> {profileErrorMsg}
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      {/* Avatar Picker */}
                      <div className="flex items-center gap-5">
                        <div className="relative group shrink-0">
                          {profileFormData.avatar ? (
                            <img
                              src={profileFormData.avatar}
                              alt="Admin Avatar"
                              className="w-20 h-20 rounded-full object-cover border-2 border-[#0F766E] shadow-sm"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 flex items-center justify-center font-bold text-2xl border-2 border-teal-300 dark:border-teal-800 shadow-sm">
                              {profileFormData.name ? profileFormData.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                          )}

                          <label
                            htmlFor="admin-avatar-upload"
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                            title="Change photo"
                          >
                            <Camera size={20} />
                          </label>
                          <input
                            id="admin-avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            className="hidden"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="admin-avatar-upload"
                              className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Camera size={13} /> Change Picture
                            </label>
                            {profileFormData.avatar && (
                              <button
                                type="button"
                                onClick={() => setProfileFormData(prev => ({ ...prev, avatar: null }))}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="block text-[#1F2937] dark:text-white font-bold">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileFormData.name}
                          onChange={e => setProfileFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="e.g. System Administrator"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3.5 py-2 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="block text-[#1F2937] dark:text-white font-bold">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileFormData.email}
                          onChange={e => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="admin@example.com"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3.5 py-2 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={profileSubmitting}
                          className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
                        >
                          {profileSubmitting ? 'Saving Profile…' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* CHANGE PASSWORD CARD */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                      <KeyRound size={16} className="text-[#0F766E] dark:text-teal-400" />
                      <h4 className="font-bold text-[#1F2937] dark:text-white uppercase text-xs">Change Password</h4>
                    </div>

                    {passwordSuccessMsg && (
                      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-300 rounded-lg text-xs font-bold">
                        ✓ {passwordSuccessMsg}
                      </div>
                    )}

                    {passwordErrorMsg && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={14} /> {passwordErrorMsg}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[#1F2937] dark:text-white font-bold">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordFormData.currentPassword}
                          onChange={e => setPasswordFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                          placeholder="••••••••"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3.5 py-2 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[#1F2937] dark:text-white font-bold">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordFormData.newPassword}
                          onChange={e => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3.5 py-2 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[#1F2937] dark:text-white font-bold">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordFormData.confirmPassword}
                          onChange={e => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3.5 py-2 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={passwordSubmitting}
                          className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
                        >
                          {passwordSubmitting ? 'Updating Password…' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}