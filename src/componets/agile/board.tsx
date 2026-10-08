import { AlertOctagon, Clock } from 'lucide-react';
import Badge from '../commen/Badge';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  dueDate?: string;
  blockReason?: string;
  reviewFeedback?: string;
}

interface AgileBoardProps {
  tasks: Task[];
  onUpdateStatus?: (taskId: string, newStatus: Task['status']) => void;
  onOpenBlockModal?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
}

export default function AgileBoard({ tasks, onUpdateStatus, onOpenBlockModal, onSelectTask }: AgileBoardProps) {
  const columns: Task['status'][] = ['To Do', 'In Progress', 'Review Queue', 'Completed', 'Blocked'];

  return (
    <div className="flex-1 p-6 overflow-x-auto bg-[var(--color-bg-right)] h-full">
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
                          onClick={() => onSelectTask && onSelectTask(task)}
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

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                          <Clock size={11} />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[oklch(93%_0.01_320)] flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[10px] font-bold text-gray-500 truncate max-w-[100px]">{task.assignee}</span>

                        <div className="flex items-center gap-1.5">
                          {task.status !== 'Blocked' && onOpenBlockModal && (
                            <button 
                              onClick={() => onOpenBlockModal(task.id)}
                              className="px-2 py-1 rounded-sm text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 font-bold transition-all cursor-pointer text-[10px]"
                            >
                              Block
                            </button>
                          )}

                          {task.status === 'To Do' && onUpdateStatus && (
                            <button 
                              onClick={() => onUpdateStatus(task.id, 'In Progress')}
                              className="px-2.5 py-1 rounded-sm bg-gray-900 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                            >
                              Start →
                            </button>
                          )}

                          {task.status === 'In Progress' && onUpdateStatus && (
                            <button 
                              onClick={() => onUpdateStatus(task.id, 'Review Queue')}
                              className="px-2.5 py-1 rounded-sm bg-purple-900 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                            >
                              Review →
                            </button>
                          )}

                          {task.status === 'Review Queue' && onUpdateStatus && (
                            <button 
                              onClick={() => onUpdateStatus(task.id, 'Completed')}
                              className="px-3 py-1 rounded-sm bg-green-700 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
                            >
                              Complete ✓
                            </button>
                          )}

                          {task.status === 'Blocked' && onUpdateStatus && (
                            <button 
                              onClick={() => onUpdateStatus(task.id, 'In Progress')}
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
  );
}