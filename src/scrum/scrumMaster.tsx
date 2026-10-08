import React, { useState, useMemo } from 'react';
import type { Task, Status, User, Priority } from '../types';


const FRONTEND_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'kal', role: 'Developer' },
  'u2': { id: 'u2', name: 'beti', role: 'Developer' },
};

const INITIAL_TASKS: Task[] = []; 

export default function ScrumMaster() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'BOARD' | 'BACKLOG'>('BOARD');
  const [filterUserId, setFilterUserId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleStatusChange = (taskId: string, newStatus: Status) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const newLogEntry = {
          action: `Moved task to ${newStatus}`,
          timestamp: new Date().toLocaleString(),
          userId: 'Scrum Master (Admin)' 
        };
        return { 
          ...task, 
          status: newStatus,
          activityHistory: [...(task.activityHistory || []), newLogEntry]
        };
      }
      return task;
    }));
  };
  const handleAssignUser = (taskId: string, userId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, assignedUserId: userId || null } : task
    ));
  };
  const handleMoveToSprint = (taskId: string) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove?.assignedUserId) {
      alert("⚠️ Please assign this task to a developer before moving it to the To Do column.");
      return; 
    }

    handleStatusChange(taskId, 'To Do');
    setActiveTab('BOARD'); 
  };
  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const criteriaString = formData.get('acceptanceCriteria') as string;
    const criteriaArray = criteriaString ? criteriaString.split('\n').filter(line => line.trim() !== '') : [];

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as Priority,
      status: formData.get('status') as Status,
      assignedUserId: formData.get('assignedUserId') as string || null,
      dueDate: formData.get('dueDate') as string || null,
      acceptanceCriteria: criteriaArray,
      createdById: 'current_scrum_master_id', 
      activityHistory: [{
        action: 'Task Created',
        timestamp: new Date().toLocaleString(),
        userId: 'Scrum Master (Admin)'
      }]
    };

    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
    
    if (newTask.status === 'Backlog' || newTask.status === 'BACKLOG') {
      setActiveTab('BACKLOG');
    }
  };
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterUserId !== 'ALL' && task.assignedUserId !== filterUserId) return false;
      return true;
    });
  }, [tasks, filterUserId]);

  const activeBoardTasks = filteredTasks.filter(t => t.status !== 'Backlog' && t.status !== 'BACKLOG');
  const backlogTasks = filteredTasks.filter(t => t.status === 'Backlog' || t.status === 'BACKLOG');

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Scrum Master Workspace</h1>
          <p className="text-sm text-gray-500">Manage development work, backlog, and team progress.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-600">Assignee Filter:</label>
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#284B38] bg-gray-50 cursor-pointer"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
          >
            <option value="ALL">All Developers</option>
            {Object.values(FRONTEND_USERS).map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#284B38] hover:bg-[#1E3A2B] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            + Create Task
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex space-x-6">
        <button 
          onClick={() => setActiveTab('BOARD')}
          className={`pb-2 text-sm font-medium ${activeTab === 'BOARD' ? 'border-b-2 border-[#284B38] text-[#284B38]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active Sprint Board
        </button>
        <button 
          onClick={() => setActiveTab('BACKLOG')}
          className={`pb-2 text-sm font-medium ${activeTab === 'BACKLOG' ? 'border-b-2 border-[#284B38] text-[#284B38]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Product Backlog ({backlogTasks.length})
        </button>
      </div>
      <main className="flex-1 overflow-hidden p-6 bg-gray-50">
        {activeTab === 'BOARD' ? (
          <AgileBoard tasks={activeBoardTasks} users={FRONTEND_USERS} onStatusChange={handleStatusChange} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backlogTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{task.priority}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.dueDate || 'No Date'}</td>
                    
                    {/* NEW ASSIGNEE DROPDOWN */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <select 
                        className="border border-gray-300 rounded p-1 text-sm bg-white cursor-pointer"
                        value={task.assignedUserId || ""}
                        onChange={(e) => handleAssignUser(task.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {Object.values(FRONTEND_USERS).map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button 
                        onClick={() => handleMoveToSprint(task.id)}
                        className="text-[#284B38] hover:text-[#1E3A2B] font-semibold bg-[#284B38]/10 px-3 py-1 rounded transition-colors"
                      >
                        Move to To Do →
                      </button>
                    </td>
                  </tr>
                ))}
                {backlogTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">The backlog is currently empty. Click "+ Create Task" to add one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input required name="title" type="text" className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#284B38]" placeholder="e.g. Implement Login API" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" className="w-full border border-gray-300 rounded-md p-2 bg-white">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required name="description" rows={3} className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#284B38]"></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Status</label>
                  <select name="status" className="w-full border border-gray-300 rounded-md p-2 bg-white">
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Developer</label>
                  <select name="assignedUserId" className="w-full border border-gray-300 rounded-md p-2 bg-white">
                    <option value="">Unassigned</option>
                    {Object.values(FRONTEND_USERS).map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input name="dueDate" type="date" className="w-full border border-gray-300 rounded-md p-2 text-gray-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Criteria (One per line)</label>
                <textarea name="acceptanceCriteria" rows={2} className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#284B38]"></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#284B38] rounded-md hover:bg-[#1E3A2B]">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}