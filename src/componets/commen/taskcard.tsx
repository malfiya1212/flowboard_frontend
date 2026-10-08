import React from 'react';
import Badge from './Badge';
import { MoreHorizontal, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Review Queue';
  assignee: string;
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
  onUpdateStatus,
  onReportBlock,
}: TaskCardProps) {
  return (
    <div className="bg-white rounded-sm p-3.5 border border-[oklch(90%_0.02_320)] space-y-3 shadow-none hover:border-gray-400 transition-all font-sans">
      
      {/* Top Row: Identifier, Priority Badge & Options Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-gray-500 tracking-wider">{id}</span>
          <Badge label={priority} type="priority" />
        </div>
        <button className="text-gray-400 hover:text-gray-900 cursor-pointer p-0.5" aria-label="Task options">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-gray-900 tracking-tight leading-snug">{title}</h4>
        <p className="text-[11px] text-gray-600 leading-normal line-clamp-2 font-sans">{description}</p>
      </div>

      {/* Bottom Metadata & Action Toolbar */}
      <div className="pt-2.5 border-t border-[oklch(93%_0.01_320)] flex items-center justify-between text-[11px] font-mono">
        
        {/* Assignee Tag */}
        <div className="flex items-center gap-1.5 text-gray-500">
          <div className="w-4 h-4 rounded-full bg-[var(--color-bg-left)] border border-[oklch(85%_0.01_320)] flex items-center justify-center text-[9px] font-bold text-gray-700">
            {assignee.charAt(0)}
          </div>
          <span>{assignee}</span>
        </div>

        {/* Action Buttons based on Lifecycle state */}
        <div className="flex items-center gap-1">
          {status !== 'Blocked' && onReportBlock && (
            <button 
              onClick={onReportBlock}
              className="px-2 py-1 rounded-sm text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 font-bold transition-all cursor-pointer text-[10px]"
              title="Report impediment"
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