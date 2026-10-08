import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'Developer' | 'Scrum Master' | 'Admin';

export interface Permissions {
  canEditTasks: boolean;
  canSubmitReview: boolean;
  canReportBlockers: boolean;
  canResolveImpediments: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}

interface PermissionsContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: Permissions;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Backend simulation: Maps roles to dynamic permission sets
const rolePermissionsMap: Record<UserRole, Permissions> = {
  Developer: {
    canEditTasks: true,
    canSubmitReview: true,
    canReportBlockers: true,
    canResolveImpediments: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  'Scrum Master': {
    canEditTasks: true,
    canSubmitReview: true,
    canReportBlockers: false,
    canResolveImpediments: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  Admin: {
    canEditTasks: true,
    canSubmitReview: true,
    canReportBlockers: true,
    canResolveImpediments: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
  },
};

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('Developer');

  const permissions = rolePermissionsMap[role];

  return (
    <PermissionsContext.Provider value={{ role, setRole, permissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}