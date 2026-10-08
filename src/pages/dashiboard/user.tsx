import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/authcontext';
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  Filter, 
  LogOut, 
  User, 
  ShieldAlert, 
  CheckSquare 
} from 'lucide-react';

// Define the TypeScript interface for a task based on the SRS
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Review' | 'Completed';
  dueDate: string;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 1. LOCAL STATE: Managing tasks assigned to this developer
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'TASK-101',
      title: 'Implement JWT Authentication Refresh',
      description: 'Ensure token persistence and silent refresh handling across protected API endpoints.',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-10-15',
    },
    {
      id: 'TASK-104',
      title: 'Refactor Task Card Component Styles',
      description: 'Clean up Tailwind classes and ensure contrast compliance across modal views.',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '2026-10-18',
    },
    {
      id: 'TASK-108',
      title: 'Fix Database Connection Timeout on Startup',
      description: 'Investigate pool exhaustion during high-concurrency test initialization.',
      priority: 'Critical',
      status: 'Blocked',
      dueDate: '2026-10-12',
    },
  ]);

  // 2. LOCAL STATE: Managing dropdown filter criteria
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // HANDLER: Updates an individual task's status (CRUD - Update operation)
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks =>
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // FILTER LOGIC: Computes visible tasks dynamically based on user selection
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-left)] font-sans text-gray-900">
      
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#284B38]/10 text-[#284B38]">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">Flowboard</h1>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Developer Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-[var(--color-input)] px-3 py-1.5 rounded-lg">
            <User size={16} className="text-[#284B38]" />
            <span>{user?.name || 'Team Member'}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-6xl mx-auto p-6 sm:p-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">My Assigned Tasks</h2>
          <p className="text-sm text-gray-600">Track your current assignments, report blocks, and update sprint progress.</p>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Assigned</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Progress</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.filter(t => t.status === 'In Progress').length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Blocked</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.filter(t => t.status === 'Blocked').length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.filter(t => t.status === 'Completed').length}</p>
          </div>
        </div>

        {/* Task Filtering Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Filter size={18} className="text-[#284B38]" />
            <span>Filter Tasks:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--color-input)] border border-transparent focus:border-[#284B38] rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>

            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[var(--color-input)] border border-transparent focus:border-[#284B38] rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Task List Rendering */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
              No tasks found matching your filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-gray-400">{task.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'Blocked' ? 'bg-red-100 text-red-700 font-bold' :
                      task.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                    <Clock size={14} />
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>

                {/* Status Update Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {task.status !== 'In Progress' && (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'In Progress')}
                      className="px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Play size={14} /> Start
                    </button>
                  )}

                  {task.status !== 'Review' && task.status !== 'Completed' && (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'Review')}
                      className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Submit Review
                    </button>
                  )}

                  {task.status !== 'Completed' && (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'Completed')}
                      className="px-3 py-2 bg-[#284B38] text-white hover:bg-[#1E3A2B] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>
                  )}

                  {task.status !== 'Blocked' ? (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'Blocked')}
                      className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ShieldAlert size={14} /> Report Block
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'In Progress')}
                      className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Unblock & Resume
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}