import Badge from './Badge';
import { AlertOctagon } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Review ' | 'Review Queue';
  assignee: string;
  blockReason?: string;
  onUpdateStatus?: (newStatus: any) => void;
  onReportBlock?: () => void;
}

export default function TaskCard({
  id,
  title,
  description,
  priority,
  status,
  assignee,
  blockReason,
  onUpdateStatus,
  onReportBlock,
}: TaskCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 space-y-3 shadow-xs hover:border-gray-300 dark:hover:border-slate-600 transition-all font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-slate-400">{id}</span>
        <Badge label={priority} type="priority" />
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{title}</h4>
        <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2">{description}</p>
      </div>

      {status === 'Blocked' && blockReason && (
        <div 
          className="p-2.5 rounded-lg text-[11px] space-y-1 font-mono border"
          style={{
            color: '#D97706',
            backgroundColor: '#D9770615',
            borderColor: '#D9770640',
          }}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <AlertOctagon size={13} />
            <span>IMPEDIMENT REPORTED:</span>
          </div>
          <p className="font-sans italic text-slate-700 dark:text-slate-300">"{blockReason}"</p>
        </div>
      )}

      <div className="pt-2.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
          <div className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
            {assignee.charAt(0)}
          </div>
          <span className="text-[10px]">{assignee}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {status !== 'Blocked' && onReportBlock && (
            <button 
              type="button"
              onClick={onReportBlock}
              className="px-2 py-1 rounded text-[#D97706] bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 font-bold transition-all cursor-pointer text-[10px]"
            >
              Block ⚠️
            </button>
          )}

          {status === 'To Do' && onUpdateStatus && (
            <button 
              type="button"
              onClick={() => onUpdateStatus('In Progress')}
              className="px-2.5 py-1 rounded text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
              style={{ backgroundColor: '#2563EB' }}
            >
              Start →
            </button>
          )}

          {status === 'In Progress' && onUpdateStatus && (
            <button 
              type="button"
              onClick={() => onUpdateStatus('Completed')}
              className="px-2.5 py-1 rounded text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
              style={{ backgroundColor: '#15803D' }}
            >
              Complete ✓
            </button>
          )}

          {status === 'Blocked' && onUpdateStatus && (
            <button 
              type="button"
              onClick={() => onUpdateStatus('In Progress')}
              className="px-2.5 py-1 rounded text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
              style={{ backgroundColor: '#2563EB' }}
            >
              Unblock ↺
            </button>
          )}

          {status === 'Completed' && onUpdateStatus && (
            <button 
              type="button"
              onClick={() => onUpdateStatus('Review Queue')}
              className="px-2.5 py-1 rounded text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
              style={{ backgroundColor: '#9333EA' }}
            >
              Review →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}