import React, { useState, useMemo } from 'react';
import type { Task, Status, User } from './types';
import { AgileBoard } from './board';

// Mock data injection (replace with API calls)
const MOCK_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'Alice Smith', role: 'DEVELOPER' },
  'u2': { id: 'u2', name: 'Bob Jones', role: 'DEVELOPER' },
};

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Setup Authentication', description: 'Implement JWT auth', assignedUserId: 'u1', createdById: 'admin1', priority: 'CRITICAL', status: 'IN_PROGRESS', dueDate: null, acceptanceCriteria: [], activityHistory: [] },
  { id: 't2', title: 'Design DB Schema', description: 'Postgres schema design', assignedUserId: 'u2', createdById: 'admin1', priority: 'HIGH', status: 'BLOCKED', dueDate: null, acceptanceCriteria: [], activityHistory: [] },
  { id: 't3', title: 'Create Navigation', description: 'Sidebar and topbar routing', assignedUserId: null, createdById: 'admin1', priority: 'MEDIUM', status: 'BACKLOG', dueDate: null, acceptanceCriteria: [], activityHistory: [] },
];

export const ScrumMasterDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'BOARD' | 'BACKLOG'>('BOARD');
  const [filterUser, setFilterUser] = useState<string>('ALL');

  // Handle status updates (CRUD: Update)
  const handleStatusChange = (taskId: string, newStatus: Status) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Filter accessible tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterUser !== 'ALL' && task.assignedUserId !== filterUser) return false;
      return true;
    });
  }, [tasks, filterUser]);

  const activeBoardTasks = filteredTasks.filter(t => t.status !== 'BACKLOG');
  const backlogTasks = filteredTasks.filter(t => t.status === 'BACKLOG');

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header & Controls */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Scrum Master Workspace</h1>
          <p className="text-sm text-gray-500">Manage development work, backlog, and team progress.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="ALL">All Developers</option>
            <option value="UNASSIGNED">Unassigned</option>
            {Object.values(MOCK_USERS).map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            + Create Task
          </button>
        </div>
      </header>

      {/* View Toggle */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex space-x-6">
        <button 
          onClick={() => setActiveTab('BOARD')}
          className={`pb-2 text-sm font-medium ${activeTab === 'BOARD' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active Sprint Board
        </button>
        <button 
          onClick={() => setActiveTab('BACKLOG')}
          className={`pb-2 text-sm font-medium ${activeTab === 'BACKLOG' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Product Backlog ({backlogTasks.length})
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6">
        {activeTab === 'BOARD' ? (
          <AgileBoard 
            tasks={activeBoardTasks} 
            users={MOCK_USERS} 
            onStatusChange={handleStatusChange} 
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backlogTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{task.priority}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedUserId ? MOCK_USERS[task.assignedUserId]?.name : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleStatusChange(task.id, 'TODO')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Move to Sprint
                      </button>
                    </td>
                  </tr>
                ))}
                {backlogTasks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Backlog is empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};