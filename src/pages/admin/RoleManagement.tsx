import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../service/api';

interface RoleStat {
  role: string;
  count: number;
}

interface PermissionModule {
  module: string;
  admin: boolean;
  scrumMaster: boolean;
  developer: boolean;
}

export default function RoleManagement() {
  const [roleStats, setRoleStats] = useState<Record<string, number>>({
    'Admin': 0,
    'Scrum Master': 0,
    'Developer': 0,
  });

  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Assign Role Form State
  const [targetEmail, setTargetEmail] = useState('');
  const [targetRole, setTargetRole] = useState<'Admin' | 'Scrum Master' | 'Developer' | 'Member'>('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // System Roles Definitions
  const roles = [
    { 
      role: 'Member', 
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      description: 'Standard team member with view and collaboration access' 
    },
    { 
      role: 'Developer', 
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Execute assigned tasks and update task progress' 
    },
    { 
      role: 'Scrum Master', 
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      description: 'Manage sprints, review queues, and team workflows' 
    },
    { 
      role: 'Admin', 
      badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
      description: 'Full system access and delegation capability' 
    },
  ];

  // Precise System Permissions Matrix
  const [permissions, setPermissions] = useState<PermissionModule[]>([
    { module: 'User Management', admin: true, scrumMaster: false, developer: false },
    { module: 'Role & Permission Assignment', admin: true, scrumMaster: true, developer: false },
    { module: 'Project CRUD & Archiving', admin: true, scrumMaster: true, developer: false },
    { module: 'Company Task Intervention', admin: true, scrumMaster: true, developer: false },
    { module: 'Team Creation & Membership', admin: true, scrumMaster: true, developer: false },
    { module: 'System Security & Logs', admin: true, scrumMaster: false, developer: false },
  ]);

  // Fetch live role stats from backend SQL GROUP BY endpoint
  const fetchRoleStats = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/admin/role-stats');
      if (Array.isArray(res.data)) {
        const statsMap: Record<string, number> = {
          'Admin': 0,
          'Scrum Master': 0,
          'Developer': 0,
        };
        res.data.forEach((item: RoleStat) => {
          if (item.role) {
            statsMap[item.role] = Number(item.count) || 0;
          }
        });
        setRoleStats(statsMap);
      }
    } catch (err: any) {
      console.error('Error fetching role stats:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load role statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleStats();
  }, []);

  // Handle assigning role to user and sending notification email
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) {
      setErrorMessage('User email is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setActionStatus(null);

    try {
      await api.put('/admin/update-role', {
        email: targetEmail.trim(),
        role: targetRole,
      });

      setActionStatus(`Role '${targetRole}' assigned to ${targetEmail} and notification email sent!`);
      setTargetEmail('');
      fetchRoleStats();
      setTimeout(() => setActionStatus(null), 6000);
    } catch (err: any) {
      console.error('Failed to assign role:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to assign role to user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle permission capability
  const handleTogglePermission = (index: number, roleKey: 'admin' | 'scrumMaster' | 'developer') => {
    if (roleKey === 'admin') return; // Admin has fixed system master privileges
    setPermissions(prev =>
      prev.map((p, i) => (i === index ? { ...p, [roleKey]: !p[roleKey] } : p))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl font-mono text-xs text-[#1F2937] dark:text-[#F8FAFC] transition-colors">
      {/* HEADER / MATRIX IDENTITY */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#1F2937] dark:text-white flex items-center gap-2">
            <Shield className="text-[#0F766E] dark:text-teal-400" size={18} />
            Admin Governance & Capability Matrix — [ROLE MANAGEMENT]
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Role counts populated via live SQL aggregation, delegation controls, and permission matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRoleStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-200 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer text-xs shadow-2xs transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 text-[#0F766E] dark:text-teal-400 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Lock size={12} /> Secure Cluster Active
          </span>
        </div>
      </div>

      {/* STATUS BANNERS */}
      {actionStatus && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 size={16} />
          <span>{actionStatus}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-xs font-bold">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SYSTEM ROLES & LIVE AGGREGATED COUNTS */}
      <div className="space-y-3">
        <h3 className="font-bold uppercase text-[#1F2937] dark:text-white tracking-wide">
          System Roles & Live User Distribution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r, i) => {
            const count = roleStats[r.role] ?? 0;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] border ${r.badgeColor}`}
                    >
                      {r.role}
                    </span>
                    <span className="text-xl font-bold text-[#1F2937] dark:text-white font-mono">
                      {count} <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">users</span>
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed pt-1">
                    {r.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center text-[10px]">
                  <span className="text-gray-500 dark:text-slate-400">Assigned In PostgreSQL:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{count} Live</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASSIGN ROLE FORM */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
        <h3 className="font-bold uppercase text-[#1F2937] dark:text-white flex items-center gap-2">
          <Key size={15} className="text-[#0F766E] dark:text-teal-400" />
          Assign / Delegate Role to User
        </h3>

        <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-gray-600 dark:text-slate-400 text-[10px] uppercase mb-1">User Email</label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#1F2937] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-gray-600 dark:text-slate-400 text-[10px] uppercase mb-1">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-[#0F766E] dark:text-teal-400 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] cursor-pointer"
            >
              <option value="Member">Member</option>
              <option value="Developer">Developer</option>
              <option value="Scrum Master">Scrum Master</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
            >
              {isSubmitting ? 'Assigning & Notifying...' : '+ Assign Role & Notify Email'}
            </button>
          </div>
        </form>
      </div>

      {/* ROLE-BASED PERMISSION CONFIGURATION MATRIX */}
      <div className="space-y-3">
        <h3 className="font-bold uppercase text-[#1F2937] dark:text-white tracking-wide">
          Role-Based Permission Configuration Matrix
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
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
                <tr
                  key={idx}
                  className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 font-bold text-[#1F2937] dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                    {p.module}
                  </td>
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={p.admin}
                      disabled
                      title="Admin privileges are system-locked"
                      className="accent-[#0F766E] w-4 h-4 cursor-not-allowed"
                    />
                  </td>
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={p.scrumMaster}
                      onChange={() => handleTogglePermission(idx, 'scrumMaster')}
                      className="accent-[#0F766E] w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={p.developer}
                      onChange={() => handleTogglePermission(idx, 'developer')}
                      className="accent-[#0F766E] w-4 h-4 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
