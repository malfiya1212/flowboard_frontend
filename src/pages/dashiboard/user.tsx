import React, { useState } from 'react';
import { CheckSquare, ArrowRight, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../../componets/commen/taskcard';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Review Queue';
  assignee: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'board' | 'lifecycle'>('board');

  // Developer personal task list
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'FB-201', title: 'Refactor authentication state hook', description: 'Ensure token persistence across session expiration.', priority: 'High', status: 'To Do', assignee: 'Developer' },
    { id: 'FB-202', title: 'Implement Tailwind v4 layout grid', description: 'Fix asymmetrical sidebar padding ratios.', priority: 'Critical', status: 'In Progress', assignee: 'Developer' },
    { id: 'FB-203', title: 'Resolve autofill background rendering bug', description: 'Apply webkit override rules to inputs.', priority: 'Medium', status: 'Blocked', assignee: 'Developer' },
    { id: 'FB-204', title: 'Unit test modal component event listeners', description: 'Verify Escape key handling and backdrop scroll lock.', priority: 'Low', status: 'Completed', assignee: 'Developer' },
  ]);

  const updateTaskStatus = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const columns: Task['status'][] = ['To Do', 'In Progress', 'Blocked', 'Completed', 'Review Queue'];

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans antialiased bg-[var(--color-bg-right)] text-[oklch(15%_0.02_320)]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[var(--color-bg-left)] border-r border-[oklch(90%_0.02_320)] flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="p-1.5 rounded-sm bg-[oklch(15%_0.02_320)] text-white">
              <CheckSquare size={18} />
            </div>
            <span className="font-bold tracking-tight text-sm">Developer Workspace</span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors ${activeTab === 'board' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <CheckSquare size={15} />
              <span>Personal Task Board</span>
            </button>
            <button 
              onClick={() => setActiveTab('lifecycle')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors ${activeTab === 'lifecycle' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <ArrowRight size={15} />
              <span>Workflow Rules</span>
            </button>
          </nav>
        </div>

        {/* User Profile */}
        <div className="pt-4 border-t border-[oklch(90%_0.02_320)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-gray-300 flex items-center justify-center font-bold text-xs">
              <User size={14} />
            </div>
            <div>
              <p className="text-xs font-bold">Developer User</p>
              <p className="text-[10px] font-mono text-gray-500">dev@flowboard.io</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="p-1.5 rounded-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-14 border-b border-[oklch(90%_0.02_320)] px-6 flex items-center justify-between bg-[var(--color-bg-left)]">
          <h1 className="text-sm font-bold uppercase tracking-wide font-mono">
            {activeTab === 'board' ? 'Assigned Developer Backlog' : 'Task State Transition Guidelines'}
          </h1>
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-sm border border-[oklch(90%_0.02_320)]">
            Active Tasks: {tasks.length}
          </span>
        </header>

        {/* KANBOARD VIEW */}
        {activeTab === 'board' && (
          <div className="flex-1 p-6 overflow-x-auto bg-[var(--color-bg-right)]">
            <div className="grid grid-cols-5 gap-3 h-full min-w-[1100px]">
              {columns.map(statusCol => {
                const colTasks = tasks.filter(t => t.status === statusCol);
                return (
                  <div key={statusCol} className="flex flex-col bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)] overflow-hidden h-full">
                    
                    {/* Column Header */}
                    <div className="px-3 py-2.5 border-b border-[oklch(90%_0.02_320)] bg-white flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">{statusCol}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[var(--color-bg-right)] border border-[oklch(90%_0.02_320)]">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task List */}
                    <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                      {colTasks.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-xs font-mono">No tasks</div>
                      ) : (
                        colTasks.map(task => (
                          <TaskCard 
                            key={task.id}
                            {...task}
                            onUpdateStatus={(newStatus) => updateTaskStatus(task.id, newStatus)}
                            onReportBlock={() => updateTaskStatus(task.id, 'Blocked')}
                          />
                        ))
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKFLOW RULES VIEW */}
        {activeTab === 'lifecycle' && (
          <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-bg-right)] flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-sm border border-[oklch(90%_0.02_320)] max-w-xl w-full text-center space-y-6 font-sans">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider">Developer Lifecycle Rules</h2>
              <div className="space-y-3 font-mono text-xs text-left">
                <div className="p-2.5 bg-[var(--color-bg-left)] border border-[oklch(90%_0.02_320)] rounded-sm">
                  <strong>1. Sees Assigned Work:</strong> Review tasks assigned to your developer profile in the To Do column.
                </div>
                <div className="p-2.5 bg-[var(--color-bg-left)] border border-[oklch(90%_0.02_320)] rounded-sm">
                  <strong>2. Works on Task & Updates Status:</strong> Transition tasks from To Do $\rightarrow$ In Progress as you write code.
                </div>
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-sm">
                  <strong>3. Reports Blocked:</strong> If stopped by an impediment, flag it as Blocked to alert the Scrum Master.
                </div>
                <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 rounded-sm">
                  <strong>4. Completes Task:</strong> Finish the task and push it to the Review Queue for authorized inspection.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}