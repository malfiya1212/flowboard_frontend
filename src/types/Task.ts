export type UserRole = 'Developer' | 'Scrum Master' | 'Admin';

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  estimatedEffort: 'Small' | 'Medium' | 'Large' | 'Epic';
  isReadyForDevelopment: boolean;
}

export interface Task {
  id: string;
  backlogReferenceId?: string; 
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  dueDate: string;
  blockReason?: string;
  reviewFeedback?: string;
}