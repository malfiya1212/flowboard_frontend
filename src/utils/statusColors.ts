// Task status colors — consistent in both Light Mode and Dark Mode
// These colors keep the exact same meaning across Developer, Scrum Master, and Admin dashboards.

export const STATUS_COLORS = {
  // To Do: #64748B
  TODO: '#64748B',
  // In Progress: #2563EB
  IN_PROGRESS: '#2563EB',
  // In Review: #9333EA
  IN_REVIEW: '#9333EA',
  // Completed: #15803D
  COMPLETED: '#15803D',
  // Blocked / Warning: #D97706
  BLOCKED: '#D97706',
  WARNING: '#D97706',
  // Critical / Error: #DC2626
  CRITICAL: '#DC2626',
  ERROR: '#DC2626',
  // Backlog (neutral auxiliary status)
  BACKLOG: '#475569',
} as const;

export type TaskStatusKey = 
  | 'To Do' 
  | 'In Progress' 
  | 'In Review' 
  | 'Review Queue' 
  | 'Review' 
  | 'Completed' 
  | 'Blocked' 
  | 'Warning' 
  | 'Critical' 
  | 'Error' 
  | 'Backlog';

/**
 * Normalizes any task status or priority string and returns the canonical hex color.
 */
export function getStatusColor(statusOrPriority: string): string {
  const normalized = (statusOrPriority || '').toLowerCase().trim();

  // Critical / Error (#DC2626)
  if (normalized.includes('critical') || normalized.includes('error')) {
    return STATUS_COLORS.CRITICAL;
  }

  // Blocked / Warning (#D97706)
  if (
    normalized.includes('blocked') || 
    normalized.includes('warning') || 
    normalized.includes('impediment') ||
    normalized.includes('defect')
  ) {
    return STATUS_COLORS.BLOCKED;
  }

  // Completed (#15803D)
  if (
    normalized.includes('completed') || 
    normalized.includes('done') || 
    normalized.includes('complete')
  ) {
    return STATUS_COLORS.COMPLETED;
  }

  // In Review / Review Queue (#9333EA)
  if (
    normalized.includes('review') || 
    normalized.includes('in review') || 
    normalized.includes('review queue')
  ) {
    return STATUS_COLORS.IN_REVIEW;
  }

  // In Progress (#2563EB)
  if (
    normalized.includes('in progress') || 
    normalized.includes('in_progress') || 
    normalized.includes('progress')
  ) {
    return STATUS_COLORS.IN_PROGRESS;
  }

  // To Do (#64748B)
  if (
    normalized.includes('to do') || 
    normalized.includes('todo') || 
    normalized.includes('to_do')
  ) {
    return STATUS_COLORS.TODO;
  }

  // Backlog auxiliary
  if (normalized.includes('backlog')) {
    return STATUS_COLORS.BACKLOG;
  }

  return STATUS_COLORS.TODO;
}

/**
 * Generates badge CSS styling with status color, balanced opacity background and border
 */
export function getStatusBadgeStyle(status: string, isDark: boolean = false) {
  const color = getStatusColor(status);
  return {
    color: color,
    backgroundColor: isDark ? `${color}25` : `${color}15`,
    borderColor: isDark ? `${color}4D` : `${color}33`,
  };
}
