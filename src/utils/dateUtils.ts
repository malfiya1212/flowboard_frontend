/**
 * Date and Deadline utility functions.
 * Calculates exact task timeline progress and overdue status based on actual Start and End Dates.
 */

export interface DeadlineInfo {
  isOverdue: boolean;
  isDueToday: boolean;
  daysDiff: number; // Positive = overdue days, Negative = remaining days, 0 = due today
  statusText: string;
  badgeType: 'overdue' | 'dueToday' | 'onTrack' | 'completed' | 'none';
  formattedStart: string;
  formattedEnd: string;
}

/**
 * Get current local date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format any date string safely into YYYY-MM-DD
 */
export function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return '';
  const clean = dateStr.includes('T') ? dateStr.split('T')[0].trim() : dateStr.trim();
  return clean;
}

/**
 * Add days to a given YYYY-MM-DD date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  const resYear = date.getUTCFullYear();
  const resMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const resDay = String(date.getUTCDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

/**
 * Detailed deadline calculation comparing task's End Date to today's date.
 */
export function getTaskDeadlineInfo(
  startDate?: string | null,
  endDate?: string | null,
  status?: string
): DeadlineInfo {
  const formattedStart = formatDateString(startDate);
  const formattedEnd = formatDateString(endDate);
  const s = (status || '').trim().toLowerCase();

  // Completed or Done tasks are never overdue
  if (s === 'completed' || s === 'done') {
    return {
      isOverdue: false,
      isDueToday: false,
      daysDiff: 0,
      statusText: 'Completed',
      badgeType: 'completed',
      formattedStart,
      formattedEnd
    };
  }

  if (!formattedEnd || !/^\d{4}-\d{2}-\d{2}$/.test(formattedEnd)) {
    return {
      isOverdue: false,
      isDueToday: false,
      daysDiff: 0,
      statusText: 'No deadline set',
      badgeType: 'none',
      formattedStart,
      formattedEnd
    };
  }

  const todayStr = getTodayString();
  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const [eY, eM, eD] = formattedEnd.split('-').map(Number);

  const todayMs = Date.UTC(tY, tM - 1, tD);
  const endMs = Date.UTC(eY, eM - 1, eD);
  const diffDays = Math.round((todayMs - endMs) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    // Past end date -> Overdue
    const daysLabel = diffDays === 1 ? '1 day' : `${diffDays} days`;
    return {
      isOverdue: true,
      isDueToday: false,
      daysDiff: diffDays,
      statusText: `Deadline Missed (${daysLabel} overdue)`,
      badgeType: 'overdue',
      formattedStart,
      formattedEnd
    };
  } else if (diffDays === 0) {
    // Exactly today
    return {
      isOverdue: false,
      isDueToday: true,
      daysDiff: 0,
      statusText: 'Due today',
      badgeType: 'dueToday',
      formattedStart,
      formattedEnd
    };
  } else {
    // Future end date -> On track
    const remainingDays = Math.abs(diffDays);
    const daysLabel = remainingDays === 1 ? '1 day remaining' : `${remainingDays} days remaining`;
    return {
      isOverdue: false,
      isDueToday: false,
      daysDiff: diffDays,
      statusText: `On Track (${daysLabel})`,
      badgeType: 'onTrack',
      formattedStart,
      formattedEnd
    };
  }
}

/**
 * Simple boolean check: returns true if task is currently past its end date and uncompleted.
 */
export function isTaskOverdue(endDate?: string | null, status?: string): boolean {
  const info = getTaskDeadlineInfo(null, endDate, status);
  return info.isOverdue;
}
