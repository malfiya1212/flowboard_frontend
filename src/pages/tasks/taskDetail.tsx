import { ArrowLeft, Loader2, Copy, Check, Calendar, User as UserIcon, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../Layout/navbar';
import Sidebar from '../../Layout/sidebar';
import Badge from '../../componets/commen/Badge';
import { getStatusColor } from '../../utils/statusColors';
import { isTaskOverdue } from '../../utils/dateUtils';
import api from '../../service/api';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  blockReason?: string;
  rejectionReason?: string;
}

export default function TaskDetails() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchTaskById = async () => {
      setLoading(true);
      try {
        const res = await api.get('/user/tasks');
        if (res.data && Array.isArray(res.data)) {
          const formatted = res.data.map((item: any) => ({
            id: String(item.id).startsWith('FB-') ? String(item.id) : `FB-${item.id}`,
            title: item.title || 'Untitled Task',
            description: item.description || 'No description provided for this task.',
            priority: item.priority || 'Medium',
            status: item.status || 'To Do',
            assignee: item.assignee || 'Unassigned',
            startDate: item.start_date || item.startDate || '',
            endDate: item.end_date || item.endDate || item.due_date || item.dueDate || '',
            dueDate: item.end_date || item.endDate || item.due_date || item.dueDate || '',
            blockReason: item.blockReason || item.rejectionReason
          }));

          const found = formatted.find((t: Task) => 
            t.id.toLowerCase() === taskId?.toLowerCase() || 
            t.id.replace('FB-', '') === taskId?.replace('FB-', '')
          );
          if (found) {
            setTask(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch task from API:', err);
      }

      // Fallback to localStorage
      const savedTasks: Task[] = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
      const localFound = savedTasks.find(t => 
        t.id.toLowerCase() === taskId?.toLowerCase() || 
        t.id.replace('FB-', '') === taskId?.replace('FB-', '')
      );
      if (localFound) {
        setTask(localFound);
      } else {
        setTask({
          id: taskId?.toUpperCase() || 'FB-1',
          title: `Task Details (${taskId})`,
          description: 'No detailed description found in database for this ticket. You can update or edit this task description from your dashboard.',
          priority: 'Medium',
          status: 'To Do',
          assignee: 'Unassigned'
        });
      }
      setLoading(false);
    };

    fetchTaskById();
  }, [taskId]);

  const handleCopyId = () => {
    if (!task) return;
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (newStatus: Task['status']) => {
    if (!task) return;
    setIsUpdatingStatus(true);
    const rawId = task.id.replace('FB-', '');
    try {
      await api.put(`/user/tasks/${rawId}`, { status: newStatus });
    } catch (err) {
      console.warn('Could not update status via API, persisting in local state:', err);
    }

    setTask(prev => prev ? { ...prev, status: newStatus } : null);

    // Update in local storage
    try {
      const savedTasks: Task[] = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
      const updatedList = savedTasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
      localStorage.setItem('flowboard_tasks', JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    setIsUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F6F8] dark:bg-[#0B0F17] text-[#0F766E] dark:text-teal-400 font-mono text-xs">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading task details and description...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F6F8] dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 font-mono text-xs flex-col gap-3">
        <span>Task not found for ID: {taskId}</span>
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs font-mono text-[#0F766E] underline cursor-pointer"
        >
          Return to previous dashboard
        </button>
      </div>
    );
  }

  const statusColor = getStatusColor(task.status);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F4F6F8] dark:bg-[#0B0F17] text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-[#F4F6F8] dark:bg-[#0B0F17]">
        <Navbar title={`Task Overview — ${task.id}`} />

        <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0F766E] dark:text-teal-400 hover:underline cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>

          {/* MAIN SPECIFICATION CARD */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs transition-colors">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded">
                    {task.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy task ID"
                    className="p-1 text-gray-400 hover:text-[#0F766E] dark:hover:text-teal-400 rounded cursor-pointer transition-colors"
                  >
                    {copied ? <Check size={14} className="text-[#0F766E]" /> : <Copy size={14} />}
                  </button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {task.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge label={task.priority} type="priority" />
                <span 
                  className="text-xs font-mono font-bold px-3 py-1 rounded border shadow-2xs"
                  style={{
                    color: statusColor,
                    backgroundColor: `${statusColor}18`,
                    borderColor: `${statusColor}35`
                  }}
                >
                  {task.status}
                </span>
              </div>
            </div>

            {/* OVERDUE DEADLINE WARNING CALLOUT */}
            {isTaskOverdue(task.endDate || task.dueDate, task.status) && (
              <div className="bg-red-500/10 border border-red-500/30 dark:bg-red-950/20 rounded-lg p-4 flex items-start gap-3 text-xs">
                <AlertTriangle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-mono font-bold uppercase text-[#DC2626]">Deadline Missed (Overdue):</span>
                  <p className="text-red-700 dark:text-red-300 font-mono">
                    This task has passed its required End Date ({task.endDate || task.dueDate}) without reaching the Completed column. Immediate developer action is required.
                  </p>
                </div>
              </div>
            )}

            {/* BLOCK / REJECTION WARNING CALLOUT (IF BLOCKED) */}
            {(task.blockReason || task.rejectionReason) && (
              <div className="bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20 rounded-lg p-4 flex items-start gap-3 text-xs">
                <AlertTriangle size={18} className="text-[#D97706] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-mono font-bold uppercase text-[#D97706]">Defect / Blocker Report:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono">
                    {task.blockReason || task.rejectionReason}
                  </p>
                </div>
              </div>
            )}

            {/* FULL TASK DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase text-gray-500 dark:text-slate-400 font-bold tracking-wider">
                  Detailed Description & Specification
                </h4>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/60 p-5 rounded-lg border border-gray-200 dark:border-slate-700/80 leading-relaxed text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                {task.description}
              </div>
            </div>

            {/* TASK METADATA GRID: MANDATORY START & END DATES */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 font-mono text-xs">
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1.5">
                <span className="text-gray-400 dark:text-slate-400 block text-[11px] uppercase">Assigned User</span>
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                  <UserIcon size={14} className="text-[#0F766E] dark:text-teal-400" />
                  <span>{task.assignee || 'Unassigned'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1.5">
                <span className="text-gray-400 dark:text-slate-400 block text-[11px] uppercase">Start Date</span>
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                  <Calendar size={14} className="text-[#0F766E] dark:text-teal-400" />
                  <span>{task.startDate || 'Not set'}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-lg border space-y-1.5 ${
                isTaskOverdue(task.endDate || task.dueDate, task.status) 
                  ? 'bg-red-50/60 dark:bg-red-950/25 border-red-300 dark:border-red-800' 
                  : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-slate-400 block text-[11px] uppercase">End Date</span>
                  {isTaskOverdue(task.endDate || task.dueDate, task.status) && (
                    <span className="text-[10px] text-[#DC2626] font-bold">OVERDUE</span>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 font-bold ${
                  isTaskOverdue(task.endDate || task.dueDate, task.status) ? 'text-[#DC2626]' : 'text-slate-900 dark:text-white'
                }`}>
                  <Calendar size={14} className={isTaskOverdue(task.endDate || task.dueDate, task.status) ? 'text-[#DC2626]' : 'text-[#0F766E] dark:text-teal-400'} />
                  <span>{task.endDate || task.dueDate || 'Not set'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1.5">
                <span className="text-gray-400 dark:text-slate-400 block text-[11px] uppercase">Status Color Meaning</span>
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: statusColor }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  <span>{task.status}</span>
                </div>
              </div>
            </div>

            {/* QUICK STATUS TRANSITION BAR */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase text-gray-500 dark:text-slate-400 font-bold block">
                Update Task Workflow Status
              </span>
              <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                {(['To Do', 'In Progress', 'Review Queue', 'Completed', 'Blocked'] as Task['status'][]).map(statusOption => {
                  const isCurrent = task.status === statusOption;
                  const col = getStatusColor(statusOption);
                  return (
                    <button
                      key={statusOption}
                      type="button"
                      disabled={isCurrent || isUpdatingStatus}
                      onClick={() => handleUpdateStatus(statusOption)}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors border cursor-pointer ${
                        isCurrent 
                          ? 'opacity-100 shadow-xs ring-2 ring-offset-1 ring-teal-500' 
                          : 'opacity-70 hover:opacity-100 hover:shadow-2xs'
                      }`}
                      style={{
                        color: col,
                        backgroundColor: `${col}18`,
                        borderColor: `${col}40`
                      }}
                    >
                      {isCurrent ? `✓ ${statusOption}` : `Move to ${statusOption}`}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}