import React, { useState, useMemo } from 'react';
import { CheckSquare, LogOut, Search, Filter, FolderKanban, XCircle, User as UserIcon, BarChart3, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Board from '../../componets/agile/board';
import TaskModal from '../tasks/taskmodel';
import UserProfile from './userprofile';
import { usePermissions } from '../../context/permision';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { role } = usePermissions();
  const [activeTab, setActiveTab] = useState<'board' | 'my-tasks' | 'project' | 'lifecycle' | 'profile'>('board');
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('flowboard_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 'FB-201', title: 'Refactor authentication state hook', description: 'Ensure token persistence across session expiration.', priority: 'High', status: 'To Do', assignee: 'Developer User' },
      { id: 'FB-202', title: 'Implement Tailwind v4 layout grid', description: 'Fix asymmetrical sidebar padding ratios.', priority: 'Critical', status: 'In Progress', assignee: 'Developer User' },
      { id: 'FB-203', title: 'Optimize OKLCH design tokens', description: 'Audit color scales for accessibility compliance.', priority: 'Medium', status: 'Review Queue', assignee: 'Developer User' }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const updateTaskStatus = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleUpdateTaskModal = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-gray-900 text-gray-100">
      
      {/* CONSISTENT SIDEBAR */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="p-1.5 rounded bg-blue-600 text-white">
              <CheckSquare size={16} />
            </div>
            <div>
              <span className="font-bold text-xs block text-white">Developer Workspace</span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">{role}</span>
            </div>
          </div>
          <nav className="space-y-1 text-xs font-medium">
            <button onClick={() => setActiveTab('board')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-colors ${activeTab === 'board' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-300'}`}><CheckSquare size={14} /> Kanban Board</button>
            <button onClick={() => setActiveTab('my-tasks')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-colors ${activeTab === 'my-tasks' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-300'}`}><BarChart3 size={14} /> My Tasks & Search</button>
            <button onClick={() => setActiveTab('project')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-colors ${activeTab === 'project' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-300'}`}><FolderKanban size={14} /> Project Info</button>
            <button onClick={() => setActiveTab('lifecycle')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-colors ${activeTab === 'lifecycle' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-300'}`}><AlertOctagon size={14} /> Workflow Rules</button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-300'}`}><UserIcon size={14} /> Profile & Security</button>
          </nav>
        </div>
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded text-xs font-mono cursor-pointer transition-colors"><LogOut size={14} /> Logout</button>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-900">
        <header className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-gray-900 shrink-0">
          <h1 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-200">
            {activeTab === 'board' && 'Assigned Kanban Board'}
            {activeTab === 'my-tasks' && 'My Tasks Explorer'}
            {activeTab === 'project' && 'Project Specifications'}
            {activeTab === 'lifecycle' && 'Workflow & Blocker Rules'}
            {activeTab === 'profile' && 'User Account Profile'}
          </h1>
          <span className="text-xs font-mono bg-gray-800 px-2.5 py-1 rounded text-gray-300 font-bold border border-gray-700">Assigned Tasks: {tasks.length}</span>
        </header>

        {activeTab === 'board' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 flex-wrap flex-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 font-bold">
                  <Filter size={14} />
                  <span>Filter Work:</span>
                </div>
                <div className="relative min-w-[220px]">
                  <Search size={12} className="absolute left-2.5 top-3 text-gray-400" />
                  <input type="text" placeholder="Search ID or title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-7 pr-3 py-1.5 border border-gray-700 rounded text-xs bg-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="py-1.5 px-3 border border-gray-700 rounded bg-gray-800 text-xs font-mono font-bold text-gray-200 cursor-pointer">
                  <option value="ALL">Status: All</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review Queue">Review Queue</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="py-1.5 px-3 border border-gray-700 rounded bg-gray-800 text-xs font-mono font-bold text-gray-200 cursor-pointer">
                  <option value="ALL">Priority: All</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 font-mono font-bold rounded text-xs hover:bg-gray-700 cursor-pointer border border-gray-700">
                  <XCircle size={13} /> Reset
                </button>
              )}
            </div>

            <Board tasks={filteredTasks} onUpdateStatus={updateTaskStatus} onSelectTask={setSelectedTask} />
          </div>
        )}

        {activeTab === 'my-tasks' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-900 space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-900 border-b border-gray-700 font-mono uppercase text-gray-400">
                  <tr><th className="p-3">Task ID</th><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTasks.map(t => (
                    <tr key={t.id} className="hover:bg-gray-700/50">
                      <td className="p-3 font-mono font-bold text-blue-400">{t.id}</td>
                      <td className="p-3 font-medium text-white">{t.title}</td>
                      <td className="p-3 font-mono text-gray-300">{t.status}</td>
                      <td className="p-3 text-right"><button onClick={() => setSelectedTask(t)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-[10px] font-bold cursor-pointer">View Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'project' && <div className="flex-1 p-8 bg-gray-900 flex justify-center items-center"><div className="bg-gray-800 p-6 border border-gray-700 rounded-lg max-w-lg w-full space-y-2"><h3 className="font-mono font-bold text-xs text-white">Project Specs</h3><p className="text-xs text-gray-400">github.com/flowboard-io/flowboard_frontend</p></div></div>}
        {activeTab === 'lifecycle' && <div className="flex-1 p-8 bg-gray-900 flex justify-center items-center"><div className="bg-gray-800 p-6 border border-gray-700 rounded-lg max-w-lg w-full space-y-2"><h3 className="font-mono font-bold text-xs text-white">Workflow Rules</h3><p className="text-xs text-gray-400">Move tasks from To Do to In Progress, submit for review, or report blockers as needed.</p></div></div>}
        {activeTab === 'profile' && <UserProfile />}
      </main>

      {/* MODAL VIEW */}
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTaskModal} />
      )}

    </div>
  );
}