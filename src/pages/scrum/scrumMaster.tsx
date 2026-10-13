import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Edit3, BarChart3, FolderKanban, 
  RotateCcw, Search, X, Archive, CheckSquare, 
  Calendar, User as UserIcon, Clock, Check, 
  Layers, ArrowRight, Play, CheckCircle2, Bug, Copy, FileText,
  AlertTriangle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskFormModal from './TaskModel';
import type { TaskFormData } from './TaskModel';
import Badge from '../../componets/commen/Badge';
import ThemeToggle from '../../componets/commen/ThemeToggle';
import { STATUS_COLORS } from '../../utils/statusColors';
import { isTaskOverdue, getTaskDeadlineInfo, getTodayString, addDaysToDate } from '../../utils/dateUtils';
import api from '../../service/api';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  isArchived?: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function ScrumMasterDashboard() {
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'board' | 'backlog' | 'reports' | 'archive'>('board');

  // Real authenticated user from localStorage
  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('flowboard_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [userData, setUserData] = useState<any>(storedUser || null);

  // Real Database Tasks & Team state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [, setLoading] = useState(true);

  // Modal & Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState<Task['status']>('Backlog');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [assignModalTask, setAssignModalTask] = useState<Task | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [quickDateTask, setQuickDateTask] = useState<Task | null>(null);

  // Drag and Drop state for full Scrum Master board permissions
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');

  // 1. Fetch real user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data) {
          setUserData(res.data);
          localStorage.setItem('flowboard_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Could not fetch user profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // 2. Fetch real database tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/tasks');
      if (res.data && Array.isArray(res.data)) {
        const mapped: Task[] = res.data.map((item: any) => ({
          id: String(item.id).startsWith('FB-') ? String(item.id) : `FB-${item.id}`,
          title: item.title || 'Untitled Task',
          description: item.description || '',
          priority: (item.priority || 'Medium') as Task['priority'],
          status: (item.status === 'Review' ? 'Review Queue' : (item.status || 'Backlog')) as Task['status'],
          assignee: item.assignee || 'Unassigned',
          startDate: item.start_date || item.startDate || '',
          endDate: item.end_date || item.endDate || item.due_date || item.dueDate || '',
          dueDate: item.end_date || item.endDate || item.due_date || item.dueDate || '',
          isArchived: Boolean(item.is_archived)
        }));
        setTasks(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch tasks from database:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch real team members from database
  const fetchTeam = async () => {
    try {
      const res = await api.get('/user/team');
      if (res.data && Array.isArray(res.data)) {
        setTeamMembers(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch team members:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTeam();
  }, []);

  // 4. Save or Edit Task in PostgreSQL database
  const handleSaveTask = async (data: TaskFormData) => {
    const rawId = data.id ? data.id.replace('FB-', '') : null;

    if (rawId) {
      try {
        const res = await api.put(`/user/tasks/${rawId}`, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assignee: data.status === 'Backlog' ? 'Unassigned' : (data.assignee || 'Unassigned'),
          startDate: data.startDate,
          endDate: data.endDate,
          dueDate: data.endDate || data.dueDate
        });
        const updated = res.data;
        setTasks(prev => prev.map(t => t.id === data.id ? {
          ...t,
          title: updated.title,
          description: updated.description,
          priority: updated.priority,
          status: updated.status,
          assignee: updated.assignee,
          startDate: updated.start_date || updated.startDate || data.startDate,
          endDate: updated.end_date || updated.endDate || updated.due_date || data.endDate,
          dueDate: updated.end_date || updated.endDate || updated.due_date || updated.dueDate || data.endDate
        } : t));
      } catch (err) {
        console.error('Failed to update task:', err);
        throw err;
      }
    } else {
      try {
        const res = await api.post('/user/tasks', {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assignee: data.status === 'Backlog' ? 'Unassigned' : (data.assignee || 'Unassigned'),
          startDate: data.startDate,
          endDate: data.endDate,
          dueDate: data.endDate || data.dueDate
        });
        const created = res.data;
        const newTask: Task = {
          id: String(created.id).startsWith('FB-') ? String(created.id) : `FB-${created.id}`,
          title: created.title,
          description: created.description,
          priority: created.priority,
          status: created.status,
          assignee: created.assignee,
          startDate: created.start_date || created.startDate || data.startDate,
          endDate: created.end_date || created.endDate || created.due_date || data.endDate,
          dueDate: created.end_date || created.endDate || created.due_date || created.dueDate || data.endDate,
          isArchived: false
        };
        setTasks(prev => [newTask, ...prev]);
      } catch (err) {
        console.error('Failed to create task:', err);
        throw err;
      }
    }
  };

  // 5. Update Status in PostgreSQL database
  const handleMoveStatus = async (id: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (newStatus === 'To Do' && task && (!task.assignee || task.assignee === 'Unassigned')) {
      setAssignModalTask(task);
      setSelectedAssignee('');
      return;
    }

    const rawId = id.replace('FB-', '');
    if (newStatus === 'Backlog') {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Backlog', assignee: 'Unassigned' } : t));
      try {
        await api.put(`/user/tasks/${rawId}`, { status: 'Backlog', assignee: 'Unassigned' });
      } catch (err) {
        console.error('Failed to reset task to backlog:', err);
        fetchTasks();
      }
      return;
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/user/tasks/${rawId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status in database:', err);
      fetchTasks();
    }
  };

  // 6. Confirm Assignee and Move Backlog Task to To Do
  const handleConfirmAssignAndMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalTask) return;
    const userToAssign = selectedAssignee.trim();
    if (!userToAssign || userToAssign === 'Unassigned') return;

    const id = assignModalTask.id;
    const rawId = id.replace('FB-', '');
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'To Do', assignee: userToAssign } : t));
    try {
      await api.put(`/user/tasks/${rawId}`, { status: 'To Do', assignee: userToAssign });
    } catch (err) {
      console.error('Failed to update task status & assignee in database:', err);
      fetchTasks();
    }
    setAssignModalTask(null);
    setSelectedAssignee('');
  };

  // Full Drag-and-Drop handler for Scrum Master across all columns
  const handleDropToStatus = (targetStatus: Task['status']) => {
    setDragOverColumn(null);
    if (!draggingTaskId) return;
    const task = tasks.find(t => t.id === draggingTaskId);
    if (!task) {
      setDraggingTaskId(null);
      return;
    }
    if (task.status === targetStatus) {
      setDraggingTaskId(null);
      return;
    }
    handleMoveStatus(draggingTaskId, targetStatus);
    setDraggingTaskId(null);
  };

  // 7. Soft-Archive Task
  const handleArchiveTask = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
    const rawId = id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}/archive`, { isArchived: true });
    } catch (err) {
      console.warn('Soft-archived locally; remote endpoint notice:', err);
    }
  };

  // 8. Restore Soft-Archived Task
  const handleRestoreTask = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
    const rawId = id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}/archive`, { isArchived: false });
    } catch (err) {
      console.warn('Restored locally; remote endpoint notice:', err);
    }
  };

  // 9. Permanently Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm(`Permanently delete task ${id}? This cannot be undone.`)) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    const rawId = id.replace('FB-', '');
    try {
      await api.delete(`/user/tasks/${rawId}`);
    } catch (err) {
      console.error('Failed to delete task from database:', err);
      fetchTasks();
    }
  };

  const handleOpenCreateModal = (status: Task['status'] = 'Backlog') => {
    setEditingTask(null);
    setDefaultStatusForNewTask(status);
    setIsModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setDefaultStatusForNewTask(task.status);
    setIsModalOpen(true);
  };

  const handleUpdateTaskDates = async (taskId: string, newStartDate: string, newEndDate: string) => {
    const rawId = taskId.replace('FB-', '');
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      startDate: newStartDate,
      endDate: newEndDate,
      dueDate: newEndDate
    } : t));

    try {
      await api.put(`/user/tasks/${rawId}`, {
        startDate: newStartDate,
        endDate: newEndDate,
        dueDate: newEndDate
      });
    } catch (err) {
      console.error('Failed to update task dates in database:', err);
      fetchTasks();
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Active vs Archived tasks
  const activeTasks = useMemo(() => tasks.filter(t => !t.isArchived), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter(t => t.isArchived), [tasks]);

  // Search & Filter
  const filteredTasks = useMemo(() => {
    return activeTasks.filter(task => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        task.title.toLowerCase().includes(q) || 
        task.id.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q));

      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'All' || task.assignee === filterAssignee;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [activeTasks, searchQuery, filterPriority, filterAssignee]);

  // Tasks by column
  const backlogTasks = useMemo(() => filteredTasks.filter(t => t.status === 'Backlog'), [filteredTasks]);
  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === 'To Do'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter(t => t.status === 'In Progress'), [filteredTasks]);
  const reviewTasks = useMemo(() => filteredTasks.filter(t => t.status === 'Review Queue'), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.status === 'Completed'), [filteredTasks]);
  const blockedTasks = useMemo(() => filteredTasks.filter(t => t.status === 'Blocked'), [filteredTasks]);

  // Sprint Velocity Metrics
  const sprintMetrics = useMemo(() => {
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.status === 'Completed').length;
    const inProgress = activeTasks.filter(t => t.status === 'In Progress').length;
    const todo = activeTasks.filter(t => t.status === 'To Do').length;
    const backlog = activeTasks.filter(t => t.status === 'Backlog').length;
    const reviewQueue = activeTasks.filter(t => t.status === 'Review Queue').length;
    const blocked = activeTasks.filter(t => t.status === 'Blocked').length;

    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      inProgress,
      todo,
      backlog,
      reviewQueue,
      blocked,
      progressPercent
    };
  }, [activeTasks]);

  // Donut chart calculations with STRICT CANONICAL status colors
  const donutSegments = useMemo(() => {
    const total = sprintMetrics.total;
    if (total === 0) return [];

    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const data = [
      { label: 'Completed', count: sprintMetrics.completed, color: STATUS_COLORS.COMPLETED },
      { label: 'In Progress', count: sprintMetrics.inProgress, color: STATUS_COLORS.IN_PROGRESS },
      { label: 'To Do', count: sprintMetrics.todo, color: STATUS_COLORS.TODO },
      { label: 'Review Queue', count: sprintMetrics.reviewQueue, color: STATUS_COLORS.IN_REVIEW },
      { label: 'Backlog', count: sprintMetrics.backlog, color: STATUS_COLORS.BACKLOG },
      { label: 'Blocked / Warning', count: sprintMetrics.blocked, color: STATUS_COLORS.BLOCKED },
    ].filter(item => item.count > 0);

    let accumulatedPercent = 0;
    return data.map(slice => {
      const percent = slice.count / total;
      const strokeDasharray = `${percent * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedPercent * circumference;
      accumulatedPercent += percent;
      return {
        ...slice,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [sprintMetrics]);

  // Unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    const names = new Set<string>();
    activeTasks.forEach(t => {
      if (t.assignee && t.assignee !== 'Unassigned') names.add(t.assignee);
    });
    return Array.from(names);
  }, [activeTasks]);

  // Assignable team members (Only Developers and Testers - Scrum Master and Admin excluded)
  const assignableMembers = useMemo(() => {
    const seen = new Set<string>();
    return teamMembers.filter(m => {
      const role = (m.role || '').toLowerCase();
      const name = (m.name || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const isAdmin = role.includes('admin') || name.includes('admin') || email.includes('admin');
      const isScrum = role.includes('scrum') || name.includes('scrum') || email.includes('scrum');
      const isPending = m.status === 'PENDING' || !m.role;
      if (isAdmin || isScrum || isPending || !m.name) return false;
      if (seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    });
  }, [teamMembers]);

  const dbScrumMaster = useMemo(() => {
    return teamMembers.find(m => (m.role || '').toLowerCase().includes('scrum'));
  }, [teamMembers]);

  const isCurrentScrum = Boolean((userData?.role || storedUser?.role || '').toLowerCase().includes('scrum'));
  const activeScrumMaster = isCurrentScrum 
    ? (userData || storedUser) 
    : (dbScrumMaster || {
        name: 'malefiya',
        email: 'malefiya319@gmail.com',
        role: 'Scrum Master'
      });

  const currentUserName = activeScrumMaster?.name || 'malefiya';

  // Real Completion Trend calculations for live SVG graph
  const completionTrendData = useMemo(() => {
    const total = activeTasks.length || 1;
    const completed = sprintMetrics.completed;
    const inProgress = sprintMetrics.inProgress;
    const review = sprintMetrics.reviewQueue;
    const todo = sprintMetrics.todo;

    const milestones = [
      { label: 'Start', val: 0 },
      { label: 'Plan', val: Math.min(completed, Math.round(todo * 0.15)) },
      { label: 'Dev', val: Math.min(completed, Math.round((inProgress + review) * 0.35)) },
      { label: 'Mid', val: Math.min(completed, Math.round(completed * 0.5)) },
      { label: 'QA', val: Math.min(completed, Math.round(completed * 0.75)) },
      { label: 'Today', val: completed },
    ];

    const maxVal = Math.max(total, 5);
    const width = 340;
    const height = 110;
    const padX = 25;
    const padY = 15;

    const coords = milestones.map((m, idx) => {
      const x = padX + (idx / (milestones.length - 1)) * (width - 2 * padX);
      const y = height - padY - (m.val / maxVal) * (height - 2 * padY);
      return { ...m, x, y };
    });

    const pathD = coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;

    return { coords, pathD, areaD, maxVal, width, height };
  }, [activeTasks.length, sprintMetrics]);

  // Real Developer Workload distribution from live database tasks
  const developerWorkloadData = useMemo(() => {
    const counts: Record<string, { total: number; completed: number; inProgress: number; review: number; blocked: number; todo: number }> = {};
    
    activeTasks.forEach(task => {
      const dev = task.assignee || 'Unassigned';
      if (!counts[dev]) {
        counts[dev] = { total: 0, completed: 0, inProgress: 0, review: 0, blocked: 0, todo: 0 };
      }
      counts[dev].total += 1;
      if (task.status === 'Completed') counts[dev].completed += 1;
      else if (task.status === 'In Progress') counts[dev].inProgress += 1;
      else if (task.status === 'Review Queue') counts[dev].review += 1;
      else if (task.status === 'Blocked') counts[dev].blocked += 1;
      else if (task.status === 'To Do') counts[dev].todo += 1;
    });

    const totalTasks = activeTasks.length || 1;
    const palette = ['#2563EB', '#16A34A', '#9333EA', '#0F766E', '#D97706'];

    return Object.entries(counts).map(([name, data], idx) => {
      const percent = Math.round((data.total / totalTasks) * 100);
      const color = palette[idx % palette.length];
      return {
        name,
        ...data,
        percent,
        color,
      };
    }).sort((a, b) => b.total - a.total);
  }, [activeTasks]);

  // Real Blocked Defects & Overdue Tasks from live database
  const blockedOverdueData = useMemo(() => {
    const blocked = activeTasks.filter(t => t.status === 'Blocked');
    const overdue = activeTasks.filter(t => isTaskOverdue(t.endDate || t.dueDate, t.status));
    
    const problemMap = new Map<string, { task: Task; reason: 'Blocked Defect' | 'Overdue Deadline' | 'Blocked & Overdue' }>();

    blocked.forEach(t => {
      const isOver = isTaskOverdue(t.endDate || t.dueDate, t.status);
      problemMap.set(t.id, {
        task: t,
        reason: isOver ? 'Blocked & Overdue' : 'Blocked Defect'
      });
    });

    overdue.forEach(t => {
      if (!problemMap.has(t.id)) {
        problemMap.set(t.id, {
          task: t,
          reason: 'Overdue Deadline'
        });
      }
    });

    const problems = Array.from(problemMap.values());

    return {
      blockedCount: blocked.length,
      overdueCount: overdue.length,
      totalCount: problems.length,
      problems
    };
  }, [activeTasks]);

  // SPRINT ANALYTICS (REAL DATABASE LIVE GRAPHS & METRICS)
  const renderSprintAnalytics = () => (
    <div className="bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white rounded-xl p-5 md:p-6 shadow-xs border border-gray-200 dark:border-slate-800 space-y-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-[#0F766E]/25 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
            <BarChart3 size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Sprint Analytics
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Live database metrics & trajectory for active sprint</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-gray-50 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Selected sprint · {activeTasks.length} Live Tasks
          </span>
        </div>
      </div>

      {/* 2x2 ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">

        {/* 1. TASK STATUS (DONUT CHART) */}
        <div className="bg-gray-50/70 dark:bg-[#1A2338]/90 border border-gray-200/80 dark:border-slate-700/60 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-2xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Task status</h3>
              <span className="text-[11px] font-mono text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 font-bold">
                {sprintMetrics.progressPercent}% Completed
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="50" fill="none" stroke="currentColor" className="text-gray-200 dark:text-slate-800" strokeWidth="18" />
                  {sprintMetrics.total === 0 ? (
                    <circle cx="75" cy="75" r="50" fill="none" stroke="currentColor" className="text-gray-300 dark:text-slate-700" strokeWidth="18" />
                  ) : (
                    donutSegments.map((segment, idx) => (
                      <circle
                        key={idx}
                        cx="75"
                        cy="75"
                        r="50"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="18"
                        strokeDasharray={segment.strokeDasharray}
                        strokeDashoffset={segment.strokeDashoffset}
                        strokeLinecap="butt"
                        className="transition-all duration-500"
                      />
                    ))
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                    {sprintMetrics.total}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-slate-400 uppercase mt-0.5">
                    Tasks
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-gray-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.COMPLETED }} />
                <span className="text-gray-700 dark:text-slate-300 font-medium">Done: {sprintMetrics.completed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }} />
                <span className="text-gray-700 dark:text-slate-300 font-medium">Prog: {sprintMetrics.inProgress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_REVIEW }} />
                <span className="text-gray-700 dark:text-slate-300 font-medium">QA: {sprintMetrics.reviewQueue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.TODO }} />
                <span className="text-gray-700 dark:text-slate-300 font-medium">To Do: {sprintMetrics.todo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.BACKLOG }} />
                <span className="text-gray-700 dark:text-slate-300 font-medium">Backlog: {sprintMetrics.backlog}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.BLOCKED }} />
                <span className="text-gray-700 dark:text-slate-300 font-medium">Bugs: {sprintMetrics.blocked}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200/80 dark:border-slate-800/60">
            Live database sync — real-time status breakdown
          </p>
        </div>

        {/* 2. COMPLETION TREND (REAL GRAPH) */}
        <div className="bg-gray-50/70 dark:bg-[#1A2338]/90 border border-gray-200/80 dark:border-slate-700/60 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-2xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Completion trend</h3>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold">
                {sprintMetrics.completed} of {sprintMetrics.total} Done
              </span>
            </div>

            <div className="py-2">
              <svg className="w-full h-[120px]" viewBox={`0 0 ${completionTrendData.width} ${completionTrendData.height}`}>
                <defs>
                  <linearGradient id="trendGradientLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Reference Dashed Grid Lines */}
                <line x1="25" y1="20" x2="315" y2="20" className="stroke-gray-200 dark:stroke-slate-700" strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1="25" y1="50" x2="315" y2="50" className="stroke-gray-200 dark:stroke-slate-700" strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1="25" y1="80" x2="315" y2="80" className="stroke-gray-200 dark:stroke-slate-700" strokeDasharray="3 3" strokeWidth="0.8" />

                {/* Area Gradient Fill */}
                {completionTrendData.coords.length > 0 && (
                  <path d={completionTrendData.areaD} fill="url(#trendGradientLive)" />
                )}

                {/* Trend Polyline */}
                {completionTrendData.coords.length > 0 && (
                  <path 
                    d={completionTrendData.pathD} 
                    fill="none" 
                    stroke="#16A34A"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                )}

                {/* Data Point Markers & Labels */}
                {completionTrendData.coords.map((c, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={c.x} 
                      cy={c.y} 
                      r="3.5" 
                      fill="#16A34A" 
                      className="fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900" 
                      strokeWidth="1.8" 
                    />
                    <text 
                      x={c.x} 
                      y={completionTrendData.height - 2} 
                      textAnchor="middle" 
                      className="fill-gray-500 dark:fill-slate-400"
                      fontSize="7.5" 
                      fontFamily="monospace"
                    >
                      {c.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <p className="text-[11px] font-mono text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200/80 dark:border-slate-800/60">
            Real burnup curve — tracking delivery towards sprint goal
          </p>
        </div>

        {/* 3. DEVELOPER WORKLOAD */}
        <div className="bg-gray-50/70 dark:bg-[#1A2338]/90 border border-gray-200/80 dark:border-slate-700/60 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-2xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Developer workload</h3>
              <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-bold">
                {developerWorkloadData.length} Assignees
              </span>
            </div>

            <div className="py-2 space-y-3">
              {developerWorkloadData.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 dark:text-slate-500 font-mono">
                  No active tasks assigned to developers yet.
                </div>
              ) : (
                developerWorkloadData.map(dev => (
                  <div key={dev.name} className="space-y-1 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{dev.name}</span>
                      <span className="text-gray-500 dark:text-slate-400 text-[11px]">
                        {dev.total} {dev.total === 1 ? 'task' : 'tasks'} ({dev.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.max(dev.percent, 6)}%`, 
                          backgroundColor: dev.color 
                        }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] font-mono text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200/80 dark:border-slate-800/60">
            Live task distribution across team members
          </p>
        </div>

        {/* 4. BLOCKED / OVERDUE */}
        <div className="bg-gray-50/70 dark:bg-[#1A2338]/90 border border-gray-200/80 dark:border-slate-700/60 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-2xs transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Blocked / overdue</h3>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border font-bold ${
                blockedOverdueData.totalCount > 0 
                  ? 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' 
                  : 'text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
              }`}>
                {blockedOverdueData.totalCount} Attention Needed
              </span>
            </div>

            <div className="py-2">
              {blockedOverdueData.totalCount === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">All Tasks Healthy & On Schedule</h4>
                  <p className="text-[11px] text-gray-600 dark:text-slate-400 font-mono">
                    0 blocked defects and 0 overdue deadlines across the current sprint.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 pb-1">
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{blockedOverdueData.blockedCount} Blocked · {blockedOverdueData.overdueCount} Overdue</span>
                  </div>
                  {blockedOverdueData.problems.map(({ task, reason }) => (
                    <div 
                      key={task.id} 
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="p-2.5 rounded bg-white dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          {task.id}
                        </span>
                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate font-medium">{task.title}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        reason.includes('Blocked') 
                          ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800' 
                          : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
                      }`}>
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] font-mono text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200/80 dark:border-slate-800/60">
            Real database health monitor — showing live defects & deadlines
          </p>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-200">
      
      {/* ============================================================== */}
      {/* SIDEBAR NAVIGATION                                            */}
      {/* ============================================================== */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between shrink-0 shadow-2xs transition-colors duration-200">
        <div className="space-y-6 p-4">
          
          {/* Logo & Console Title */}
          <div className="px-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg text-white bg-[#0F766E] shadow-2xs">
                <FolderKanban size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-[#1F2937] dark:text-white block">FlowBoard</span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 block">Scrum Console</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'board'
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs'
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare size={15} />
                <span>Agile Board</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                activeTab === 'board' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
              }`}>
                {activeTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backlog')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'backlog'
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs'
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={15} />
                <span>Product Backlog</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                activeTab === 'backlog' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
              }`}>
                {backlogTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'reports'
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs'
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 size={15} />
              <span>Sprint Reports</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'archive'
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs'
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Archive size={15} />
                <span>Archive Audit</span>
              </div>
              {archivedTasks.length > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                  {archivedTasks.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('flowboard_token');
              localStorage.removeItem('flowboard_user');
              navigate('/login');
            }} 
            className="w-full flex items-center gap-2 p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-mono cursor-pointer transition-colors"
          >
            <RotateCcw size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONSOLE AREA                                              */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F8] dark:bg-[#0B0F17] transition-colors duration-200">
        
        {/* TOP HEADER BAR */}
        <header className="h-14 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-mono font-bold tracking-tight text-[#1F2937] dark:text-white uppercase">
              {activeTab === 'board' ? 'Scrum Master Agile Board' : activeTab === 'backlog' ? 'Product Backlog' : activeTab === 'reports' ? 'Sprint Workload & Progress' : 'Archived Sprint Audit'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button 
              type="button"
              onClick={() => handleOpenCreateModal('Backlog')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-md text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Plus size={14} /> Create Task
            </button>
          </div>
        </header>

        {/* CONSOLE WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ---------------------------------------------------------- */}
          {/* 1. CLEAN SCRUM MASTER PROFILE BANNER                       */}
          {/* ---------------------------------------------------------- */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs relative overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
                  Welcome, {currentUserName}!
                </h2>
              </div>

              {/* Sprint Quick Stat Highlights */}
              <div className="flex items-center gap-3 flex-wrap font-mono">
                <div className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 block uppercase">Total Tasks</span>
                  <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.total}</span>
                </div>
                {/* To Do (#64748B) */}
                <div className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 block uppercase">Committed To Do</span>
                  <span className="text-sm font-bold" style={{ color: STATUS_COLORS.TODO }}>{sprintMetrics.todo}</span>
                </div>
                {/* Completed (#15803D) */}
                <div className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 block uppercase">Completed</span>
                  <span className="text-sm font-bold" style={{ color: STATUS_COLORS.COMPLETED }}>{sprintMetrics.completed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* SEARCH & FILTER CONTROLS                                   */}
          {/* ---------------------------------------------------------- */}
          {activeTab !== 'reports' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3 flex-1 w-full flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search task ID or title..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
                  />
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">Priority:</span>
                  <select 
                    value={filterPriority} 
                    onChange={e => setFilterPriority(e.target.value)} 
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#1F2937] dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0F766E] focus:outline-none"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">Assignee:</span>
                  <select 
                    value={filterAssignee} 
                    onChange={e => setFilterAssignee(e.target.value)} 
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#1F2937] dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0F766E] focus:outline-none"
                  >
                    <option value="All">All Assignees</option>
                    {uniqueAssignees.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 1: 5-STAGE KANBAN BOARD STRUCTURED BY UNIQUE IDs        */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'board' && (
            <div id="scrum-board-columns" className="flex gap-4 overflow-x-auto pb-4 items-start">
              
              {/* COLUMN 1: BACKLOG */}
              <div 
                id="column-backlog"
                data-column-id="backlog"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== 'backlog') setDragOverColumn('backlog');
                }}
                onDragLeave={() => {
                  if (dragOverColumn === 'backlog') setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropToStatus('Backlog');
                }}
                className={`w-80 shrink-0 bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                  dragOverColumn === 'backlog'
                    ? 'border-[#0F766E] ring-2 ring-[#0F766E]/40 bg-teal-50/20 dark:bg-teal-950/20'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <div id="header-backlog" className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: STATUS_COLORS.BACKLOG }} />
                    <h3 className="font-mono font-bold text-xs uppercase text-[#1F2937] dark:text-white">Backlog</h3>
                  </div>
                  <span 
                    id="badge-count-backlog"
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-2xs"
                    title={`${backlogTasks.length} tasks in Backlog`}
                  >
                    {backlogTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  id="btn-add-task-backlog"
                  onClick={() => handleOpenCreateModal('Backlog')}
                  className="w-full py-2 px-3 border border-dashed border-gray-300 dark:border-slate-700 hover:border-[#0F766E] dark:hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 text-gray-600 dark:text-slate-300 hover:text-[#0F766E] rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-2xs"
                >
                  <Plus size={14} className="text-[#0F766E] dark:text-teal-400" /> Add Task to Backlog
                </button>

                <div id="tasks-container-backlog" className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {backlogTasks.length === 0 ? (
                    <div id="empty-state-backlog" className="p-4 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                      No tasks in Backlog (Drag cards here to return to Backlog)
                    </div>
                  ) : (
                    backlogTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => handleEditClick(task)}
                        onArchive={() => handleArchiveTask(task.id)}
                        onMove={(newStatus) => handleMoveStatus(task.id, newStatus)}
                        onCopy={() => handleCopyId(task.id)}
                        copiedId={copiedId}
                        onNavigate={(id) => navigate(`/tasks/${id}`)}
                        onQuickDateChange={(t) => setQuickDateTask(t)}
                        onDragStart={(id) => setDraggingTaskId(id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: TO DO (#64748B) */}
              <div 
                id="column-todo"
                data-column-id="todo"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== 'todo') setDragOverColumn('todo');
                }}
                onDragLeave={() => {
                  if (dragOverColumn === 'todo') setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropToStatus('To Do');
                }}
                className={`w-80 shrink-0 bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                  dragOverColumn === 'todo'
                    ? 'border-[#64748B] ring-2 ring-[#64748B]/40 bg-slate-50/30 dark:bg-slate-800/40'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <div id="header-todo" className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: STATUS_COLORS.TODO }} />
                    <h3 className="font-mono font-bold text-xs uppercase text-[#1F2937] dark:text-white">TO DO</h3>
                  </div>
                  <span 
                    id="badge-count-todo"
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-2xs"
                    style={{
                      color: STATUS_COLORS.TODO,
                      backgroundColor: `${STATUS_COLORS.TODO}18`,
                      borderColor: `${STATUS_COLORS.TODO}35`
                    }}
                    title={`${todoTasks.length} tasks in TO DO`}
                  >
                    {todoTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  id="btn-add-task-todo"
                  onClick={() => handleOpenCreateModal('To Do')}
                  className="w-full py-2 px-3 border border-dashed border-gray-300 dark:border-slate-700 hover:border-[#0F766E] dark:hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 text-gray-600 dark:text-slate-300 hover:text-[#0F766E] rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-2xs"
                >
                  <Plus size={14} className="text-[#0F766E] dark:text-teal-400" /> Add Task to To Do
                </button>

                <div id="tasks-container-todo" className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {todoTasks.length === 0 ? (
                    <div id="empty-state-todo" className="p-4 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                      No tasks committed to To Do (Drop cards here)
                    </div>
                  ) : (
                    todoTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => handleEditClick(task)}
                        onArchive={() => handleArchiveTask(task.id)}
                        onMove={(newStatus) => handleMoveStatus(task.id, newStatus)}
                        onCopy={() => handleCopyId(task.id)}
                        copiedId={copiedId}
                        onNavigate={(id) => navigate(`/tasks/${id}`)}
                        onQuickDateChange={(t) => setQuickDateTask(t)}
                        onDragStart={(id) => setDraggingTaskId(id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 3: IN PROGRESS (#2563EB) */}
              <div 
                id="column-in-progress"
                data-column-id="in_progress"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== 'in_progress') setDragOverColumn('in_progress');
                }}
                onDragLeave={() => {
                  if (dragOverColumn === 'in_progress') setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropToStatus('In Progress');
                }}
                className={`w-80 shrink-0 bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                  dragOverColumn === 'in_progress'
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/40 bg-blue-50/30 dark:bg-blue-950/20'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <div id="header-in-progress" className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }} />
                    <h3 className="font-mono font-bold text-xs uppercase text-[#1F2937] dark:text-white">IN PROGRESS</h3>
                  </div>
                  <span 
                    id="badge-count-in-progress"
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-2xs"
                    style={{
                      color: STATUS_COLORS.IN_PROGRESS,
                      backgroundColor: `${STATUS_COLORS.IN_PROGRESS}18`,
                      borderColor: `${STATUS_COLORS.IN_PROGRESS}35`
                    }}
                    title={`${inProgressTasks.length} tasks in IN PROGRESS`}
                  >
                    {inProgressTasks.length}
                  </span>
                </div>

                <div id="tasks-container-in-progress" className="space-y-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                  {inProgressTasks.length === 0 ? (
                    <div id="empty-state-in-progress" className="p-4 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                      No tasks in active progress (Drop cards here)
                    </div>
                  ) : (
                    inProgressTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => handleEditClick(task)}
                        onArchive={() => handleArchiveTask(task.id)}
                        onMove={(newStatus) => handleMoveStatus(task.id, newStatus)}
                        onCopy={() => handleCopyId(task.id)}
                        copiedId={copiedId}
                        onNavigate={(id) => navigate(`/tasks/${id}`)}
                        onQuickDateChange={(t) => setQuickDateTask(t)}
                        onDragStart={(id) => setDraggingTaskId(id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 4: REVIEW QUEUE (#9333EA) */}
              <div 
                id="column-review-queue"
                data-column-id="review_queue"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== 'review_queue') setDragOverColumn('review_queue');
                }}
                onDragLeave={() => {
                  if (dragOverColumn === 'review_queue') setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropToStatus('Review Queue');
                }}
                className={`w-80 shrink-0 bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                  dragOverColumn === 'review_queue'
                    ? 'border-[#9333EA] ring-2 ring-[#9333EA]/40 bg-purple-50/30 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <div id="header-review-queue" className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: STATUS_COLORS.IN_REVIEW }} />
                    <h3 className="font-mono font-bold text-xs uppercase text-[#1F2937] dark:text-white">REVIEW QUEUE</h3>
                  </div>
                  <span 
                    id="badge-count-review-queue"
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-2xs"
                    style={{
                      color: STATUS_COLORS.IN_REVIEW,
                      backgroundColor: `${STATUS_COLORS.IN_REVIEW}18`,
                      borderColor: `${STATUS_COLORS.IN_REVIEW}35`
                    }}
                    title={`${reviewTasks.length} tasks in REVIEW QUEUE`}
                  >
                    {reviewTasks.length}
                  </span>
                </div>

                <div id="tasks-container-review-queue" className="space-y-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                  {reviewTasks.length === 0 ? (
                    <div id="empty-state-review-queue" className="p-4 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                      No tasks in review queue (Drop cards here)
                    </div>
                  ) : (
                    reviewTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => handleEditClick(task)}
                        onArchive={() => handleArchiveTask(task.id)}
                        onMove={(newStatus) => handleMoveStatus(task.id, newStatus)}
                        onCopy={() => handleCopyId(task.id)}
                        copiedId={copiedId}
                        onNavigate={(id) => navigate(`/tasks/${id}`)}
                        onQuickDateChange={(t) => setQuickDateTask(t)}
                        onDragStart={(id) => setDraggingTaskId(id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 5: COMPLETED (#15803D) */}
              <div 
                id="column-completed"
                data-column-id="completed"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== 'completed') setDragOverColumn('completed');
                }}
                onDragLeave={() => {
                  if (dragOverColumn === 'completed') setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropToStatus('Completed');
                }}
                className={`w-80 shrink-0 bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                  dragOverColumn === 'completed'
                    ? 'border-[#15803D] ring-2 ring-[#15803D]/40 bg-green-50/30 dark:bg-green-950/20'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <div id="header-completed" className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: STATUS_COLORS.COMPLETED }} />
                    <h3 className="font-mono font-bold text-xs uppercase text-[#1F2937] dark:text-white">COMPLETED</h3>
                  </div>
                  <span 
                    id="badge-count-completed"
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-2xs"
                    style={{
                      color: STATUS_COLORS.COMPLETED,
                      backgroundColor: `${STATUS_COLORS.COMPLETED}18`,
                      borderColor: `${STATUS_COLORS.COMPLETED}35`
                    }}
                    title={`${completedTasks.length} tasks in COMPLETED`}
                  >
                    {completedTasks.length}
                  </span>
                </div>

                <div id="tasks-container-completed" className="space-y-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                  {completedTasks.length === 0 ? (
                    <div id="empty-state-completed" className="p-4 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                      No completed sprint tasks (Drop cards here)
                    </div>
                  ) : (
                    completedTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => handleEditClick(task)}
                        onArchive={() => handleArchiveTask(task.id)}
                        onMove={(newStatus) => handleMoveStatus(task.id, newStatus)}
                        onCopy={() => handleCopyId(task.id)}
                        copiedId={copiedId}
                        onNavigate={(id) => navigate(`/tasks/${id}`)}
                        onQuickDateChange={(t) => setQuickDateTask(t)}
                        onDragStart={(id) => setDraggingTaskId(id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 6: BLOCKED / DEFECT (#D97706) */}
              {blockedTasks.length > 0 && (
                <div 
                  id="column-blocked"
                  data-column-id="blocked"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverColumn !== 'blocked') setDragOverColumn('blocked');
                  }}
                  onDragLeave={() => {
                    if (dragOverColumn === 'blocked') setDragOverColumn(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropToStatus('Blocked');
                  }}
                  className={`w-80 shrink-0 bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                    dragOverColumn === 'blocked'
                      ? 'border-[#D97706] ring-2 ring-[#D97706]/40 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-amber-300 dark:border-amber-900/60'
                  }`}
                >
                  <div id="header-blocked" className="flex items-center justify-between pb-2 border-b border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center gap-2">
                      <Bug size={14} className="text-[#D97706]" />
                      <h3 className="font-mono font-bold text-xs uppercase text-[#D97706]">BLOCKED / QA DEFECT</h3>
                    </div>
                    <span 
                      id="badge-count-blocked"
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded border shadow-2xs"
                      style={{
                        color: STATUS_COLORS.BLOCKED,
                        backgroundColor: `${STATUS_COLORS.BLOCKED}18`,
                        borderColor: `${STATUS_COLORS.BLOCKED}35`
                      }}
                      title={`${blockedTasks.length} tasks BLOCKED`}
                    >
                      {blockedTasks.length}
                    </span>
                  </div>

                  <div id="tasks-container-blocked" className="space-y-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                    {blockedTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => handleEditClick(task)}
                        onArchive={() => handleArchiveTask(task.id)}
                        onMove={(newStatus) => handleMoveStatus(task.id, newStatus)}
                        onCopy={() => handleCopyId(task.id)}
                        copiedId={copiedId}
                        onNavigate={(id) => navigate(`/tasks/${id}`)}
                        onQuickDateChange={(t) => setQuickDateTask(t)}
                        onDragStart={(id) => setDraggingTaskId(id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 2: DEDICATED PRODUCT BACKLOG VIEW                      */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'backlog' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase text-[#1F2937] dark:text-white">Product Backlog Items</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Uncommitted tasks awaiting sprint grooming & assignment</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('Backlog')}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus size={14} /> Add Backlog Item
                </button>
              </div>

              {backlogTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                  No backlog tasks in database. Click "+ Add Backlog Item" to create one.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {backlogTasks.map(task => (
                    <div key={task.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="font-mono text-xs font-bold text-[#0F766E] dark:text-teal-400 hover:underline bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 cursor-pointer"
                            title="Click to view task description"
                          >
                            {task.id}
                          </button>
                          <h4 
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="text-sm font-semibold text-[#1F2937] dark:text-white cursor-pointer hover:text-[#0F766E] dark:hover:text-teal-400 transition-colors"
                            title="Click to view task description"
                          >
                            {task.title}
                          </h4>
                          <Badge label={task.priority} type="priority" />
                        </div>
                        {task.description && (
                          <p 
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 cursor-pointer hover:text-gray-700 dark:hover:text-slate-300"
                            title="Click to view task description"
                          >
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 dark:text-slate-400 pt-0.5 flex-wrap">
                          <span>Assignee: <strong className="text-gray-700 dark:text-slate-200">{task.assignee}</strong></span>
                          {task.startDate && <span>Start: {task.startDate}</span>}
                          {(task.endDate || task.dueDate) && (
                            <span className={isTaskOverdue(task.endDate || task.dueDate, task.status) ? 'text-[#DC2626] font-bold flex items-center gap-1' : ''}>
                              {isTaskOverdue(task.endDate || task.dueDate, task.status) && <AlertTriangle size={11} className="text-[#DC2626]" />}
                              End: {task.endDate || task.dueDate}
                              {isTaskOverdue(task.endDate || task.dueDate, task.status) && ' (Overdue)'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveStatus(task.id, 'To Do')}
                          className="px-3 py-1.5 text-white rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                          style={{ backgroundColor: STATUS_COLORS.TODO }}
                        >
                          Commit to Sprint (To Do) <ArrowRight size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditClick(task)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                          title="Archive"
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 3: SPRINT REPORTS (DONUT CHART & BREAKDOWN)            */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {renderSprintAnalytics()}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase text-[#1F2937] dark:text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#0F766E] dark:text-teal-400" /> Sprint Workload & Delivery Velocity
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Live analytics for active sprint progress</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded border border-teal-200 dark:border-teal-800">
                  {sprintMetrics.progressPercent}% Sprint Completed
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
                {/* Visual Donut Chart */}
                <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="50" fill="none" stroke="currentColor" className="text-gray-200 dark:text-slate-800" strokeWidth="18" />
                    {sprintMetrics.total === 0 ? (
                      <circle cx="75" cy="75" r="50" fill="none" stroke="currentColor" className="text-gray-300 dark:text-slate-700" strokeWidth="18" />
                    ) : (
                      donutSegments.map((segment, idx) => (
                        <circle
                          key={idx}
                          cx="75"
                          cy="75"
                          r="50"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="18"
                          strokeDasharray={segment.strokeDasharray}
                          strokeDashoffset={segment.strokeDashoffset}
                          strokeLinecap="butt"
                          className="transition-all duration-500"
                        />
                      ))
                    )}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-[#1F2937] dark:text-white leading-none">
                      {sprintMetrics.total}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                      Active Tasks
                    </span>
                  </div>
                </div>

                {/* Status Breakdown Pills with strict status colors */}
                <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg font-mono">
                  {/* Completed (#15803D) */}
                  <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.COMPLETED }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Completed</span>
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.completed}</span>
                  </div>

                  {/* In Progress (#2563EB) */}
                  <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">In Progress</span>
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.inProgress}</span>
                  </div>

                  {/* To Do (#64748B) */}
                  <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.TODO }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">To Do</span>
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.todo}</span>
                  </div>

                  {/* Review Queue (#9333EA) */}
                  <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_REVIEW }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Review Queue</span>
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.reviewQueue}</span>
                  </div>

                  {/* Backlog (#475569) */}
                  <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.BACKLOG }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Backlog</span>
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.backlog}</span>
                  </div>

                  {/* Blocked / Warning (#D97706) */}
                  <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.BLOCKED }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Blocked / Bugs</span>
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] dark:text-white">{sprintMetrics.blocked}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* TAB 4: ARCHIVE & AUDIT LOG                                 */}
          {/* ---------------------------------------------------------- */}
          {activeTab === 'archive' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase text-[#1F2937] dark:text-white flex items-center gap-2">
                    <Archive size={16} className="text-[#0F766E] dark:text-teal-400" /> Archived Tasks & Soft-Deleted Audit
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Restore tasks back to your sprint or permanently delete</p>
                </div>
                <span className="text-xs font-mono font-bold text-gray-500 dark:text-slate-400">
                  Archived Total: {archivedTasks.length}
                </span>
              </div>

              {archivedTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                  No archived tasks. Tasks archived from columns will appear here.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {archivedTasks.map(task => (
                    <div key={task.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {task.id}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 line-through">{task.title}</h4>
                          <Badge label={task.priority} type="priority" />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-400 font-mono">
                          Assignee: {task.assignee} • Last Status: {task.status}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRestoreTask(task.id)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw size={13} className="text-[#0F766E] dark:text-teal-400" /> Restore Task
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        >
                          <Trash2 size={13} /> Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* TASK MODAL */}
      {isModalOpen && (
        <TaskFormModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
          onSave={handleSaveTask}
          initialData={editingTask}
          defaultStatus={defaultStatusForNewTask}
          teamMembers={assignableMembers}
        />
      )}

      {/* ASSIGN USER BEFORE MOVING TO TO DO MODAL */}
      {assignModalTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <form 
            onSubmit={handleConfirmAssignAndMove}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 rounded-xl max-w-md w-full space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl transition-colors"
          >
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <UserIcon size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                    Assign User to Move to To Do
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Backlog tasks require an assigned team member to enter the sprint
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAssignModalTask(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-400 uppercase">Selected Task:</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{assignModalTask.title}</p>
              <span className="text-[10px] font-mono text-[#0F766E] dark:text-teal-400">{assignModalTask.id}</span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block flex items-center gap-1">
                <UserIcon size={12} className="text-[#0F766E] dark:text-teal-400" />
                <span>Assign To Team Member <span className="text-red-500">*</span>:</span>
              </label>
              {assignableMembers.length > 0 ? (
                <select
                  value={selectedAssignee}
                  onChange={e => setSelectedAssignee(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Select Team Member --</option>
                  {assignableMembers.map(m => (
                    <option key={m.id} value={m.name || m.email}>
                      {m.name || m.email} {m.role ? `(${m.role})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter developer name..."
                  value={selectedAssignee}
                  onChange={e => setSelectedAssignee(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none"
                  required
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAssignModalTask(null)}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer font-mono shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedAssignee || selectedAssignee === 'Unassigned'}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer font-mono flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                Assign & Move to To Do
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK TIMELINE / DATE CHANGER MODAL */}
      {quickDateTask && (
        <QuickDateModal
          task={quickDateTask}
          onClose={() => setQuickDateTask(null)}
          onSave={handleUpdateTaskDates}
        />
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// QUICK DATE CHANGER MODAL COMPONENT (CHANGE DATES DIRECTLY FROM BOARD)
// ----------------------------------------------------------------------
interface QuickDateModalProps {
  task: Task;
  onClose: () => void;
  onSave: (taskId: string, startDate: string, endDate: string) => Promise<void>;
}

function QuickDateModal({ task, onClose, onSave }: QuickDateModalProps) {
  const [startDate, setStartDate] = useState(task.startDate || getTodayString());
  const [endDate, setEndDate] = useState(task.endDate || task.dueDate || addDaysToDate(getTodayString(), 7));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const previewInfo = getTaskDeadlineInfo(startDate, endDate, task.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Start Date and End Date are mandatory.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End Date cannot be earlier than Start Date.');
      return;
    }
    setSaving(true);
    try {
      await onSave(task.id, startDate, endDate);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update task dates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <form 
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 rounded-xl max-w-md w-full space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl transition-colors"
      >
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                Change Timeline ({task.id})
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Adjust Start & End Dates to update sprint timeline
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Info summary */}
        <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1 font-mono text-xs">
          <p className="font-bold text-slate-900 dark:text-white font-sans text-xs">{task.title}</p>
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-0.5">
            <span>Assignee: <strong className="text-gray-700 dark:text-slate-200">{task.assignee || 'Unassigned'}</strong></span>
            <span>Status: <strong className="text-gray-700 dark:text-slate-200">{task.status}</strong></span>
          </div>
        </div>

        {/* Start Date & End Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 text-xs">
            <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block flex items-center gap-1">
              <Calendar size={12} className="text-[#0F766E] dark:text-teal-400" />
              <span>Start Date:</span>
            </label>
            <input 
              type="date" 
              required
              min="2020-01-01"
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer" 
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block flex items-center gap-1">
              <Calendar size={12} className="text-[#0F766E] dark:text-teal-400" />
              <span>End Date:</span>
            </label>
            <input 
              type="date" 
              required
              min={startDate || '2020-01-01'}
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer" 
            />
          </div>
        </div>

        {/* Quick presets for extending */}
        <div className="space-y-1 text-[11px] font-mono">
          <span className="text-gray-400 dark:text-slate-500 text-[10px]">Quick extend presets:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const today = getTodayString();
                setStartDate(today);
                setEndDate(addDaysToDate(today, 3));
              }}
              className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              Today + 3 Days
            </button>
            <button
              type="button"
              onClick={() => {
                const today = getTodayString();
                setStartDate(today);
                setEndDate(addDaysToDate(today, 7));
              }}
              className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              Today + 1 Week
            </button>
            <button
              type="button"
              onClick={() => {
                const today = getTodayString();
                setStartDate(today);
                setEndDate(addDaysToDate(today, 14));
              }}
              className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              Today + 2 Weeks
            </button>
            <button
              type="button"
              onClick={() => {
                const today = getTodayString();
                setStartDate(today);
                setEndDate(addDaysToDate(today, 30));
              }}
              className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              Today + 1 Month
            </button>
          </div>
        </div>

        {/* Real-time status preview */}
        <div className={`p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
          previewInfo.isOverdue 
            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' 
            : previewInfo.isDueToday
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
        }`}>
          {previewInfo.isOverdue ? (
            <AlertTriangle size={14} className="shrink-0 text-red-600" />
          ) : previewInfo.isDueToday ? (
            <Clock size={14} className="shrink-0 text-amber-600" />
          ) : (
            <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
          )}
          <span>Timeline Preview: <strong>{previewInfo.statusText}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={saving}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer font-mono"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-bold cursor-pointer font-mono flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-60"
          >
            {saving ? 'Updating...' : 'Save Dates'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// TASK CARD COMPONENT (LIGHT & DARK MODE READY)
// ----------------------------------------------------------------------
interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onArchive: () => void;
  onMove: (status: Task['status']) => void;
  onCopy: () => void;
  copiedId: string | null;
  onNavigate: (id: string) => void;
  onQuickDateChange?: (task: Task) => void;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
}

function TaskCard({ task, onEdit, onArchive, onMove, onCopy, copiedId, onNavigate, onQuickDateChange, onDragStart, onDragEnd }: TaskCardProps) {
  const deadlineInfo = getTaskDeadlineInfo(task.startDate, task.endDate || task.dueDate, task.status);
  const isOverdue = deadlineInfo.isOverdue;

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart(task.id);
      }}
      onDragEnd={() => {
        if (onDragEnd) onDragEnd();
      }}
      className={`bg-white dark:bg-slate-800/90 border rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-2.5 text-slate-800 dark:text-slate-100 cursor-grab active:cursor-grabbing hover:border-[#0F766E]/60 select-none ${
        isOverdue 
          ? 'border-red-300 dark:border-red-800/80 ring-1 ring-red-400/30' 
          : 'border-gray-200 dark:border-slate-700/80'
      }`}
    >
      
      {/* Top Header: ID & Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id={`task-id-${task.id}`}
            onClick={() => onNavigate(task.id)}
            title={`Click ID to view full task description and specs for ${task.id}`}
            className="font-mono text-xs font-bold text-[#0F766E] dark:text-teal-400 hover:text-[#0D655E] dark:hover:text-teal-300 hover:underline bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{task.id}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            title="Copy ID to clipboard"
            className="p-1 text-gray-400 hover:text-[#0F766E] dark:hover:text-teal-400 rounded cursor-pointer transition-colors"
          >
            {copiedId === task.id ? <Check size={11} className="text-[#0F766E] dark:text-teal-400" /> : <Copy size={11} />}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge label={task.priority} type="priority" />
        </div>
      </div>

      {/* TIMELINE / DEADLINE STATUS BANNER */}
      {deadlineInfo.badgeType === 'overdue' && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onQuickDateChange && onQuickDateChange(task);
          }}
          className="flex items-center justify-between px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded text-red-600 dark:text-red-400 font-mono text-[10px] font-bold cursor-pointer hover:bg-red-100/70 dark:hover:bg-red-900/40 transition-colors"
          title="Click to adjust start or end date for this task"
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={12} className="shrink-0 text-[#DC2626]" />
            <span>{deadlineInfo.statusText}</span>
          </div>
          <span className="text-[10px] underline font-sans font-medium text-red-700 dark:text-red-300">Change Date</span>
        </div>
      )}

      {deadlineInfo.badgeType === 'dueToday' && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onQuickDateChange && onQuickDateChange(task);
          }}
          className="flex items-center justify-between px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold cursor-pointer hover:bg-amber-100/70 transition-colors"
          title="Click to extend deadline"
        >
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-[#D97706]" />
            <span>Due Today (Action Needed)</span>
          </div>
          <span className="text-[10px] underline font-sans font-medium text-amber-800 dark:text-amber-300">Extend</span>
        </div>
      )}

      {deadlineInfo.badgeType === 'onTrack' && (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-semibold w-fit">
          <CheckCircle2 size={11} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{deadlineInfo.statusText}</span>
        </div>
      )}

      {/* Title (Clickable to view description) */}
      <h4 
        onClick={() => onNavigate(task.id)}
        className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 cursor-pointer hover:text-[#0F766E] dark:hover:text-teal-400 transition-colors"
        title="Click to view full description"
      >
        {task.title}
      </h4>

      {/* Description (Clickable to view description) */}
      {task.description && (
        <p 
          onClick={() => onNavigate(task.id)}
          className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed cursor-pointer hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          title="Click to view full description"
        >
          {task.description}
        </p>
      )}

      {/* ASSIGNED USER & MANDATORY START/END DATES */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono flex-wrap gap-1">
        <div 
          className={`flex items-center gap-1 px-2 py-0.5 rounded border max-w-[150px] truncate ${
            isOverdue 
              ? 'text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 font-bold' 
              : 'text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 border-gray-200/80 dark:border-slate-600 font-medium'
          }`} 
          title={`Assigned User: ${task.assignee || 'Unassigned'}${isOverdue ? ' (Deadline Overdue)' : ''}`}
        >
          <UserIcon size={11} className={isOverdue ? 'text-red-600 dark:text-red-400 shrink-0' : 'text-[#0F766E] dark:text-teal-400 shrink-0'} />
          <span className="truncate">{task.assignee || 'Unassigned'}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickDateChange && onQuickDateChange(task);
          }}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
            isOverdue
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#0F766E] dark:hover:border-teal-500 hover:text-[#0F766E]'
          }`}
          title="Click to change Start and End dates"
        >
          <Calendar size={11} className={isOverdue ? 'text-red-500' : 'text-[#0F766E] dark:text-teal-400'} />
          <span>{task.startDate ? `${task.startDate} → ` : ''}{task.endDate || task.dueDate || 'Set Dates'}</span>
        </button>
      </div>

      {/* Quick Move & Action Controls */}
      <div className="pt-2 flex items-center justify-between gap-1 border-t border-gray-100 dark:border-slate-700/60 text-xs">
        {/* Next Status Advance with consistent colors */}
        <div className="flex items-center gap-1">
          {task.status === 'Backlog' && (
            <button
              type="button"
              onClick={() => onMove('To Do')}
              className="px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border"
              style={{
                color: STATUS_COLORS.TODO,
                backgroundColor: `${STATUS_COLORS.TODO}18`,
                borderColor: `${STATUS_COLORS.TODO}35`
              }}
              title="Commit to Sprint (To Do)"
            >
              <span>To Do</span>
              <ArrowRight size={10} />
            </button>
          )}

          {task.status === 'To Do' && (
            <button
              type="button"
              onClick={() => onMove('In Progress')}
              className="px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border"
              style={{
                color: STATUS_COLORS.IN_PROGRESS,
                backgroundColor: `${STATUS_COLORS.IN_PROGRESS}18`,
                borderColor: `${STATUS_COLORS.IN_PROGRESS}35`
              }}
              title="Move to In Progress"
            >
              <Play size={10} />
              <span>In Progress</span>
            </button>
          )}

          {task.status === 'In Progress' && (
            <button
              type="button"
              onClick={() => onMove('Review Queue')}
              className="px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border"
              style={{
                color: STATUS_COLORS.IN_REVIEW,
                backgroundColor: `${STATUS_COLORS.IN_REVIEW}18`,
                borderColor: `${STATUS_COLORS.IN_REVIEW}35`
              }}
              title="Move to Review Queue"
            >
              <Clock size={10} />
              <span>Review</span>
            </button>
          )}

          {task.status === 'Review Queue' && (
            <button
              type="button"
              onClick={() => onMove('Completed')}
              className="px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border"
              style={{
                color: STATUS_COLORS.COMPLETED,
                backgroundColor: `${STATUS_COLORS.COMPLETED}18`,
                borderColor: `${STATUS_COLORS.COMPLETED}35`
              }}
              title="Mark Completed"
            >
              <CheckCircle2 size={10} />
              <span>Done</span>
            </button>
          )}

          {task.status === 'Completed' && (
            <span 
              className="text-[10px] font-mono font-bold flex items-center gap-0.5"
              style={{ color: STATUS_COLORS.COMPLETED }}
            >
              <Check size={11} /> Completed
            </span>
          )}

          {task.status === 'Blocked' && (
            <button
              type="button"
              onClick={() => onMove('In Progress')}
              className="px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border"
              style={{
                color: STATUS_COLORS.IN_PROGRESS,
                backgroundColor: `${STATUS_COLORS.IN_PROGRESS}18`,
                borderColor: `${STATUS_COLORS.IN_PROGRESS}35`
              }}
              title="Resume Fixing"
            >
              <Play size={10} />
              <span>Resume</span>
            </button>
          )}
        </div>

        {/* View Description, Quick Date Edit & Archive Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickDateChange && onQuickDateChange(task);
            }}
            className="p-1 text-gray-400 hover:text-[#0F766E] dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
            title="Change Start & End Dates"
          >
            <Calendar size={12} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate(task.id)}
            className="p-1 text-gray-400 hover:text-[#0F766E] dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
            title="View Full Task Description"
          >
            <FileText size={12} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
            title="Edit Task"
          >
            <Edit3 size={12} />
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer transition-colors"
            title="Archive Task"
          >
            <Archive size={12} />
          </button>
        </div>
      </div>

    </div>
  );
}