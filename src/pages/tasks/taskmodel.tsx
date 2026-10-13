import { useState } from 'react';
import { X, MessageSquare, Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../componets/commen/Badge';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review Queue' | 'Completed' | 'Blocked';
  assignee: string;
  dueDate?: string;
  blockReason?: string;
  reviewNotes?: string;
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export default function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const navigate = useNavigate();
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<string[]>(['Task initialized in workspace.']);
  const [blockReason, setBlockReason] = useState(task.blockReason || '');
  const [reviewNotes, setReviewNotes] = useState(task.reviewNotes || '');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [...prev, commentInput]);
    setCommentInput('');
  };

  const handleReportBlocker = () => {
    onUpdate({ ...task, status: 'Blocked', blockReason });
    onClose();
  };

  const handleSubmitForReview = () => {
    onUpdate({ ...task, status: 'Review Queue', reviewNotes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 rounded-xl max-w-lg w-full space-y-5 border border-gray-200 dark:border-slate-800 shadow-2xl transition-colors">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded">
              {task.id}
            </span>
            <Badge label={task.status} />
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/tasks/${task.id}`);
              }}
              className="text-xs font-mono text-[#0F766E] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              title="Open full task page"
            >
              <span>Full Page</span>
              <ExternalLink size={12} />
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{task.title}</h3>
          <p className="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-lg border border-gray-200 dark:border-slate-700/80 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Action Controls for Developer Functions */}
        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800 font-mono text-xs">
          {task.status === 'In Progress' && (
            <div className="space-y-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
              <label className="text-gray-600 dark:text-slate-300 block font-bold">Submit for Review Notes:</label>
              <input 
                type="text" 
                placeholder="Add completion notes..." 
                value={reviewNotes} 
                onChange={e => setReviewNotes(e.target.value)} 
                className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 mb-2 focus:ring-1 focus:ring-[#0F766E] focus:outline-none" 
              />
              <button 
                type="button"
                onClick={handleSubmitForReview} 
                className="w-full py-2 bg-[#9333EA] hover:bg-[#7E22CE] text-white rounded font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Submit Work for Review
              </button>
            </div>
          )}

          {task.status !== 'Blocked' ? (
            <div className="space-y-2 bg-amber-500/10 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-500/30">
              <label className="text-[#D97706] block font-bold">Report Blocked Work:</label>
              <input 
                type="text" 
                placeholder="Explain blocker reason..." 
                value={blockReason} 
                onChange={e => setBlockReason(e.target.value)} 
                className="w-full p-2 bg-white dark:bg-slate-900 border border-amber-500/40 rounded text-xs text-slate-900 dark:text-slate-100 mb-2 focus:outline-none" 
              />
              <button 
                type="button"
                onClick={handleReportBlocker} 
                className="w-full py-2 text-white rounded font-bold cursor-pointer transition-colors shadow-2xs"
                style={{ backgroundColor: '#D97706' }}
              >
                Report Blocker
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => { onUpdate({ ...task, status: 'In Progress' }); onClose(); }} 
              className="w-full py-2 text-white rounded font-bold cursor-pointer transition-colors shadow-2xs"
              style={{ backgroundColor: '#2563EB' }}
            >
              Resolve Blocker & Resume Work
            </button>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <h4 className="text-xs font-mono uppercase text-gray-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
            <MessageSquare size={14} className="text-[#0F766E]" /> Activity & Comments
          </h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto text-xs font-mono">
            {comments.map((c, i) => (
              <div key={i} className="p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                {c}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input 
              type="text" 
              placeholder="Add progress comment..." 
              value={commentInput} 
              onChange={e => setCommentInput(e.target.value)} 
              className="flex-1 p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#0F766E] focus:outline-none" 
            />
            <button type="submit" className="px-3 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded cursor-pointer"><Send size={14} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}