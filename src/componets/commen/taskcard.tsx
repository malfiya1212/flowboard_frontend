import Badge from './Badge';
import { AlertOctagon } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Review Queue';
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
    <div className="bg-white rounded-sm p-4 border border-[oklch(90%_0.02_320)] space-y-3 shadow-none hover:border-gray-400 transition-all font-sans">
      
      {/* Top Bar: ID and Priority Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-gray-500">{id}</span>
        <Badge label={priority} type="priority" />
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-gray-900 leading-tight">{title}</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{description}</p>
      </div>

      {/* Real Impediment Reason Box (If Blocked) */}
      {status === 'Blocked' && blockReason && (
        <div className="p-2.5 rounded-sm bg-red-50 border border-red-200 text-[11px] text-red-900 space-y-1 font-mono">
          <div className="flex items-center gap-1.5 font-bold text-red-700">
            <AlertOctagon size={13} />
            <span>IMPEDIMENT REPORTED:</span>
          </div>
          <p className="text-gray-700 font-sans italic">"{blockReason}"</p>
        </div>
      )}

      {/* Card Footer: Assignee & Clean Action Buttons */}
      <div className="pt-2.5 border-t border-[oklch(93%_0.01_320)] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-gray-500">
          <div className="w-5 h-5 rounded-sm bg-[var(--color-bg-left)] border border-[oklch(85%_0.01_320)] flex items-center justify-center text-[10px] font-bold text-gray-700">
            {assignee.charAt(0)}
          </div>
          <span className="text-[10px]">{assignee}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {status !== 'Blocked' && onReportBlock && (
            <button 
              onClick={onReportBlock}
              className="px-2 py-1 rounded-sm text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 font-bold transition-all cursor-pointer text-[10px]"
            >
              Block ⚠️
            </button>
          )}

          {status === 'To Do' && onUpdateStatus && (
            <button 
              onClick={() => onUpdateStatus('In Progress')}
              className="px-2.5 py-1 rounded-sm bg-gray-900 text-[oklch(80%_0.14_20)] font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
            >
              Start →
            </button>
          )}

          {status === 'In Progress' && onUpdateStatus && (
            <button 
              onClick={() => onUpdateStatus('Completed')}
              className="px-2.5 py-1 rounded-sm bg-gray-900 text-[oklch(80%_0.14_20)] font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
            >
              Complete ✓
            </button>
          )}

          {status === 'Blocked' && onUpdateStatus && (
            <button 
              onClick={() => onUpdateStatus('In Progress')}
              className="px-2.5 py-1 rounded-sm bg-amber-600 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
            >
              Unblock ↺
            </button>
          )}

          {status === 'Completed' && onUpdateStatus && (
            <button 
              onClick={() => onUpdateStatus('Review Queue')}
              className="px-2.5 py-1 rounded-sm bg-blue-900 text-white font-bold hover:opacity-90 transition-all cursor-pointer text-[10px]"
            >
              Review →
            </button>
          )}
        </div>
      </div>

    </div>
  );
}