import React from 'react';
import { Shield, Check, Lock, RefreshCw } from 'lucide-react';
import { usePermissions, UserRole } from '../../context/permision';

export default function RolePermissions() {
  const { role, setRole, permissions } = usePermissions();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  return (
    <div className="bg-white rounded-sm p-6 border border-[oklch(90%_0.02_320)] max-w-xl w-full space-y-5 font-sans shadow-none">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2 rounded-sm bg-[oklch(15%_0.02_320)] text-white">
          <Shield size={18} />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-900">
            Backend Access Control & Role Matrix
          </h3>
          <p className="text-[11px] text-gray-500">Permissions update dynamically based on assigned session role.</p>
        </div>
      </div>

      {/* Role Selector (Simulating Backend Role Assignment) */}
      <div className="flex justify-between items-center p-3 bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)] text-xs font-mono">
        <span className="text-gray-600">Active Backend Role:</span>
        <select 
          value={role} 
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          className="bg-white font-bold uppercase px-2.5 py-1 rounded-sm border border-[oklch(90%_0.02_320)] text-[oklch(15%_0.02_320)] focus:outline-none cursor-pointer"
        >
          <option value="Developer">Developer</option>
          <option value="Scrum Master">Scrum Master</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {/* Dynamic Permission Checklists */}
      <div className="space-y-2.5 text-xs font-mono">
        <PermissionRow 
          label="Task Lifecycle CRUD (Create, Update, Progress)" 
          allowed={permissions.canEditTasks} 
        />
        <PermissionRow 
          label="Review Queue Submissions & Handover" 
          allowed={permissions.canSubmitReview} 
        />
        <PermissionRow 
          label="Impediment & Blocked Status Reporting" 
          allowed={permissions.canReportBlockers} 
        />
        <PermissionRow 
          label="Resolve Blockers & Clear Impediments" 
          allowed={permissions.canResolveImpediments} 
        />
        <PermissionRow 
          label="Manage Workspace Users & Accounts" 
          allowed={permissions.canManageUsers} 
        />
        <PermissionRow 
          label="System Administration Panel Access" 
          allowed={permissions.canAccessAdminPanel} 
        />
      </div>

    </div>
  );
}

function PermissionRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex justify-between items-center p-2.5 bg-white rounded-sm border border-[oklch(90%_0.02_320)]">
      <span className="text-gray-700 text-[11px]">{label}</span>
      {allowed ? (
        <span className="inline-flex items-center gap-1 text-green-700 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">
          <Check size={12} strokeWidth={3} /> ALLOWED
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[10px] bg-red-50 px-2 py-0.5 rounded-sm border border-red-200">
          <Lock size={12} strokeWidth={2.5} /> RESTRICTED
        </span>
      )}
    </div>
  );
}