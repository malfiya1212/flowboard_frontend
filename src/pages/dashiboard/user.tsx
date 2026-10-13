import { useState, useMemo, useEffect } from 'react';
import { 
  CheckSquare, LogOut, Search, Filter, XCircle, User as UserIcon, 
  BarChart3, Bug, Play, FlaskConical, Code2, CheckCircle,
  Calendar, AlertTriangle, Clock, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Board, { validateRoleTransition, getColumnIdFromStatus } from '../../componets/agile/board';
import TaskModal from '../tasks/taskmodel';
import UserProfile from './userprofile';
import Badge from '../../componets/commen/Badge';
import ThemeToggle from '../../componets/commen/ThemeToggle';
import { usePermissions } from '../../context/permision';
import { STATUS_COLORS, getStatusColor } from '../../utils/statusColors';
import { getTaskDeadlineInfo } from '../../utils/dateUtils';
import api from '../../service/api';

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
  branchName?: string;
  rejectedByTester?: boolean;
  rejectionReason?: string;
  rejectionDate?: string;
  testedBy?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { setRole: setContextRole } = usePermissions();
  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('flowboard_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const [userData, setUserData] = useState<any>(storedUser || null);
  const rawRole = (userData?.role || storedUser?.role || localStorage.getItem('user_role') || 'Developer');
  const isTester = rawRole.toLowerCase().includes('test');
  const activeRole: 'Developer' | 'Tester' = isTester ? 'Tester' : 'Developer';

  const [activeTab, setActiveTab] = useState<'workspace' | 'board' | 'profile'>('workspace');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rejectingTask, setRejectingTask] = useState<Task | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        if (response.data) {
          setUserData(response.data);
          localStorage.setItem('flowboard_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('Could not fetch remote profile, using session record:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userName = userData?.name || storedUser?.name || '';
        const userEmail = userData?.email || storedUser?.email || '';
        // If developer, request user-scoped tasks from API
        const url = (!isTester && (userName || userEmail))
          ? `/user/tasks?scope=mine&assignee=${encodeURIComponent(userName || userEmail)}`
          : '/user/tasks';

        const response = await api.get(url);
        if (response.data && Array.isArray(response.data)) {
          const mappedTasks: Task[] = response.data.map((item: any) => ({
            id: String(item.id).startsWith('FB-') ? String(item.id) : `FB-${item.id}`,
            title: item.title || 'Untitled Task',
            description: item.description || '',
            priority: (item.priority || 'Medium') as Task['priority'],
            status: (['review', 'in review', 'review queue'].includes((item.status || '').toLowerCase().trim()) 
              ? 'Review Queue' 
              : (item.status || 'To Do')) as Task['status'],
            assignee: item.assignee || 'Unassigned',
            startDate: item.start_date || item.startDate || '',
            endDate: item.end_date || item.endDate || item.due_date || item.dueDate || '',
            dueDate: item.end_date || item.endDate || item.due_date || item.dueDate || '',
            branchName: item.branchName || `feat/FB-${item.id}`,
            rejectedByTester: item.status === 'Blocked' || Boolean(item.rejectedByTester || item.block_reason),
            rejectionReason: item.block_reason || item.blockReason || item.rejectionReason,
            rejectionDate: item.rejectionDate || (item.status === 'Blocked' ? 'Recent' : undefined),
            testedBy: item.tested_by || item.testedBy || 'QA Tester'
          }));
          setTasks(mappedTasks);
        }
      } catch (err) {
        console.warn('Could not fetch tasks from server:', err);
      }
    };
    fetchTasks();
  }, [userData, isTester, storedUser]);

  useEffect(() => {
    setContextRole(activeRole);
  }, [activeRole, setContextRole]);

  const updateTaskStatus = async (id: string, newStatus: Task['status']) => {
    const existingTask = tasks.find(t => t.id === id);
    if (existingTask) {
      const sourceColId = getColumnIdFromStatus(existingTask.status);
      const targetColId = getColumnIdFromStatus(newStatus);
      const check = validateRoleTransition(sourceColId, targetColId, activeRole);
      if (!check.allowed) {
        console.warn(`[Blocked unauthorized transition for ${activeRole}]: ${check.reason}`);
        return;
      }
    }

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated: Task = { ...t, status: newStatus };
        if (newStatus === 'In Progress' && t.rejectedByTester) {
          updated.rejectedByTester = false;
        }
        if (newStatus === 'Completed') {
          updated.testedBy = userData?.name || 'QA Tester';
        }
        return updated;
      }
      return t;
    }));

    const rawId = id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}`, { 
        status: newStatus,
        block_reason: newStatus === 'In Progress' ? '' : undefined,
        tested_by: newStatus === 'Completed' ? (userData?.name || 'QA Tester') : undefined
      });
    } catch (err) {
      console.error('Failed to update task in database:', err);
    }
  };

  const handleUpdateTaskModal = async (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    const rawId = updated.id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}`, {
        status: updated.status,
        block_reason: updated.rejectionReason,
        reviewNotes: updated.rejectionReason
      });
    } catch (err) {
      console.error('Failed to update task modal in database:', err);
    }
  };

  const handleTesterPass = async (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { 
      ...t, 
      status: 'Completed', 
      rejectedByTester: false,
      rejectionReason: undefined,
      testedBy: userData?.name || 'QA Tester'
    } : t));

    const rawId = task.id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}`, {
        status: 'Completed',
        block_reason: '',
        tested_by: userData?.name || 'QA Tester'
      });
    } catch (err) {
      console.error('Failed to save tester pass in database:', err);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectingTask) return;
    const reasonText = rejectionNotes.trim() || 'QA Failed: Task does not meet acceptance criteria.';

    setTasks(prev => prev.map(t => t.id === rejectingTask.id ? {
      ...t,
      status: 'Blocked',
      rejectedByTester: true,
      rejectionReason: reasonText,
      rejectionDate: 'Just now',
      testedBy: userData?.name || 'QA Tester'
    } : t));

    const rawId = rejectingTask.id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}`, {
        status: 'Blocked',
        block_reason: reasonText,
        tested_by: userData?.name || 'QA Tester'
      });
    } catch (err) {
      console.error('Failed to save tester defect in database:', err);
    }

    setRejectingTask(null);
    setRejectionNotes('');
  };

  const isTaskAssignedToUser = (task: Task, user: any): boolean => {
    if (!user || !task.assignee) return false;
    const a = task.assignee.trim().toLowerCase();
    if (!a || a === 'unassigned') return false;

    const uName = (user.name || '').trim().toLowerCase();
    const uEmail = (user.email || '').trim().toLowerCase();
    const uId = user.id ? String(user.id).trim().toLowerCase() : '';

    if (uName && a === uName) return true;
    if (uEmail && a === uEmail) return true;
    if (uId && a === uId) return true;

    if (uName && uName.length >= 2 && (a.includes(uName) || uName.includes(a))) return true;
    if (uEmail && uEmail.length >= 3 && (a.includes(uEmail) || uEmail.includes(a))) return true;

    return false;
  };

  const myAssignedTasks = useMemo(() => {
    const currentUser = userData || storedUser;
    return tasks.filter(t => isTaskAssignedToUser(t, currentUser));
  }, [tasks, userData, storedUser]);

  // For Developer: strictly scoped to own tasks. For Tester: manages verification queue.
  const userScopedTasks = useMemo(() => {
    if (!isTester) {
      return myAssignedTasks;
    }
    return tasks;
  }, [isTester, myAssignedTasks, tasks]);

  const sprintMetrics = useMemo(() => {
    const targetTasks = userScopedTasks;
    const total = targetTasks.length;
    const completed = targetTasks.filter(t => t.status === 'Completed').length;
    const inProgress = targetTasks.filter(t => t.status === 'In Progress').length;
    const toDo = targetTasks.filter(t => t.status === 'To Do').length;
    const blocked = targetTasks.filter(t => t.status === 'Blocked' || t.rejectedByTester).length;
    const reviewQueue = targetTasks.filter(t => 
      t.status === 'Review Queue' || 
      ['review', 'in review', 'review queue'].includes((t.status || '').toLowerCase().trim())
    ).length;

    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      inProgress,
      toDo,
      blocked,
      reviewQueue,
      progressPercent
    };
  }, [userScopedTasks]);

  const donutSegments = useMemo(() => {
    const total = sprintMetrics.total;
    if (total === 0) return [];

    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const data = [
      { label: 'Completed', count: sprintMetrics.completed, color: STATUS_COLORS.COMPLETED },
      { label: 'In Progress', count: sprintMetrics.inProgress, color: STATUS_COLORS.IN_PROGRESS },
      { label: 'To Do', count: sprintMetrics.toDo, color: STATUS_COLORS.TODO },
      { label: 'Blocked / Warning', count: sprintMetrics.blocked, color: STATUS_COLORS.BLOCKED },
      { label: 'Review Queue', count: sprintMetrics.reviewQueue, color: STATUS_COLORS.IN_REVIEW },
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

  const developerBugTasks = useMemo(() => {
    return userScopedTasks.filter(t => t.status === 'Blocked' || t.rejectedByTester);
  }, [userScopedTasks]);

  const testerQueueTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'Review Queue');
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return userScopedTasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [userScopedTasks, searchQuery, statusFilter, priorityFilter]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';
  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-200">

      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between p-4 shrink-0 shadow-2xs transition-colors duration-200">
        <div className="space-y-6">
          <div className="px-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg text-white bg-[#0F766E] shadow-2xs">
                {!isTester ? <Code2 size={18} /> : <FlaskConical size={18} />}
              </div>
              <div>
                <span className="font-bold text-xs text-[#1F2937] dark:text-white block">FlowBoard</span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 block">Workspace</span>
              </div>
            </div>
          </div>
          <nav className="space-y-1 text-xs font-medium">
            <button 
              type="button"
              onClick={() => setActiveTab('workspace')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'workspace' 
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs' 
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {!isTester ? <Code2 size={15} /> : <FlaskConical size={15} />}
              Dashboard
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('board')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'board' 
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs' 
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare size={15} /> Development Stream
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('profile')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-[#0F766E] text-white font-bold shadow-2xs' 
                  : 'text-[#1F2937] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserIcon size={15} /> Profile & Security
            </button>
          </nav>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('flowboard_token');
              localStorage.removeItem('flowboard_user');
              navigate('/login');
            }} 
            className="w-full flex items-center gap-2 p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-mono cursor-pointer transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F8] dark:bg-[#0B0F17] transition-colors duration-200">
        <header className="h-14 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-mono font-bold tracking-tight text-[#1F2937] dark:text-white uppercase">
              {activeTab === 'workspace' ? `${activeRole} Dashboard` : activeTab === 'board' ? 'Development Stream' : 'Profile & Security'}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400">
              ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        {activeTab === 'workspace' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isTester ? (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs relative overflow-hidden transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
                        Welcome, {userData?.name || storedUser?.name || 'Developer'}!
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-100 rounded-lg text-xs font-mono font-bold transition-all border border-gray-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <UserIcon size={14} className="text-[#0F766E] dark:text-teal-400" /> View Profile
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs transition-colors">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} className="text-[#0F766E] dark:text-teal-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F2937] dark:text-white">
                        Sprint Metrics & Workload Breakdown
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-slate-400">
                      {sprintMetrics.progressPercent}% Completed
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                    <div className="relative w-[150px] h-[150px] shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
                        <circle
                          cx="75"
                          cy="75"
                          r="50"
                          fill="none"
                          stroke="currentColor"
                          className="text-gray-200 dark:text-slate-800"
                          strokeWidth="18"
                        />
                        {sprintMetrics.total === 0 ? (
                          <circle
                            cx="75"
                            cy="75"
                            r="50"
                            fill="none"
                            stroke="currentColor"
                            className="text-gray-300 dark:text-slate-700"
                            strokeWidth="18"
                          />
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
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                          Total
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-md font-mono">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">In Progress</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.inProgress}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_REVIEW }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Review Queue</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.reviewQueue}
                        </span>
                      </div>

                      {/* To Do (#DADFE6) */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.TODO }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">To Do</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.toDo}
                        </span>
                      </div>

                      {/* Completed (#15803D) */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.COMPLETED }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Completed</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.completed}
                        </span>
                      </div>

                      {/* Blocked / Warning (#D97706) */}
                      <div className="col-span-2 flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.BLOCKED }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Blocked / Bugs</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {developerBugTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION REQUIRED (BUGS) */}
                {developerBugTasks.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#D97706]">
                        <Bug size={16} />
                        <span>Action Required: Blocked / QA Defects ({developerBugTasks.length})</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {developerBugTasks.map(task => {
                        const deadlineInfo = getTaskDeadlineInfo(task.startDate, task.endDate || task.dueDate, task.status);
                        const isOverdue = deadlineInfo.isOverdue;
                        return (
                        <div key={task.id} className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 text-[#D97706] px-2 py-0.5 rounded border border-amber-500/40">
                                {task.id}
                              </span>
                              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">{task.title}</h3>
                              <Badge label={task.priority} type="priority" />
                              {deadlineInfo.badgeType === 'overdue' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-[10px] font-mono font-bold text-[#DC2626] dark:text-red-400">
                                  <AlertTriangle size={11} className="shrink-0 text-[#DC2626]" />
                                  <span>{deadlineInfo.statusText}</span>
                                </span>
                              )}
                              {deadlineInfo.badgeType === 'dueToday' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[10px] font-mono font-bold text-[#D97706] dark:text-amber-400">
                                  <Clock size={11} className="shrink-0 text-[#D97706]" />
                                  <span>Due Today</span>
                                </span>
                              )}
                              {deadlineInfo.badgeType === 'onTrack' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 size={11} className="shrink-0 text-emerald-600" />
                                  <span>{deadlineInfo.statusText}</span>
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => updateTaskStatus(task.id, 'In Progress')}
                              className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Play size={13} /> Start Fixing (Move to In Progress)
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500 dark:text-slate-400 flex-wrap">
                            {task.startDate && <span>Start: {task.startDate}</span>}
                            {(task.endDate || task.dueDate) && (
                              <span className={isOverdue ? 'text-[#DC2626] font-bold flex items-center gap-1' : ''}>
                                <Calendar size={11} className="shrink-0 inline" /> End: {task.endDate || task.dueDate}
                                {isOverdue && ' (Overdue)'}
                              </span>
                            )}
                          </div>

                          {task.rejectionReason && (
                            <div className="bg-white dark:bg-slate-900 border border-amber-500/30 p-3 rounded-md text-xs font-mono text-[#D97706] dark:text-amber-300">
                              QA Feedback: "{task.rejectionReason}"
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  </div>
                )}

                {/* MY ASSIGNED ACTIVE TASKS */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#1F2937] dark:text-white">
                      <Code2 size={16} className="text-[#0F766E] dark:text-teal-400" />
                      <span>Sprint Workload: Assigned to Me ({userScopedTasks.length})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[11px] font-mono text-gray-500 dark:text-slate-400">
                        {userScopedTasks.length} {userScopedTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>

                  {userScopedTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 dark:text-slate-500 font-mono border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                      No tasks currently assigned to your profile in this sprint.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userScopedTasks.map(task => {
                        const deadlineInfo = getTaskDeadlineInfo(task.startDate, task.endDate || task.dueDate, task.status);
                        const isOverdue = deadlineInfo.isOverdue;
                        return (
                        <div 
                          key={task.id} 
                          className={`bg-white dark:bg-slate-800/80 p-4 rounded-lg border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            isOverdue ? 'border-red-300 dark:border-red-800/80 ring-1 ring-red-400/30' : 'border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
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
                                className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#0F766E] dark:hover:text-teal-400 transition-colors"
                              >
                                {task.title}
                              </h4>
                              <Badge label={task.priority} type="priority" />
                              <span 
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                                style={{
                                  color: getStatusColor(task.status),
                                  backgroundColor: `${getStatusColor(task.status)}18`,
                                  borderColor: `${getStatusColor(task.status)}35`
                                }}
                              >
                                {task.status}
                              </span>

                              {deadlineInfo.badgeType === 'overdue' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-[10px] font-mono font-bold text-[#DC2626] dark:text-red-400">
                                  <AlertTriangle size={11} className="shrink-0 text-[#DC2626]" />
                                  <span>{deadlineInfo.statusText}</span>
                                </span>
                              )}
                              {deadlineInfo.badgeType === 'dueToday' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[10px] font-mono font-bold text-[#D97706] dark:text-amber-400">
                                  <Clock size={11} className="shrink-0 text-[#D97706]" />
                                  <span>Due Today</span>
                                </span>
                              )}
                              {deadlineInfo.badgeType === 'onTrack' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 size={11} className="shrink-0 text-emerald-600" />
                                  <span>{deadlineInfo.statusText}</span>
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 dark:text-slate-400 flex-wrap">
                              <span>Assignee: <strong className="text-gray-700 dark:text-slate-200">{task.assignee}</strong></span>
                              {task.branchName && <span className="text-teal-600 dark:text-teal-400">Branch: {task.branchName}</span>}
                              {task.startDate && <span>Start: {task.startDate}</span>}
                              {(task.endDate || task.dueDate) && (
                                <span className={isOverdue ? 'text-[#DC2626] font-bold flex items-center gap-1' : ''}>
                                  <Calendar size={11} className="shrink-0 inline" /> End: {task.endDate || task.dueDate}
                                  {isOverdue && ' (Overdue)'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {task.status === 'To Do' && (
                              <button
                                type="button"
                                onClick={() => updateTaskStatus(task.id, 'In Progress')}
                                className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              >
                                <Play size={12} /> Start Coding
                              </button>
                            )}
                            {task.status === 'In Progress' && (
                              <button
                                type="button"
                                onClick={() => updateTaskStatus(task.id, 'Review Queue')}
                                className="px-3 py-1.5 bg-[#9333EA] hover:bg-purple-800 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              >
                                <FlaskConical size={12} /> Submit to QA
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedTask(task)}
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded font-mono text-xs border border-gray-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                            >
                              Actions
                            </button>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* -------------------------------------------------------- */
              /* 2. TESTER VIEW                                           */
              /* -------------------------------------------------------- */
              <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* WELCOME TESTER BANNER */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs relative overflow-hidden transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
                        Welcome, {userData?.name || storedUser?.name || 'QA Tester'}!
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-100 rounded-lg text-xs font-mono font-bold transition-all border border-gray-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <UserIcon size={14} className="text-[#0F766E] dark:text-teal-400" /> View Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* SPRINT METRICS & WORKLOAD */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-xs transition-colors">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} className="text-[#0F766E] dark:text-teal-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F2937] dark:text-white">
                        QA Workload & Verification Progress
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-slate-400">
                      {sprintMetrics.progressPercent}% Verified
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                    {/* Visual Donut Chart */}
                    <div className="relative w-[150px] h-[150px] shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
                        <circle
                          cx="75"
                          cy="75"
                          r="50"
                          fill="none"
                          stroke="currentColor"
                          className="text-gray-200 dark:text-slate-800"
                          strokeWidth="18"
                        />
                        {sprintMetrics.total === 0 ? (
                          <circle
                            cx="75"
                            cy="75"
                            r="50"
                            fill="none"
                            stroke="currentColor"
                            className="text-gray-300 dark:text-slate-700"
                            strokeWidth="18"
                          />
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
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                          Total
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Metric Pills with consistent colors */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-md font-mono">
                      {/* Review Queue (#9333EA) */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_REVIEW }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Review Queue</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {testerQueueTasks.length}
                        </span>
                      </div>

                      {/* In Progress (#2563EB) */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">In Progress</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.inProgress}
                        </span>
                      </div>

                      {/* To Do (#64748B) */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.TODO }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">To Do</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.toDo}
                        </span>
                      </div>

                      {/* Completed (#15803D) */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.COMPLETED }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Completed</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {sprintMetrics.completed}
                        </span>
                      </div>

                      {/* Blocked Defect (#D97706) */}
                      <div className="col-span-2 flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.BLOCKED }} />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 font-sans">Blocked Defect</span>
                        </div>
                        <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                          {developerBugTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TESTER REVIEW QUEUE */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#1F2937] dark:text-white">
                      <FlaskConical size={16} className="text-[#9333EA]" />
                      <span>Pending Verification Queue ({testerQueueTasks.length})</span>
                    </div>
                  </div>

                  {testerQueueTasks.length === 0 ? (
                    <div className="bg-gray-50/50 dark:bg-slate-800/30 p-8 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 text-center space-y-2">
                      <CheckCircle size={32} className="mx-auto text-[#15803D]" />
                      <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">Review Queue is Clear!</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        No pending tickets currently waiting for verification. When work is submitted to Review Queue, it will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {testerQueueTasks.map(task => {
                        const deadlineInfo = getTaskDeadlineInfo(task.startDate, task.endDate || task.dueDate, task.status);
                        const isOverdue = deadlineInfo.isOverdue;
                        return (
                        <div 
                          key={task.id} 
                          className={`bg-white dark:bg-slate-800/80 p-4 rounded-lg border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            isOverdue ? 'border-red-300 dark:border-red-800/80 ring-1 ring-red-400/30' : 'border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-[#9333EA] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                                {task.id}
                              </span>
                              <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">{task.title}</h4>
                              <Badge label={task.priority} type="priority" />
                              <span className="text-[11px] font-mono text-gray-500 dark:text-slate-400">Assignee: {task.assignee}</span>

                              {deadlineInfo.badgeType === 'overdue' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-[10px] font-mono font-bold text-[#DC2626] dark:text-red-400">
                                  <AlertTriangle size={11} className="shrink-0 text-[#DC2626]" />
                                  <span>{deadlineInfo.statusText}</span>
                                </span>
                              )}
                              {deadlineInfo.badgeType === 'dueToday' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[10px] font-mono font-bold text-[#D97706] dark:text-amber-400">
                                  <Clock size={11} className="shrink-0 text-[#D97706]" />
                                  <span>Due Today</span>
                                </span>
                              )}
                              {deadlineInfo.badgeType === 'onTrack' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 size={11} className="shrink-0 text-emerald-600" />
                                  <span>{deadlineInfo.statusText}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-slate-300">{task.description}</p>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 dark:text-slate-400 flex-wrap">
                              {task.startDate && <span>Start: {task.startDate}</span>}
                              {(task.endDate || task.dueDate) && (
                                <span className={isOverdue ? 'text-[#DC2626] font-bold flex items-center gap-1' : ''}>
                                  <Calendar size={11} className="shrink-0 inline" /> End: {task.endDate || task.dueDate}
                                  {isOverdue && ' (Overdue)'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTesterPass(task)}
                              className="px-3 py-1.5 bg-[#15803D] hover:bg-green-800 text-white rounded font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            >
                              <CheckCircle size={14} /> Pass & Mark Completed
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectingTask(task);
                                setRejectionNotes('');
                              }}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#D97706] rounded font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Bug size={14} /> Reject to Dev (Defect)
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedTask(task)}
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded font-mono text-xs border border-gray-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>

                {/* ACTIVE DEFECTS LOG */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#D97706]">
                      <Bug size={16} />
                      <span>Active Defects Log ({developerBugTasks.length})</span>
                    </div>
                  </div>

                  {developerBugTasks.length === 0 ? (
                    <div className="bg-gray-50/50 dark:bg-slate-800/30 p-6 rounded-lg border border-gray-200 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-slate-400">
                      No open defects reported in database.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {developerBugTasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-slate-800/80 p-3.5 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs shadow-2xs">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#D97706]">{task.id}</span>
                              <span className="font-semibold text-[#1F2937] dark:text-white">{task.title}</span>
                              <Badge label={task.priority} type="priority" />
                            </div>
                            {task.rejectionReason && (
                              <p className="text-gray-500 dark:text-slate-400 text-[11px] font-mono">
                                Note: {task.rejectionReason}
                              </p>
                            )}
                          </div>
                          <span className="text-[11px] font-mono bg-amber-500/10 text-[#D97706] px-2 py-1 rounded border border-amber-500/30 font-semibold">
                            Status: In Fixing
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* DEVELOPMENT STREAM (KANBAN BOARD)                              */}
        {/* ============================================================== */}
        {activeTab === 'board' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F6F8] dark:bg-[#0B0F17] transition-colors">
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-3 shrink-0 transition-colors">
              <div className="flex items-center gap-3 flex-wrap flex-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-slate-300 font-bold">
                  <Filter size={14} className="text-[#0F766E] dark:text-teal-400" />
                  <span>Filter Stream:</span>
                </div>
                <div className="relative min-w-[220px]">
                  <Search size={12} className="absolute left-2.5 top-3 text-gray-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search ticket ID or title..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-[#1F2937] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]" 
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)} 
                  className="py-1.5 px-3 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-mono font-bold text-[#1F2937] dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0F766E] focus:outline-none" 
                >
                  <option value="ALL">Status: All</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review Queue">Review Queue</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={e => setPriorityFilter(e.target.value)} 
                  className="py-1.5 px-3 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-mono font-bold text-[#1F2937] dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0F766E] focus:outline-none" 
                >
                  <option value="ALL">Priority: All</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button 
                  type="button"
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }} 
                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-mono font-bold rounded text-xs hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border border-gray-200 dark:border-slate-700 shadow-2xs" 
                >
                  <XCircle size={13} /> Reset
                </button>
              )}
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
              <Board 
                tasks={filteredTasks} 
                userRole={activeRole}
                onSelectTask={task => setSelectedTask(task)} 
                onUpdateStatus={updateTaskStatus}
                onUpdateTask={updated => handleUpdateTaskModal(updated)}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PROFILE TAB                                                    */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#F4F6F8] dark:bg-[#0B0F17] transition-colors">
            <UserProfile userData={userData} />
          </div>
        )}

      </main>

      {/* REJECTION MODAL FOR TESTERS */}
      {rejectingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#D97706] font-bold text-sm">
                <Bug size={18} />
                <span>Reject Task Back to Developer (Defect)</span>
              </div>
              <button 
                type="button"
                onClick={() => setRejectingTask(null)} 
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs text-[#0F766E] dark:text-teal-400 font-bold">{rejectingTask.id}</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rejectingTask.title}</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-700 dark:text-slate-300 block">
                QA Rejection Notes & Defect Details:
              </label>
              <textarea
                rows={3}
                placeholder="Explain what failed in testing..."
                value={rejectionNotes}
                onChange={e => setRejectionNotes(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingTask(null)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded text-xs font-mono cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-1.5 bg-[#D97706] hover:bg-amber-700 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Confirm Defect & Return Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK MODAL VIEW */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleUpdateTaskModal} 
        />
      )}

    </div>
  );
}