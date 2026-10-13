import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Loader2, Calendar, User, AlertCircle } from 'lucide-react';
import { getTodayString, addDaysToDate } from '../../utils/dateUtils';

export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => Promise<void> | void;
  initialData?: TaskFormData | null;
  defaultStatus?: TaskFormData['status'];
  teamMembers?: Array<{ id: number; name: string; email: string; role: string; status?: string }>;
}

export default function TaskFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  defaultStatus = 'To Do',
  teamMembers = [] 
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskFormData['priority']>('Medium');
  const [status, setStatus] = useState<TaskFormData['status']>(defaultStatus);
  const [assignee, setAssignee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter out any Admin and Scrum Master accounts - only Developers and Testers can be assigned
  const assignableTeam = React.useMemo(() => {
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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'Medium');
      const resolvedStatus = initialData.status || defaultStatus;
      setStatus(resolvedStatus);
      if (resolvedStatus === 'Backlog') {
        setAssignee('Unassigned');
      } else {
        setAssignee(initialData.assignee || (assignableTeam.length > 0 ? (assignableTeam[0].name || assignableTeam[0].email) : ''));
      }
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || initialData.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus(defaultStatus);
      if (defaultStatus === 'Backlog') {
        setAssignee('Unassigned');
      } else {
        setAssignee(assignableTeam.length > 0 ? (assignableTeam[0].name || assignableTeam[0].email) : '');
      }
      const today = getTodayString();
      setStartDate(today);
      setEndDate(addDaysToDate(today, 7));
    }
    setError('');
  }, [initialData, isOpen, defaultStatus, assignableTeam]);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus: TaskFormData['status']) => {
    setStatus(newStatus);
    if (newStatus === 'Backlog') {
      setAssignee('Unassigned');
    } else if (!assignee || assignee === 'Unassigned') {
      setAssignee(teamMembers.length > 0 ? (teamMembers[0].name || teamMembers[0].email) : '');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (status === 'To Do' && (!assignee || assignee === 'Unassigned')) {
      setError('Tasks in To Do must be assigned to a team member.');
      return;
    }

    if (!startDate) {
      setError('Start Date is mandatory.');
      return;
    }

    if (!endDate) {
      setError('End Date is mandatory.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End Date cannot be earlier than Start Date.');
      return;
    }

    const finalAssignee = status === 'Backlog' ? 'Unassigned' : (assignee || 'Unassigned');

    setSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assignee: finalAssignee,
        startDate,
        endDate,
        dueDate: endDate
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      if (msg === 'Network Error' || !err?.response) {
        setError('Connection failed. Please ensure the backend server is running on http://localhost:5000.');
      } else {
        setError(msg || 'Failed to save task to database.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 rounded-xl max-w-lg w-full space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl transition-colors"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <CheckSquare size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                {initialData ? `Edit Task (${initialData.id})` : `Create Task in ${status}`}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Saves directly to your PostgreSQL database
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
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1 text-xs">
          <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block">
            Task Title <span className="text-red-500">*</span>:
          </label>
          <input 
            type="text" 
            placeholder="e.g. Implement user authentication middleware" 
            value={title} 
            onChange={e => { setTitle(e.target.value); setError(''); }} 
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none" 
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1 text-xs">
          <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block">
            Description / Acceptance Criteria:
          </label>
          <textarea 
            placeholder="Provide context, requirements or user stories..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3}
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none" 
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 text-xs">
            <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block">
              Workflow Status:
            </label>
            <select 
              value={status} 
              onChange={e => handleStatusChange(e.target.value as any)} 
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer"
            >
              <option value="To Do">To Do</option>
              {defaultStatus === 'Backlog' && <option value="Backlog">Backlog</option>}
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block">
              Priority:
            </label>
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as any)} 
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div className="space-y-1 text-xs">
          <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block flex items-center gap-1">
            <User size={12} className="text-[#0F766E] dark:text-teal-400" />
            <span>Assigned User:</span>
            {status === 'To Do' ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal lowercase">(unassigned for backlog)</span>}
          </label>
          {status === 'Backlog' ? (
            <div className="p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-mono text-gray-500 dark:text-slate-400 flex items-center justify-between">
              <span>Unassigned</span>
              <span className="text-[10px] text-gray-400">Backlog item</span>
            </div>
          ) : assignableTeam.length > 0 ? (
            <select
              value={assignee}
              onChange={e => { setAssignee(e.target.value); setError(''); }}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer"
              required
            >
              <option value="">-- Select Team Member --</option>
              {assignableTeam.map(m => (
                <option key={m.id} value={m.name || m.email}>
                  {m.name || m.email} {m.role ? `(${m.role})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              placeholder="Assignee name (required for To Do)..."
              value={assignee} 
              onChange={e => { setAssignee(e.target.value); setError(''); }} 
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none" 
              required
            />
          )}
        </div>

        {/* Mandatory Start Date & End Date */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-xs">
              <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block flex items-center gap-1">
                <Calendar size={12} className="text-[#0F766E] dark:text-teal-400" />
                <span>Start Date <span className="text-red-500">*</span>:</span>
              </label>
              <input 
                type="date" 
                required
                min="2020-01-01"
                value={startDate} 
                onChange={e => { setStartDate(e.target.value); setError(''); }} 
                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer" 
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 block flex items-center gap-1">
                <Calendar size={12} className="text-[#0F766E] dark:text-teal-400" />
                <span>End Date <span className="text-red-500">*</span>:</span>
              </label>
              <input 
                type="date" 
                required
                min={startDate || '2020-01-01'}
                value={endDate} 
                onChange={e => { setEndDate(e.target.value); setError(''); }} 
                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] focus:outline-none cursor-pointer" 
              />
            </div>
          </div>

          {/* Quick presets for End Date */}
          <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono flex-wrap">
            <span className="text-gray-400 dark:text-slate-500 text-[10px]">Quick presets:</span>
            <button
              type="button"
              onClick={() => {
                const base = startDate || getTodayString();
                setEndDate(addDaysToDate(base, 3));
              }}
              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              +3 Days
            </button>
            <button
              type="button"
              onClick={() => {
                const base = startDate || getTodayString();
                setEndDate(addDaysToDate(base, 7));
              }}
              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              +1 Week
            </button>
            <button
              type="button"
              onClick={() => {
                const base = startDate || getTodayString();
                setEndDate(addDaysToDate(base, 14));
              }}
              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              +2 Weeks
            </button>
            <button
              type="button"
              onClick={() => {
                const base = startDate || getTodayString();
                setEndDate(addDaysToDate(base, 30));
              }}
              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-teal-400 border border-gray-200 dark:border-slate-700 cursor-pointer text-[10px]"
            >
              +1 Month
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={saving}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer font-mono shadow-2xs"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-bold cursor-pointer font-mono flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}