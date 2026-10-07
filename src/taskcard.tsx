import React from 'react';
import type { Task, User } from './types';

interface TaskCardProps {
  task: Task;
  assignees: Record<string, User>;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const priorityColors: Record<Task['priority'], string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-green-100 text-green-800 border-green-300',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, assignees, onStatusChange }) => {
  const isBlocked = task.status === 'BLOCKED';
  const assignedUser = task.assignedUserId ? assignees[task.assignedUserId] : null;

  return (
    <div className={`p-4 mb-3 bg-white rounded shadow-sm border-l-4 ${isBlocked ? 'border-red-500' : 'border-blue-500'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {assignedUser ? (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700" title={assignedUser.name}>
              {assignedUser.name.charAt(0)}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Unassigned</span>
          )}
        </div>
        
        {/* Quick actions for Scrum Master */}
        <select 
          className="text-xs bg-gray-50 border border-gray-200 rounded p-1"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
        >
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>
  );
};