import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { id: string; title: string; description: string; priority: any; status: any; assignee: string; dueDate: string }) => void;
  initialData?: { id?: string; title: string; description: string; priority: any; status?: any; assignee: string; dueDate?: string } | null;
}

export default function TaskFormModal({ isOpen, onClose, onSave, initialData }: TaskFormModalProps) {
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<'Backlog' | 'To Do'>('To Do');
  const [assignee, setAssignee] = useState('Developer User');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTaskId(initialData.id || `FB-${Math.floor(100 + Math.random() * 900)}`);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setPriority(initialData.priority);
      setStatus(initialData.status === 'Backlog' ? 'Backlog' : 'To Do');
      setAssignee(initialData.assignee);
      setDueDate(initialData.dueDate || '');
    } else {
      setTaskId(`FB-${Math.floor(100 + Math.random() * 900)}`);
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setAssignee('Developer User');
      setDueDate('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId.trim()) {
      setError('Task ID is required.');
      return;
    }
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    onSave({ id: taskId, title, description, priority, status, assignee, dueDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <form onSubmit={handleSubmit} className="bg-gray-800 text-gray-100 p-6 rounded-xl max-w-md w-full space-y-4 border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="font-bold text-xs font-mono uppercase text-white flex items-center gap-2">
            <CheckSquare size={16} className="text-blue-400" /> {initialData ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
        </div>

        {error && <div className="p-2.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">{error}</div>}

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Task ID <span className="text-red-400">*</span>:</label>
          <input type="text" placeholder="e.g. FB-301" value={taskId} onChange={e => { setTaskId(e.target.value); setError(''); }} className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded text-xs text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Task Title <span className="text-red-400">*</span>:</label>
          <input type="text" placeholder="Enter task title..." value={title} onChange={e => { setTitle(e.target.value); setError(''); }} className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Description <span className="text-gray-500 font-normal">(Optional)</span>:</label>
          <textarea placeholder="Acceptance criteria or details..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none" rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-300">Initial Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-xs text-white font-mono">
              <option value="Backlog">Backlog</option>
              <option value="To Do">To Do</option>
            </select>
          </div>
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-300">Priority:</label>
            <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-xs text-white font-mono">
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-300">Assignee:</label>
            <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-xs text-white font-mono" />
          </div>
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-300">Due Date:</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-xs text-white font-mono" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-700">
          <button type="button" onClick={onClose} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs cursor-pointer font-mono">Cancel</button>
          <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold cursor-pointer font-mono">Save Task</button>
        </div>
      </form>
    </div>
  );
}