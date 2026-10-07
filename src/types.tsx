export type Role = 'ADMIN' | 'SCRUM_MASTER' | 'DEVELOPER';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedUserId: string | null;
  createdById: string;
  priority: Priority;
  status: Status;
  dueDate: Date | null;
  acceptanceCriteria: string[];
  activityHistory: ActivityLog[];
}