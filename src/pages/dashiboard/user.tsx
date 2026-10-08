import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  User, 
  LogOut, 
  X, 
  AlertOctagon, 
  LayoutList, 
  Shield, 
  Search, 
  Filter, 
  FolderKanban 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../componets/commen/Badge';

import { usePermissions } from '../../context/permision';

function RolePermissions() {
  const { role } = usePermissions();
  
  return (
    <div className="bg-white p-8 rounded-sm border border-[oklch(90%_0.02_320)] max-w-xl w-full space-y-5 font-sans shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
        <Shield className="text-gray-800" size={20} />
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">User Role & Permissions</h3>
      </div>
      <div className="space-y-3 font-mono text-xs text-gray-700">
        <div className="p-3 bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)]">
          <strong>Current Role:</strong> {role}
        </div>
        <div className="p-3 bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)]">
          <strong>Access Level:</strong> Developer Workspace
        </div>
      </div>
    </div>
  );
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  blockReason?: string;
  reviewFeedback?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { role } = usePermissions();
  const [activeTab, setActiveTab] = useState<'board' | 'my-tasks' | 'project' | 'lifecycle' | 'settings'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'FB-201', title: 'Refactor authentication state hook', description: 'Ensure token persistence across session expiration.', priority: 'High', status: 'To Do', assignee: 'Developer' },
    { id: 'FB-202', title: 'Implement Tailwind v4 layout grid', description: 'Fix asymmetrical sidebar padding ratios.', priority: 'Critical', status: 'In Progress', assignee: 'Developer' },
    { id: 'FB-203', title: 'Optimize OKLCH design system tokens', description: 'Audit all color scales for accessibility compliance.', priority: 'Medium', status: 'Review Queue', assignee: 'Developer', reviewFeedback: 'Looks solid, please ensure high contrast compliance on dark mode.' },
    { id: 'FB-204', title: 'Unit test modal component event listeners', description: 'Verify Escape key handling and backdrop scroll lock.', priority: 'Low', status: 'Completed', assignee: 'Developer' },
    { id: 'FB-205', title: 'Resolve webkit autofill form background bug', description: 'Apply webkit override rules to inputs.', priority: 'High', status: 'Blocked', assignee: 'Developer', blockReason: 'Missing staging environment API credentials.' },
  ]);

  const [blockingTaskId, setBlockingTaskId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);

  const updateTaskStatus = (id: string, newStatus: Task['status'], reason?: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, blockReason: reason || t.blockReason } : t));
  };

  const handleConfirmBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingTaskId || !reasonText.trim()) return;

    updateTaskStatus(blockingTaskId, 'Blocked', reasonText);
    setBlockingTaskId(null);
    setReasonText('');
  };
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const columns: Task['status'][] = ['To Do', 'In Progress', 'Review Queue', 'Completed', 'Blocked'];

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans antialiased bg-[var(--color-bg-right)] text-[oklch(15%_0.02_320)]">sc
      <aside className="w-60 bg-[var(--color-bg-left)] border-r border-[oklch(90%_0.02_320)] flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="p-1.5 rounded-sm bg-[oklch(15%_0.02_320)] text-white">
              <CheckSquare size={16} />
            </div>
            <div>
              <span className="font-bold tracking-tight text-xs block">Developer Workspace</span>
              <span className="text-[10px] font-mono text-gray-500 uppercase">{role} Role</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${activeTab === 'board' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <CheckSquare size={14} />
              <span>Dashboard / Kanban</span>
            </button>

            <button 
              onClick={() => setActiveTab('my-tasks')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${activeTab === 'my-tasks' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <Search size={14} />
              <span>My Tasks & Search</span>
            </button>

            <button 
              onClick={() => setActiveTab('project')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${activeTab === 'project' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <FolderKanban size={14} />
              <span>Project Information</span>
            </button>

            <button 
              onClick={() => setActiveTab('lifecycle')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${activeTab === 'lifecycle' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <LayoutList size={14} />
              <span>Workflow Rules</span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-[oklch(15%_0.02_320)] text-[oklch(80%_0.14_20)] font-bold' : 'text-gray-700 hover:bg-gray-200/50'}`}
            >
              <Shield size={14} />
              <span>Profile & Permissions</span>
            </button>
          </nav>
        </div>

        {/* Account Footer */}
        <div className="pt-4 border-t border-[oklch(90%_0.02_320)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-gray-300 flex items-center justify-center font-bold text-[11px]">
              <User size={12} />
            </div>
            <div>
              <p className="text-[11px] font-bold">Developer User</p>
              <p className="text-[9px] font-mono text-gray-500">dev@flowboard.io</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="p-1.5 rounded-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-14 border-b border-[oklch(90%_0.02_320)] px-6 flex items-center justify-between bg-[var(--color-bg-left)]">
          <h1 className="text-xs font-bold uppercase tracking-wide font-mono">
            {activeTab === 'board' && 'Developer Kanban Dashboard'}
            {activeTab === 'my-tasks' && 'Assigned Tasks Explorer & Filters'}
            {activeTab === 'project' && 'Allowed Project Specifications'}
            {activeTab === 'lifecycle' && 'Task State Transition Guidelines'}
            {activeTab === 'settings' && 'User Profile & Access Control Matrix'}
          </h1>
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-sm border border-[oklch(90%_0.02_320)] font-bold">
            Total Backlog: {tasks.length}
          </span>
        </header>

        {/* KANBAN BOARD VIEW */}
        {activeTab === 'board' && (
          <div className="flex-1 p-6 overflow-x-auto bg-[var(--color-bg-right)]">
            <div className="grid grid-cols-5 gap-3 h-full min-w-[1150px]">
              {columns.map(statusCol => {
                const colTasks = tasks.filter(t => t.status === statusCol);
                return (
                  <div key={statusCol} className="flex flex-col bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)] overflow-hidden h-full">
                    <div className="px-3 py-2.5 border-b border-[oklch(90%_0.02_320)] bg-white flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">{statusCol}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[var(--color-bg-right)] border border-[oklch(90%_0.02_320)] font-bold">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                      {colTasks.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-xs font-mono bg-white/40 border border-dashed border-[oklch(88%_0.02_320)] rounded-sm my-1">
                          No tasks
                        </div>
                      ) : (
                        colTasks.map(task => (
                          <div key={task.id} className="bg-white rounded-sm p-4 border border-[oklch(90%_0.02_320)] space-y-3 shadow-none hover:border-gray-400 transition-all font-sans">
                            <div className="flex items-center justify-between">
                              <button 
                                onClick={() => setSelectedTaskDetails(task)}
                                className="text-[11px] font-mono font-bold text-blue-700 hover:underline cursor-pointer"
                              >
                                {task.id}
                              </button>
                              <Badge label={task.priority} type="priority" />
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-gray-900 leading-tight">{task.title}</h4>
                              <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{task.description}</p>
                            </div>

                            {task.status === 'Blocked' && task.blockReason && (
                              <div className="p-2.5 rounded-sm bg-red-50 border border-red-200 text-[11px] text-red-900 space-y-1 font-mono">
                                <div className="flex items-center gap-1.5 font-bold text-red-700">
                                  <AlertOctagon size={13} />
                                  <span>BLOCKED:</span>
                                </div>
                                <p className="text-gray-800 font-sans italic text-[10px]">"{task.blockReason}"</p>
                              </div>
                            )}

                            {task.status === 'Review Queue' && task.reviewFeedback && (
                              <div className="p-2.5 rounded-sm bg-purple-50 border border-purple-200 text-[11px] text-purple-900 space-y-1 font-mono">
                                <span className="font-bold text-purple-700 block">REVIEW FEEDBACK:</span>
                                <p className="text-gray-800 font-sans italic text-[10px]">"{task.reviewFeedback}"</p>
                              </div>
                            )}

                            <div className="pt-3 border-t border-[oklch(93%_0.01_320)] flex items-center justify-between text-[11px] font-mono">
                              <span className="text-[10px] font-bold text-gray-500">{task.assignee}</span>

                              <div className="flex items-center gap-1.5">
                                {task.status !== 'Blocked' && (
                                  <button 
                                    onClick={() => setBlockingTaskId(task.id)}
                                    className="px-2 py-1 rounded-sm text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 font-bold transition-all cursor-pointer text-[10px]"
                                  >
                                    Block
                                  </button>
                                )}

                                {task.status === 'To Do' && (
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, 'In Progress')}
                                    className="px-2.5 py-1 rounded-sm bg-gray-900 text-[oklch(80%_0.14_20)] font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                                  >
                                    Start →
                                  </button>
                                )}

                                {task.status === 'In Progress' && (
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, 'Review Queue')}
                                    className="px-2.5 py-1 rounded-sm bg-purple-900 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                                  >
                                    Review →
                                  </button>
                                )}

                                {task.status === 'Review Queue' && (
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, 'Completed')}
                                    className="px-3 py-1 rounded-sm bg-green-700 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                                  >
                                    Complete ✓
                                  </button>
                                )}

                                {task.status === 'Blocked' && (
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, 'In Progress')}
                                    className="px-3 py-1 rounded-sm bg-amber-600 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                                  >
                                    Resume ↺
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MY TASKS VIEW */}
        {activeTab === 'my-tasks' && (
          <div className="flex-1 p-6 overflow-y-auto bg-[var(--color-bg-right)] space-y-4">
            <div className="bg-white p-4 rounded-sm border border-[oklch(90%_0.02_320)] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <Search size={15} className="text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by task ID or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-input)] px-3 py-1.5 rounded-sm border border-[oklch(90%_0.02_320)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Filter size={14} className="text-gray-500" />
                  <span className="text-[11px] text-gray-600">Status:</span>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white px-2 py-1 rounded-sm border border-[oklch(90%_0.02_320)] text-xs font-bold"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review Queue">Review Queue</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-600">Priority:</span>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-white px-2 py-1 rounded-sm border border-[oklch(90%_0.02_320)] text-xs font-bold"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm border border-[oklch(90%_0.02_320)] overflow-hidden font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-bg-left)] border-b border-[oklch(90%_0.02_320)] text-[11px] font-mono uppercase text-gray-600">
                    <th className="p-3">Task ID</th>
                    <th className="p-3">Title & Description</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status Stage</th>
                    <th className="p-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(92%_0.01_320)] text-xs">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-mono">No tasks match your search criteria.</td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-gray-700">{task.id}</td>
                        <td className="p-3">
                          <p className="font-bold text-gray-900">{task.title}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{task.description}</p>
                        </td>
                        <td className="p-3"><Badge label={task.priority} type="priority" /></td>
                        <td className="p-3 font-mono text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded-sm bg-gray-100 border border-gray-200">{task.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => setSelectedTaskDetails(task)}
                            className="px-3 py-1 rounded-sm bg-gray-900 text-white font-mono text-[10px] font-bold hover:bg-gray-800 cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROJECT INFORMATION VIEW */}
        {activeTab === 'project' && (
          <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-bg-right)] flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-sm border border-[oklch(90%_0.02_320)] max-w-xl w-full space-y-5 font-sans shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <FolderKanban className="text-gray-800" size={20} />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">Flowboard Enterprise Workspace Spec</h3>
              </div>
              <div className="space-y-3 font-mono text-xs text-gray-700">
                <div className="p-3 bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)]">
                  <strong>Repository:</strong> github.com/flowboard-io/flowboard_frontend
                </div>
                <div className="p-3 bg-[var(--color-bg-left)] rounded-sm border border-[oklch(90%_0.02_320)]">
                  <strong>Allowed Environment:</strong> Staging Cluster US-East (Protected)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW RULES */}
        {activeTab === 'lifecycle' && (
          <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-bg-right)] flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-sm border border-[oklch(90%_0.02_320)] max-w-xl w-full text-center space-y-6 font-sans">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Developer Pipeline Lifecycle Rules</h2>
              <div className="space-y-3 font-mono text-xs text-left">
                <div className="p-2.5 bg-[var(--color-bg-left)] border border-[oklch(90%_0.02_320)] rounded-sm">
                  <strong>1. Start Task:</strong> Move assigned tasks from To Do to In Progress.
                </div>
                <div className="p-2.5 bg-[var(--color-bg-left)] border border-[oklch(90%_0.02_320)] rounded-sm">
                  <strong>2. Review Submission:</strong> Submit completed code to the Review Queue for verification.
                </div>
                <div className="p-2.5 bg-[var(--color-bg-left)] border border-[oklch(90%_0.02_320)] rounded-sm">
                  <strong>3. Final Completion:</strong> Transition verified items to Completed.
                </div>
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-sm">
                  <strong>4. Impediments:</strong> Report blockers with detailed notes for Scrum Master review.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS & PERMISSIONS VIEW */}
        {activeTab === 'settings' && (
          <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-bg-right)] flex flex-col items-center justify-center">
            <RolePermissions />
          </div>
        )}
      </main>

      {/* TASK DETAILS MODAL */}
      {selectedTaskDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm p-6 max-w-lg w-full border border-[oklch(90%_0.02_320)] space-y-4 font-sans shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-700">{selectedTaskDetails.id}</span>
                <Badge label={selectedTaskDetails.priority} type="priority" />
              </div>
              <button onClick={() => setSelectedTaskDetails(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">{selectedTaskDetails.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed bg-[var(--color-bg-left)] p-3 rounded-sm border border-[oklch(90%_0.02_320)]">{selectedTaskDetails.description}</p>
              
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-2.5 bg-gray-50 rounded-sm border border-gray-200">
                  <span className="text-gray-500 block text-[10px]">CURRENT STATUS</span>
                  <strong className="text-gray-800">{selectedTaskDetails.status}</strong>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-sm border border-gray-200">
                  <span className="text-gray-500 block text-[10px]">ASSIGNEE</span>
                  <strong className="text-gray-800">{selectedTaskDetails.assignee}</strong>
                </div>
              </div>

              {selectedTaskDetails.reviewFeedback && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-sm text-xs font-mono space-y-1">
                  <span className="font-bold text-purple-800 block">Reviewer Feedback:</span>
                  <p className="text-gray-700 font-sans italic">"{selectedTaskDetails.reviewFeedback}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setSelectedTaskDetails(null)}
                className="px-4 py-2 rounded-sm bg-gray-900 text-white text-xs font-mono font-bold hover:bg-gray-800 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK IMPEDIMENT MODAL */}
      {blockingTaskId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full border border-[oklch(90%_0.02_320)] space-y-4 font-sans shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-700">Report Task Impediment</h3>
              <button onClick={() => setBlockingTaskId(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmBlock} className="space-y-3">
              <p className="text-xs text-gray-700">Provide a clear reason why task <span className="font-mono font-bold text-gray-900">{blockingTaskId}</span> is blocked so the Scrum Master can resolve it.</p>
              
              <textarea 
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="e.g., Missing API endpoint documentation or staging database timeout..."
                required
                rows={3}
                className="w-full rounded-sm p-3 text-xs bg-[var(--color-input)] border border-[oklch(90%_0.02_320)] focus:outline-none focus:ring-1 focus:ring-[oklch(15%_0.02_320)] font-sans"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setBlockingTaskId(null)}
                  className="px-3 py-2 rounded-sm border border-[oklch(90%_0.02_320)] text-xs font-mono text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-red-700 text-white text-xs font-mono font-bold hover:bg-red-800 cursor-pointer"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}