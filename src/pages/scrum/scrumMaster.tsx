import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, AlertOctagon, CheckCircle2, BarChart3, Users, FolderKanban, RotateCcw, Search, Check, X, Archive, LogOut } from 'lucide-react';
import Navbar from '../../Layout/navbar';
import Sidebar from '../../Layout/sidebar';
import TaskFormModal from './TaskModel';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  dueDate?: string;
  isArchived?: boolean;
}

export default function ScrumMasterDashboard() {
  const [activeTab, setActiveTab] = useState<'backlog' | 'todo' | 'inprogress' | 'review' | 'completed' | 'blocked' | 'reports' | 'team' | 'archive'>('backlog');

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('flowboard_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 'FB-201', title: 'Refactor authentication state hook', description: 'Ensure token persistence.', priority: 'High', status: 'Backlog', assignee: 'Developer User', dueDate: '2026-10-15' },
      { id: 'FB-202', title: 'Implement Tailwind v4 layout grid', description: 'Fix sidebar padding ratios.', priority: 'Critical', status: 'To Do', assignee: 'Developer User', dueDate: '2026-10-10' },
      { id: 'FB-203', title: 'Optimize OKLCH design tokens', description: '', priority: 'Medium', status: 'Review Queue', assignee: 'malefiya', dueDate: '2026-10-12' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('flowboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState<Task['status']>('Backlog');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');

  const handleOpenCreateModal = (status: Task['status'] = 'Backlog') => {
    setEditingTask(null);
    setDefaultStatusForNewTask(status);
    setIsModalOpen(true);
  };

  const handleSaveTask = (data: { id: string; title: string; description: string; priority: any; status: any; assignee: string; dueDate: string }) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t));
    } else {
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        assignee: data.assignee,
        dueDate: data.dueDate,
        isArchived: false
      };
      setTasks(prev => [...prev, newTask]);
    }
    setEditingTask(null);
  };

  const handleSoftDelete = () => {
    if (!taskToDelete) return;
    setTasks(prev => prev.map(t => t.id === taskToDelete.id ? { ...t, isArchived: true } : t));
    setTaskToDelete(null);
  };

  const handleRestoreTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
  };

  const handlePermanentDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleReviewAction = (id: string, newStatus: 'Completed' | 'In Progress') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const activeTasks = tasks.filter(t => !t.isArchived);
  const archivedTasks = tasks.filter(t => t.isArchived);

  const filteredTasks = activeTasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'All' || t.assignee === filterAssignee;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const backlogTasks = filteredTasks.filter(t => t.status === 'Backlog');
  const todoTasks = filteredTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
  const reviewTasks = filteredTasks.filter(t => t.status === 'Review Queue');
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed');
  const blockedTasks = filteredTasks.filter(t => t.status === 'Blocked');

  const tabConfig: Record<string, { label: string; status: Task['status']; list: Task[] }> = {
    backlog: { label: 'Backlog', status: 'Backlog', list: backlogTasks },
    todo: { label: 'To Do', status: 'To Do', list: todoTasks },
    inprogress: { label: 'In Progress', status: 'In Progress', list: inProgressTasks },
    review: { label: 'Review Queue', status: 'Review Queue', list: reviewTasks },
    completed: { label: 'Completed', status: 'Completed', list: completedTasks },
    blocked: { label: 'Blocked', status: 'Blocked', list: blockedTasks },
  };

  const showAddCard = activeTab === 'backlog' || activeTab === 'todo';

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#0F172A] text-gray-100">
      {/* SIDEBAR WITH VERTICAL MANAGEMENT LINKS */}
      <aside className="w-64 bg-[#090D16] border-r border-gray-800 flex flex-col justify-between shrink-0 font-sans text-gray-100">
        <div className="p-4 border-b border-gray-800 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <CheckCircle2 size={16} />
            </div>
            <span className="font-bold text-xs uppercase font-mono tracking-wider text-white">FlowBoard Enterprise</span>
          </div>
          <p className="text-[10px] font-mono text-gray-400 pl-9">Scrum Master Console</p>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-[10px] font-mono uppercase text-gray-500 tracking-wider px-3 pb-1">Management</div>
          
          <button 
            onClick={() => setActiveTab('backlog')} 
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${['backlog', 'todo', 'inprogress', 'review', 'completed', 'blocked'].includes(activeTab) ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800/60'}`}
          >
            <FolderKanban size={16} /> Scrum Master View
          </button>

          <button 
            onClick={() => setActiveTab('reports')} 
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800/60'}`}
          >
            <BarChart3 size={16} /> Reports
          </button>

          <button 
            onClick={() => setActiveTab('team')} 
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${activeTab === 'team' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800/60'}`}
          >
            <Users size={16} /> Team Profiles
          </button>

          <button 
            onClick={() => setActiveTab('archive')} 
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${activeTab === 'archive' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800/60'}`}
          >
            <Archive size={16} /> Archive Audit Log ({archivedTasks.length})
          </button>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => window.location.href = '/login'} 
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-mono cursor-pointer transition-colors px-2 py-1"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-[#0F172A]">
        <Navbar title="Scrum Master & Team Manager Console" />

        {/* WORKFLOW NAVIGATION TABS (ONLY ACTIVE WORKFLOW STATES) */}
        <div className="bg-[#0F172A] border-b border-gray-800 px-6 py-3 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between overflow-x-auto pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(tabConfig).map(([key, config]) => (
                <button 
                  key={key} 
                  onClick={() => setActiveTab(key as any)} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${activeTab === key ? 'bg-blue-600 text-white font-bold shadow-sm' : 'bg-[#1E293B] text-gray-300 hover:bg-gray-700'}`}
                >
                  {config.label} ({config.list.length})
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleOpenCreateModal('Backlog')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm shrink-0"
            >
              <Plus size={14} /> Create Task
            </button>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          {activeTab !== 'reports' && activeTab !== 'team' && activeTab !== 'archive' && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-800/60 text-xs">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search task ID or title..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#1E293B] border border-gray-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="text-gray-400 text-[11px]">Priority:</span>
                <select 
                  value={filterPriority} 
                  onChange={e => setFilterPriority(e.target.value)} 
                  className="bg-[#1E293B] border border-gray-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="text-gray-400 text-[11px]">Assignee:</span>
                <select 
                  value={filterAssignee} 
                  onChange={e => setFilterAssignee(e.target.value)} 
                  className="bg-[#1E293B] border border-gray-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="All">All Assignees</option>
                  <option value="Developer User">Developer User</option>
                  <option value="malefiya">malefiya</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT RENDERER */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'reports' ? (
            <div className="space-y-4 max-w-sm">
              <h3 className="text-sm font-bold uppercase font-mono text-white tracking-wider flex items-center gap-2">
                <BarChart3 size={16}/> Team Progress & Workload Reports
              </h3>

              <div className="flex flex-col space-y-3 font-mono text-xs">
                <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">Workload</span>
                  <h4 className="text-xs font-bold text-white">Active Tasks: {activeTasks.length}</h4>
                  <p className="text-[11px] text-gray-400">To Do: {todoTasks.length} | In Progress: {inProgressTasks.length}</p>
                </div>

                <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">Quality Control</span>
                  <h4 className="text-xs font-bold text-white">Review Queue: {reviewTasks.length}</h4>
                  <p className="text-[11px] text-gray-400">Deliverables awaiting Scrum Master review or approval.</p>
                </div>

                <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded">Velocity</span>
                  <h4 className="text-xs font-bold text-white">Completed Work: {completedTasks.length}</h4>
                  <p className="text-[11px] text-gray-400">Successfully approved and finalized deliverables.</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'team' ? (
            <div className="space-y-4 max-w-sm font-mono text-xs">
              <h3 className="text-sm font-bold uppercase font-mono text-white tracking-wider flex items-center gap-2">
                <Users size={16} /> Team Profiles & Workload
              </h3>

              <div className="flex flex-col space-y-3">
                <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Developer User</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px]">Active</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Assigned Tasks: {activeTasks.filter(t => t.assignee === 'Developer User').length}</p>
                </div>

                <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-800 space-y-2 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">malefiya</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px]">Active</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Assigned Tasks: {activeTasks.filter(t => t.assignee === 'malefiya').length}</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'archive' ? (
            <div className="space-y-4 max-w-sm">
              <h3 className="text-sm font-bold uppercase font-mono text-white tracking-wider">
                Archive Audit Log ({archivedTasks.length})
              </h3>

              <div className="flex flex-col space-y-3">
                {archivedTasks.length === 0 ? (
                  <p className="text-xs font-mono text-gray-400 p-4 bg-[#1E293B] rounded-xl border border-gray-800 shadow-lg">No archived tasks.</p>
                ) : (
                  archivedTasks.map(t => (
                    <div key={t.id} className="bg-[#1E293B] border border-gray-800 rounded-xl p-4 flex flex-col space-y-2 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono font-bold text-red-400">{t.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">{t.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{t.title}</h4>
                      <div className="pt-2 border-t border-gray-800 flex justify-end gap-1.5">
                        <button onClick={() => handleRestoreTask(t.id)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer">
                          Restore
                        </button>
                        <button onClick={() => handlePermanentDelete(t.id)} className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'review' ? (
            <div className="space-y-4 max-w-sm">
              <h3 className="text-sm font-bold uppercase font-mono text-white tracking-wider">
                Work Review Queue ({reviewTasks.length})
              </h3>
              <div className="flex flex-col space-y-3">
                {reviewTasks.length === 0 ? (
                  <p className="text-xs font-mono text-gray-400 p-4 bg-[#1E293B] rounded-xl border border-gray-800 shadow-lg">No items waiting for review.</p>
                ) : (
                  reviewTasks.map(t => (
                    <div key={t.id} className="bg-[#1E293B] border border-gray-800 rounded-xl p-4 flex flex-col space-y-3 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono font-bold text-blue-400">{t.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">Assignee: {t.assignee}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{t.title}</h4>
                        <p className="text-[11px] text-gray-400">{t.description || 'No description provided.'}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-800 flex justify-end gap-2 font-mono">
                        <button onClick={() => handleReviewAction(t.id, 'In Progress')} className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer">
                          Changes
                        </button>
                        <button onClick={() => handleReviewAction(t.id, 'Completed')} className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold cursor-pointer">
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-sm">
              <div className="flex justify-between items-center pt-2">
                <h3 className="text-sm font-bold uppercase font-mono text-white tracking-wider">
                  {tabConfig[activeTab].label} <span className="text-gray-400 font-normal">({tabConfig[activeTab].list.length})</span>
                </h3>
              </div>

              {/* VERTICAL STACK CONTAINER */}
              <div className="flex flex-col space-y-3">
                {showAddCard && (
                  <div 
                    onClick={() => handleOpenCreateModal(tabConfig[activeTab].status)}
                    className="bg-[#1E293B]/50 hover:bg-[#1E293B] border-2 border-dashed border-gray-700/80 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all h-[110px] group shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1E293B] group-hover:bg-blue-600 flex items-center justify-center text-gray-300 group-hover:text-white transition-colors mb-1.5 shadow-sm">
                      <Plus size={16} />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                      Add task
                    </span>
                  </div>
                )}

                {tabConfig[activeTab].list.map(t => (
                  <div 
                    key={t.id} 
                    className={`bg-[#1E293B] border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-2.5 shadow-lg hover:border-gray-700 transition-colors relative overflow-hidden`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      t.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />

                    <div className="flex justify-between items-center pl-1">
                      <span className="text-[11px] font-mono font-bold text-blue-400">{t.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        t.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{t.priority}</span>
                    </div>
                    <div className="pl-1">
                      <h4 className="text-xs font-bold text-white">{t.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">{t.description || 'No description provided.'}</p>
                    </div>
                    <div className="pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono pl-1">
                      <span className="text-gray-300">Assignee: {t.assignee}</span>
                      <div className="space-x-1.5">
                        <button onClick={() => { setEditingTask(t); setIsModalOpen(true); }} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-bold cursor-pointer transition-colors">Edit</button>
                        <button onClick={() => setTaskToDelete(t)} className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onSave={handleSaveTask} 
        initialData={editingTask || { id: '', title: '', description: '', priority: 'Medium', status: defaultStatusForNewTask, assignee: '', dueDate: '' }}
      />

      {taskToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-[#1E293B] text-gray-100 p-6 rounded-xl max-w-sm w-full space-y-4 border border-gray-800 shadow-2xl font-mono text-xs">
            <h3 className="font-bold uppercase text-white">Confirm Archive</h3>
            <p className="text-gray-300 font-sans">Move task <strong className="text-red-400 font-mono">{taskToDelete.id}</strong> to the Archive Audit Log?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setTaskToDelete(null)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer">Cancel</button>
              <button onClick={handleSoftDelete} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer">Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}