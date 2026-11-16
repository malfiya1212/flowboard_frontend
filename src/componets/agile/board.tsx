import { useState, useMemo, useEffect } from 'react';
import { 
  GripVertical, AlertTriangle, Calendar,
  ShieldAlert, X, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../commen/Badge';
import { STATUS_COLORS, getStatusColor } from '../../utils/statusColors';
import { isTaskOverdue } from '../../utils/dateUtils';

export type ColumnId = 'todo' | 'in_progress' | 'review_queue' | 'completed' | 'blocked';
export type UserRole = 'Developer' | 'Tester' | 'Scrum Master' | 'Admin' | string;

export interface ColumnDefinition {
  id: ColumnId;
  title: string;
  status: Task['status'];
  color: string;
}

export const KANBAN_COLUMNS: ColumnDefinition[] = [
  { id: 'todo', title: 'TO DO', status: 'To Do', color: STATUS_COLORS.TODO },
  { id: 'in_progress', title: 'IN PROGRESS', status: 'In Progress', color: STATUS_COLORS.IN_PROGRESS },
  { id: 'review_queue', title: 'REVIEW QUEUE', status: 'Review Queue', color: STATUS_COLORS.IN_REVIEW },
  { id: 'completed', title: 'COMPLETED', status: 'Completed', color: STATUS_COLORS.COMPLETED },
  { id: 'blocked', title: 'BLOCKED', status: 'Blocked', color: STATUS_COLORS.BLOCKED },
];

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

export interface BoardProps {
  tasks: Task[];
  userRole?: UserRole;
  onUpdateStatus?: (taskId: string, newStatus: Task['status']) => void;
  onUpdateTask?: (updatedTask: any) => void;
  onSelectTask?: (task: Task) => void;
}

/**
 * Maps any task status string to canonical Column ID
 */
export function getColumnIdFromStatus(status: Task['status'] | string): ColumnId {
  const norm = (status || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (norm.includes('review')) return 'review_queue';
  if (norm.includes('progress')) return 'in_progress';
  if (norm.includes('completed') || norm.includes('done')) return 'completed';
  if (norm.includes('blocked') || norm.includes('bug')) return 'blocked';
  return 'todo';
}

/**
 * Strict check if a role is allowed to initiate a drag on a task.
 * - Testers can ONLY drag tasks that are already in the Review Queue.
 * - Developers cannot drag tasks that are in the Review Queue (locked for QA).
 */
export function isTaskDraggableByRole(task: Task, role: UserRole = 'Developer'): { canDrag: boolean; reason?: string } {
  const norm = role.toLowerCase().replace(/[\s_-]+/g, '');
  const colId = getColumnIdFromStatus(task.status);

  if (norm.includes('test')) {
    // QA Testers may ONLY pick up tasks that are sitting in the Review Queue
    if (colId !== 'review_queue') {
      return {
        canDrag: false,
        reason: 'QA Testers can only move tasks that are in the Review Queue.'
      };
    }
  } else if (norm.includes('dev')) {
    // Developers are locked out of the Review Queue — only QA can action those
    if (colId === 'review_queue') {
      return {
        canDrag: false,
        reason: 'Developers cannot move tasks out of the Review Queue. Only QA Testers can action tasks in this stage.'
      };
    }
  }

  return { canDrag: true };
}

/**
 * Validates whether a specific status transition between column IDs is permitted for the given role.
 *
 * Developer rules:
 *   - Cannot move tasks OUT of Review Queue (only Testers can).
 *   - Cannot move tasks directly TO Completed (must pass QA first).
 *
 * Tester rules:
 *   - Can ONLY move tasks that are currently in the Review Queue.
 *   - Can move Review Queue → Completed (Pass) or Review Queue → Blocked (Reject).
 */
export function validateRoleTransition(
  sourceColId: ColumnId,
  targetColId: ColumnId,
  role: UserRole = 'Developer'
): { allowed: boolean; reason?: string } {
  const norm = role.toLowerCase().replace(/[\s_-]+/g, '');

  // No-op move: always allowed
  if (sourceColId === targetColId) return { allowed: true };

  if (norm.includes('test')) {
    // Testers are only authorised to work on tasks sitting in the Review Queue
    if (sourceColId !== 'review_queue') {
      return {
        allowed: false,
        reason: 'QA Testers can only action tasks that are in the Review Queue.'
      };
    }
    // Testers may pass (Completed) or reject (Blocked) — nothing else
    if (targetColId !== 'completed' && targetColId !== 'blocked') {
      return {
        allowed: false,
        reason: 'QA Testers can only move Review Queue tasks to Completed (Pass) or Blocked (Reject/Defect).'
      };
    }
  } else if (norm.includes('dev')) {
    // Developers cannot touch tasks already in the Review Queue
    if (sourceColId === 'review_queue') {
      return {
        allowed: false,
        reason: 'Developers are locked out of the Review Queue. Only QA Testers can verify and move these tasks.'
      };
    }
    // Developers cannot skip QA and mark tasks Completed directly
    if (targetColId === 'completed') {
      return {
        allowed: false,
        reason: 'Developers cannot mark tasks as Completed directly. Tasks must pass QA verification first.'
      };
    }
  }

  return { allowed: true };
}

export default function Board({ tasks, userRole = 'Developer', onUpdateStatus, onUpdateTask, onSelectTask }: BoardProps) {
  const navigate = useNavigate();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(null);
  const [permissionAlert, setPermissionAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Auto-dismiss alert after 6 seconds
  useEffect(() => {
    if (permissionAlert) {
      const timer = setTimeout(() => setPermissionAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [permissionAlert]);

  // Group and filter tasks by column ID, sorted strictly by numeric ID
  const tasksByColumnId = useMemo(() => {
    const map = new Map<ColumnId, Task[]>();
    KANBAN_COLUMNS.forEach(col => map.set(col.id, []));

    tasks.forEach(task => {
      const targetColId = getColumnIdFromStatus(task.status);
      map.get(targetColId)?.push(task);
    });

    // Sort board cards in each column by numeric ID in ascending order (FB-1, FB-2, FB-3, ...)
    KANBAN_COLUMNS.forEach(col => {
      const colList = map.get(col.id) || [];
      colList.sort((a, b) => {
        const numA = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });
      map.set(col.id, colList);
    });

    return map;
  }, [tasks]);

  const draggingTask = useMemo(() => {
    if (!draggingTaskId) return null;
    return tasks.find(t => t.id === draggingTaskId) || null;
  }, [draggingTaskId, tasks]);

  const sourceColId = useMemo(() => {
    if (!draggingTask) return null;
    return getColumnIdFromStatus(draggingTask.status);
  }, [draggingTask]);

  const handleDrop = (column: ColumnDefinition, e?: React.DragEvent) => {
    const transferredId = e?.dataTransfer?.getData('text/plain') || e?.dataTransfer?.getData('taskId');
    const effectiveTaskId = transferredId || draggingTaskId;

    if (!effectiveTaskId) {
      setDraggingTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    const taskToMove = tasks.find(t => t.id === effectiveTaskId) || draggingTask;
    if (!taskToMove) {
      setDraggingTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    const taskSourceColId = getColumnIdFromStatus(taskToMove.status);

    // Role-based validation guard
    const validation = validateRoleTransition(taskSourceColId, column.id, userRole);
    if (!validation.allowed) {
      setPermissionAlert({
        message: validation.reason || 'Transition not allowed for your role.',
        type: 'error'
      });
      setDraggingTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    // Clear alert on successful transition
    setPermissionAlert(null);

    if (onUpdateStatus) {
      onUpdateStatus(effectiveTaskId, column.status);
    } else if (onUpdateTask) {
      onUpdateTask({ ...taskToMove, status: column.status });
    }

    setDraggingTaskId(null);
    setDragOverColumnId(null);
  };

  return (
    <div className="flex-1 p-4 overflow-x-auto h-full flex flex-col" id="board-container">

      {/* Permission Block Alert Toast */}
      {permissionAlert && (
        <div 
          id="role-permission-alert"
          className="mb-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-mono flex items-center justify-between shadow-xs animate-in fade-in shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Permission Guard ({userRole}):</strong> {permissionAlert.message}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setPermissionAlert(null)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer ml-3 font-bold"
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Kanban 5-Column Grid */}
      <div className="grid grid-cols-5 gap-3 h-full min-w-[1100px] flex-1 min-h-0 overflow-hidden">
        {KANBAN_COLUMNS.map(column => {
          const colTasks = tasksByColumnId.get(column.id) || [];
          const taskCount = colTasks.length;
          const colColor = column.color || getStatusColor(column.status);

          // Calculate drag-over visual cues
          const isDragTarget = dragOverColumnId === column.id && draggingTask != null;
          let dragOverStyling = '';
          if (isDragTarget && sourceColId) {
            const check = validateRoleTransition(sourceColId, column.id, userRole);
            if (check.allowed) {
              dragOverStyling = 'ring-2 ring-emerald-500/80 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 shadow-md';
            } else {
              dragOverStyling = 'ring-2 ring-rose-500/80 border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 cursor-no-drop';
            }
          }

          return (
            <div 
              key={column.id} 
              id={`column-${column.id}`}
              data-column-id={column.id}
              data-column-status={column.status}
              onDragOver={e => {
                e.preventDefault();
                if (dragOverColumnId !== column.id) {
                  setDragOverColumnId(column.id);
                }
              }}
              onDragLeave={() => {
                if (dragOverColumnId === column.id) {
                  setDragOverColumnId(null);
                }
              }}
              onDrop={e => {
                e.preventDefault();
                handleDrop(column, e);
              }}
              className={`flex flex-col rounded-xl overflow-hidden h-full bg-gray-50/70 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 transition-all ${dragOverStyling}`}
            >
              {/* Column Header */}
              <div 
                id={`header-${column.id}`}
                className="px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs shrink-0"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                    style={{ backgroundColor: colColor }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-mono font-bold tracking-wide text-slate-800 dark:text-slate-100">
                    {column.title}
                  </span>
                  {/* QA-only lock badge: shown to Developers on the Review Queue column */}
                  {column.id === 'review_queue' && (() => {
                    const norm = userRole.toLowerCase().replace(/[\s_-]+/g, '');
                    if (norm.includes('dev')) {
                      return (
                        <span
                          className="flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-400/30 text-purple-700 dark:text-purple-400"
                          title="Only QA Testers can action tasks in this column"
                        >
                          <Lock size={9} className="shrink-0" />
                          QA ONLY
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                <span 
                  id={`badge-count-${column.id}`}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors shadow-2xs"
                  style={{
                    color: colColor,
                    backgroundColor: `${colColor}18`,
                    borderColor: `${colColor}35`,
                  }}
                  title={`${taskCount} tasks in ${column.title}`}
                >
                  {taskCount}
                </span>
              </div>

              {/* Column Body / Tasks Container */}
              <div 
                id={`tasks-container-${column.id}`}
                className="flex-1 p-2 overflow-y-auto space-y-2.5"
              >
                {taskCount === 0 ? (
                  <div 
                    id={`empty-state-${column.id}`}
                    className="h-24 border border-dashed border-gray-300 dark:border-slate-800 rounded-lg m-1 flex items-center justify-center text-gray-400 dark:text-slate-500 text-xs italic bg-white/40 dark:bg-slate-800/20"
                  >
                    Drop a card here
                  </div>
                ) : (
                  colTasks.map(task => {
                    const isOverdue = isTaskOverdue(task.endDate || task.dueDate, task.status);
                    const dragCheck = isTaskDraggableByRole(task, userRole);
                    const isDraggable = dragCheck.canDrag;

                    return (
                      <div 
                        key={task.id} 
                        id={`board-card-${task.id}`}
                        data-task-id={task.id}
                        data-card-id={task.id}
                        data-column-id={column.id}
                        draggable={isDraggable}
                        onDragStart={(e) => {
                          if (!isDraggable) {
                            e.preventDefault();
                            setPermissionAlert({
                              message: dragCheck.reason || 'This task cannot be moved by your role.',
                              type: 'error'
                            });
                            return;
                          }
                          e.dataTransfer.setData('text/plain', task.id);
                          e.dataTransfer.setData('taskId', task.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggingTaskId(task.id);
                        }}
                        onClick={() => {
                          if (!isDraggable) {
                            setPermissionAlert({
                              message: dragCheck.reason || 'This task cannot be moved by your role.',
                              type: 'error'
                            });
                          }
                        }}
                        className={`bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-3 border space-y-2 shadow-xs transition-all select-none ${
                          isDraggable ? 'cursor-grab active:cursor-grabbing hover:shadow-sm' : 'cursor-not-allowed opacity-80'
                        } ${
                          isOverdue 
                            ? 'border-red-300 dark:border-red-800/80 ring-1 ring-red-400/30' 
                            : isDraggable
                              ? 'border-gray-200 dark:border-slate-700/80 hover:border-gray-300 dark:hover:border-slate-600'
                              : 'border-slate-300 dark:border-slate-600 ring-1 ring-slate-300/60 dark:ring-slate-600/40'
                        }`}
                      >
                        {/* Header: ID and Priority */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {isDraggable
                              ? <GripVertical size={12} className="text-gray-400 dark:text-slate-500 shrink-0" />
                              : (
                                <span title={dragCheck.reason} className="inline-flex items-center">
                                  <Lock size={11} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                </span>
                              )
                            }
                            <button 
                              type="button"
                              id={`task-id-${task.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tasks/${task.id}`);
                              }}
                              className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                              title={`Task ID: ${task.id} — Click to view description`}
                            >
                              {task.id}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <Badge label={task.priority} type="priority" />
                          </div>
                        </div>

                        {/* Overdue alert */}
                        {isOverdue && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-[10px] font-mono font-bold text-[#DC2626] dark:text-red-400">
                            <AlertTriangle size={11} className="shrink-0 text-[#DC2626]" />
                            <span>Deadline Missed (Overdue)</span>
                          </div>
                        )}

                        {/* Title */}
                        <p 
                          onClick={() => onSelectTask && onSelectTask(task)}
                          className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          title="Click to view details modal"
                        >
                          {task.title}
                        </p>

                        {/* Description */}
                        {task.description && (
                          <p 
                            onClick={() => onSelectTask && onSelectTask(task)}
                            className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 cursor-pointer hover:text-gray-700 dark:hover:text-slate-300"
                            title="Click to view details modal"
                          >
                            {task.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-slate-500 flex-wrap gap-1">
                          <span className="truncate max-w-[100px]" title={task.assignee}>
                            {task.assignee || 'Unassigned'}
                          </span>
                          {(task.endDate || task.dueDate) ? (
                            <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-[#DC2626] font-bold' : ''}`} title={`Due: ${task.endDate || task.dueDate}`}>
                              <Calendar size={10} className="shrink-0" />
                              <span>{task.endDate || task.dueDate}</span>
                            </span>
                          ) : (
                            <span className="italic">Drag to move</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}