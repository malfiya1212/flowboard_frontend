// --- TYPES FOR ADMIN / AUTH ---
export type Role = 'Admin' | 'Scrum Master' | 'Developer';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Not Required';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle?: string;
  approvalStatus: ApprovalStatus;
  joinedAt: string;
}

// --- TYPES FOR SCRUM MASTER & AGILE BOARD ---
export interface User {
  id: string;
  name: string;
  role: string;
}

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Status = 
  | 'Backlog' | 'BACKLOG'
  | 'To Do' | 'TODO'
  | 'In Progress' | 'IN_PROGRESS'
  | 'Blocked' | 'BLOCKED'
  | 'Review' | 'REVIEW'
  | 'Completed' | 'COMPLETED';

export interface ActivityLog {
  action: string;
  timestamp: string;
  userId: string;
}

// The complete Task based on your requirements
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedUserId: string | null;
  createdById?: string; 
  priority: Priority;
  status: Status;
  dueDate?: string | null; 
  acceptanceCriteria?: string[]; 
  activityHistory?: ActivityLog[];
}