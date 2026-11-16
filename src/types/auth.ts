// src/types/auth.ts
export type UserRole = 'Member' | 'Developer' | 'Tester' | 'Scrum Master' | 'Admin';

export interface Permissions {
  canEditTasks: boolean;
  canSubmitReview: boolean;
  canReportBlockers: boolean;
  canResolveImpediments: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}