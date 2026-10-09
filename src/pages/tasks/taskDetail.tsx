import React from 'react';
import { CheckSquare, Clock, AlertOctagon, User, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../Layout/navbar';
import Sidebar from '../../Layout/sidebar';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  dueDate?: string;
  blockReason?: string;
}

export default function TaskDetails() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  // Retrieve tasks from localStorage
  const savedTasks: Task[] = JSON.parse(localStorage.getItem('flowboard_tasks') || '[]');
  const task = savedTasks.find(t => t.id === taskId) || savedTasks[0] || {
    id: taskId || 'FB-201',
    title: 'Sample Task Specification',
    description: 'Detailed enterprise specifications and requirements.',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Developer User'
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-gray-900 text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-gray-900">
        <Navbar title={`Task Overview — ${task.id}`} />

        <div className="flex-1 p-8 overflow-y-auto max-w-3xl space-y-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:underline cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  {task.id}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">{task.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                task.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {task.priority} Priority
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-gray-400 font-bold">Description</h4>
              <p className="text-xs text-gray-300 bg-gray-900 p-4 rounded border border-gray-700 leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-3 bg-gray-900 rounded border border-gray-700 space-y-1">
                <span className="text-gray-400 block">Current Status</span>
                <strong className="text-white text-sm">{task.status}</strong>
              </div>
              <div className="p-3 bg-gray-900 rounded border border-gray-700 space-y-1">
                <span className="text-gray-400 block">Assigned Developer</span>
                <strong className="text-blue-400 text-sm">{task.assignee}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}