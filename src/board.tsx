
import React from 'react';
import type { Task, Status, User } from './types';
import { TaskCard } from './taskcard';

interface AgileBoardProps {
  tasks: Task[];
  users: Record<string, User>;
  onStatusChange: (taskId: string, newStatus: Status) => void;
}

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'BLOCKED', title: 'Blocked' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'COMPLETED', title: 'Completed' },
];

export const AgileBoard: React.FC<AgileBoardProps> = ({ tasks, users, onStatusChange }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const isBlockedCol = column.id === 'BLOCKED';

        return (
          <div key={column.id} className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-3 flex flex-col h-full border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold ${isBlockedCol ? 'text-red-600' : 'text-gray-700'}`}>
                {column.title}
              </h3>
              <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded-full font-semibold">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-[200px]">
              {columnTasks.length === 0 ? (
                <div className="h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
                  Drop tasks here
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    assignees={users} 
                    onStatusChange={onStatusChange} 
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};