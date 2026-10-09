import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';
import Badge from '../commen/Badge';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
}

interface BoardProps {
  tasks: Task[];
  onUpdateStatus?: (taskId: string, newStatus: Task['status']) => void;
  onSelectTask?: (task: Task) => void;
}

export default function Board({ tasks, onUpdateStatus, onSelectTask }: BoardProps) {
  const columns: Task['status'][] = ['To Do', 'In Progress', 'Review Queue', 'Completed', 'Blocked'];
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="flex-1 p-4 overflow-x-auto h-full">
      <div className="grid grid-cols-5 gap-3 h-full min-w-[1100px]">
        {columns.map(statusCol => {
          const colTasks = tasks.filter(t => t.status === statusCol);
          return (
            <div 
              key={statusCol} 
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (draggingId && onUpdateStatus) {
                  onUpdateStatus(draggingId, statusCol);
                  setDraggingId(null);
                }
              }}
              className="flex flex-col rounded-xl overflow-hidden h-full"
            >
              {/* Column Header (Keeps your exact design/theme) */}
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-gray-200">{statusCol}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Body / Cards Container */}
              <div className="flex-1 p-2 overflow-y-auto space-y-2">
                {colTasks.length === 0 ? (
                  <div className="h-24 border border-dashed border-gray-700/50 rounded-lg m-1 flex items-center justify-center text-gray-500 text-xs italic">
                    Drop a card here
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div 
                      key={task.id} 
                      draggable
                      onDragStart={() => setDraggingId(task.id)}
                      className="bg-gray-800/90 text-gray-100 rounded-lg p-3 border border-gray-700/60 space-y-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-500 transition-all select-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <GripVertical size={12} className="text-gray-400" />
                          <button 
                            onClick={() => onSelectTask && onSelectTask(task)}
                            className="text-xs font-mono font-bold text-blue-400 hover:underline cursor-pointer"
                          >
                            {task.id}
                          </button>
                        </div>
                        <Badge label={task.priority} type="priority" />
                      </div>
                      <p className="text-xs font-bold text-gray-100 leading-tight">{task.title}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-2">{task.description}</p>
                      <div className="pt-2 border-t border-gray-700/50 flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span>{task.assignee}</span>
                        <span className="italic text-gray-500">Drag to move</span>
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
  );
}