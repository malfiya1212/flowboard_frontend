// src/types/auth.ts
export type UserRole = 'Developer' | 'Scrum Master' | 'Admin';

export interface Permissions {
  canEditTasks: boolean;
  canSubmitReview: boolean;
  canReportBlockers: boolean;
  canResolveImpediments: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}