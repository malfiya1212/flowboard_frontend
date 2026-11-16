import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Key, AlertCircle, CheckCircle2, RefreshCw, Search, UserCheck, X
} from 'lucide-react';
import api from '../../service/api';

interface RoleStat {
  role: string;
  count: number;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface PermissionRow {
  module: string;
  admin_access: boolean;
  scrum_master_access: boolean;
  developer_access: boolean;
}

export type KnownRole = 'Member' | 'Developer' | 'Tester' | 'Scrum Master' | 'Admin';

export const VALID_ROLES: KnownRole[] = ['Member', 'Developer', 'Tester', 'Scrum Master', 'Admin'];
export const ASSIGNABLE_ROLES: KnownRole[] = ['Member', 'Developer', 'Tester', 'Scrum Master'];

export default function RoleManagement() {
  // ── Role stats (from DB) ────────────────────────────────────────────────────
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // ── User search ─────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [targetRole, setTargetRole] = useState<KnownRole>('Member');

  // ── Confirmation dialog ─────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Submit state ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    emailSent?: boolean;
  } | null>(null);

  // ── Permissions (from DB) ───────────────────────────────────────────────────
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsSaving, setPermsSaving] = useState(false);
  const [permsStatus, setPermsStatus] = useState<string | null>(null);

  // ── Fetch role stats ────────────────────────────────────────────────────────
  const fetchRoleStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.get('/admin/role-stats');
      if (Array.isArray(res.data)) {
        const map: Record<string, number> = {};
        res.data.forEach((item: RoleStat) => {
          if (item.role) map[item.role] = Number(item.count) || 0;
        });
        setRoleStats(map);
      }
    } catch (err: any) {
      setStatsError(err.response?.data?.message || 'Failed to load role statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch users for search ──────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      if (Array.isArray(res.data)) {
        setAllUsers(
          res.data.map((u: any) => ({
            id: u.id,
            name: u.name || 'User',
            email: u.email,
            role: u.role || 'Member',
          }))
        );
      }
    } catch {
      // non-fatal: search will just show empty
    }
  }, []);

  // ── Fetch permissions matrix from DB ────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    setPermsLoading(true);
    try {
      const res = await api.get('/admin/permissions');
      if (Array.isArray(res.data)) setPermissions(res.data);
    } catch {
      // fallback: leave empty so user sees no fabricated data
    } finally {
      setPermsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoleStats();
    fetchUsers();
    fetchPermissions();
  }, [fetchRoleStats, fetchUsers, fetchPermissions]);

  // ── Filtered user list from search ─────────────────────────────────────────
  const filteredUsers = searchQuery.trim().length > 1
    ? allUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // ── Initiate role assignment (open confirmation dialog) ─────────────────────
  const handleInitiateAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setActionStatus({ type: 'error', message: 'Please search and select a user first.' });
      return;
    }
    if (selectedUser.role === targetRole) {
      setActionStatus({ type: 'error', message: `${selectedUser.name} already has the '${targetRole}' role.` });
      return;
    }
    setConfirmOpen(true);
  };

  // ── Confirmed: call backend, only show success after DB commit ───────────────
  const handleConfirmAssign = async () => {
    if (!selectedUser) return;
    setConfirmOpen(false);
    setIsSubmitting(true);
    setActionStatus(null);

    try {
      const res = await api.post('/admin/assign-role', {
        userId: selectedUser.id,
        role: targetRole,
      });

      // Refresh data from server after commit
      await Promise.all([fetchRoleStats(), fetchUsers()]);

      setActionStatus({
        type: 'success',
        message: res.data.message,
        emailSent: res.data.emailSent,
      });
      setSelectedUser(null);
      setSearchQuery('');
      setTimeout(() => setActionStatus(null), 8000);
    } catch (err: any) {
      setActionStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to assign role. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Save permissions matrix to DB ───────────────────────────────────────────
  const handleSavePermissions = async () => {
    setPermsSaving(true);
    setPermsStatus(null);
    try {
      await api.put('/admin/permissions', { permissions });
      setPermsStatus('Permission matrix saved successfully.');
      setTimeout(() => setPermsStatus(null), 5000);
    } catch (err: any) {
      setPermsStatus(err.response?.data?.message || 'Failed to save permissions.');
    } finally {
      setPermsSaving(false);
    }
  };

  // ── Toggle a non-admin permission locally (saved explicitly) ─────────────────
  const handleTogglePermission = (index: number, field: 'scrum_master_access' | 'developer_access') => {
    setPermissions(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: !p[field] } : p))
    );
  };

  // ── Role card config ────────────────────────────────────────────────────────
  const roleCards = [
    { role: 'Member',       badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', desc: 'Standard team member with view and collaboration access' },
    { role: 'Developer',    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', desc: 'Execute assigned tasks and update task progress' },
    { role: 'Tester',       badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', desc: 'Review Queue verification, pass tasks or report defect blockers' },
    { role: 'Scrum Master', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', desc: 'Manage sprints, review queues, and team workflows' },
    { role: 'Admin',        badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20', desc: 'Full system access and delegation capability' },
  ];

  return (
    <div className="space-y-6 max-w-5xl font-mono text-xs text-[#1F2937] dark:text-[#F8FAFC] transition-colors">

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#1F2937] dark:text-white flex items-center gap-2">
            <Shield className="text-[#0F766E] dark:text-teal-400" size={18} />
            Roles & Permissions
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { fetchRoleStats(); fetchUsers(); fetchPermissions(); }}
            disabled={statsLoading}
            title="Refresh"
            className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-200 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer text-xs shadow-2xs transition-colors flex items-center justify-center"
          >
            <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── STATUS BANNERS ────────────────────────────────────────────────────── */}
      {actionStatus && (
        <div className={`p-3 rounded-lg flex items-start gap-2 text-xs font-bold ${
          actionStatus.type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300'
        }`}>
          {actionStatus.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span>
            {actionStatus.message}
            {actionStatus.type === 'success' && actionStatus.emailSent === false && (
              <span className="block font-normal text-amber-600 dark:text-amber-400 mt-0.5">
                ⚠ Email notification could not be delivered — check SMTP configuration.
              </span>
            )}
          </span>
        </div>
      )}

      {statsError && (
        <div className="p-3 bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-xs font-bold">
          <AlertCircle size={16} />
          <span>{statsError}</span>
        </div>
      )}

      {/* ── LIVE ROLE DISTRIBUTION ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="font-bold uppercase text-[#1F2937] dark:text-white tracking-wide">
          System Roles & Live User Distribution
        </h3>

        {statsLoading ? (
          <div className="text-gray-500 dark:text-slate-400 py-4 text-center animate-pulse">
            Loading role statistics…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roleCards.map((r, i) => {
              const count = roleStats[r.role] ?? 0;
              return (
                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] border ${r.badge}`}>
                        {r.role}
                      </span>
                      <span className="text-xl font-bold text-[#1F2937] dark:text-white font-mono">
                        {count} <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">users</span>
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed pt-1">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ASSIGN ROLE FORM (user search + confirmation) ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
        <h3 className="font-bold uppercase text-[#1F2937] dark:text-white flex items-center gap-2">
          <Key size={15} className="text-[#0F766E] dark:text-teal-400" />
          Assign / Delegate Role to User
        </h3>

        <form onSubmit={handleInitiateAssign} className="space-y-4">
          {/* User search */}
          <div className="relative">
            <label className="block text-gray-600 dark:text-slate-400 text-[10px] uppercase mb-1">
              Search User by Name or Email
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedUser(null); }}
                placeholder="Type name or email to search…"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
              />
            </div>

            {/* Dropdown results */}
            {filteredUsers.length > 0 && !selectedUser && (
              <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden text-xs">
                {filteredUsers.map(u => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => { setSelectedUser(u); setSearchQuery(`${u.name} — ${u.email}`); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 flex justify-between items-center transition-colors"
                    >
                      <span className="font-bold text-[#1F2937] dark:text-white">{u.name}</span>
                      <span className="text-gray-500 dark:text-slate-400">{u.email} · <span className="text-[#0F766E] dark:text-teal-400">{u.role}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {searchQuery.trim().length > 1 && filteredUsers.length === 0 && !selectedUser && (
              <p className="mt-1 text-gray-500 dark:text-slate-400 text-[10px] pl-1">No matching users found.</p>
            )}
          </div>

          {/* Selected user display */}
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
              <UserCheck size={16} className="text-[#0F766E] dark:text-teal-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1F2937] dark:text-white text-xs truncate">{selectedUser.name}</p>
                <p className="text-gray-500 dark:text-slate-400 text-[10px] truncate">{selectedUser.email} · Current role: <strong>{selectedUser.role}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Role select + submit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-gray-600 dark:text-slate-400 text-[10px] uppercase mb-1">Target Role</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value as KnownRole)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#0F766E] dark:text-teal-400 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] cursor-pointer"
              >
                {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedUser}
              className="w-full py-2 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
            >
              {isSubmitting ? 'Assigning…' : '+ Assign Role'}
            </button>
          </div>
        </form>
      </div>

      {/* ── PERMISSIONS MATRIX (persisted in DB) ──────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase text-[#1F2937] dark:text-white tracking-wide">
            Role-Based Permission Configuration Matrix
          </h3>
          <div className="flex items-center gap-2">
            {permsStatus && (
              <span className={`text-[10px] font-bold ${permsStatus.includes('Failed') ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {permsStatus}
              </span>
            )}
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={permsSaving || permsLoading}
              className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer shadow-2xs"
            >
              {permsSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
          {permsLoading ? (
            <div className="p-6 text-center text-gray-400 animate-pulse">Loading permissions…</div>
          ) : permissions.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No permissions data available.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 text-[11px]">
                  <th className="p-3.5">Module / Capability</th>
                  <th className="p-3.5 text-center">Admin</th>
                  <th className="p-3.5 text-center">Scrum Master</th>
                  <th className="p-3.5 text-center">Developer</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, idx) => (
                  <tr key={p.module} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-[#1F2937] dark:text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      {p.module}
                    </td>
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.admin_access}
                        disabled
                        title="Admin privileges are system-locked"
                        className="accent-[#0F766E] w-4 h-4 cursor-not-allowed"
                      />
                    </td>
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.scrum_master_access}
                        onChange={() => handleTogglePermission(idx, 'scrum_master_access')}
                        className="accent-[#0F766E] w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.developer_access}
                        onChange={() => handleTogglePermission(idx, 'developer_access')}
                        className="accent-[#0F766E] w-4 h-4 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-[10px] text-gray-500 dark:text-slate-500">
          Changes are staged locally. Click <strong>Save Changes</strong> to persist to the database.
          Admin row is always locked to full access.
        </p>
      </div>

      {/* ── CONFIRMATION DIALOG ───────────────────────────────────────────────── */}
      {confirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-[#1F2937] dark:text-white text-sm">Confirm Role Change</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">This action will be recorded in the audit log.</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg space-y-1 text-xs">
              <p><span className="text-gray-500">User:</span> <strong className="text-[#1F2937] dark:text-white">{selectedUser.name}</strong> ({selectedUser.email})</p>
              <p><span className="text-gray-500">Current role:</span> <strong className="text-gray-700 dark:text-slate-300">{selectedUser.role}</strong></p>
              <p><span className="text-gray-500">New role:</span> <strong className="text-[#0F766E] dark:text-teal-400">{targetRole}</strong></p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D655E] rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
