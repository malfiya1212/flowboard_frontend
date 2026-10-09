import React, { useState } from 'react';
import { X, Clock, AlertOctagon, MessageSquare, Send } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-gray-800 text-gray-100 p-6 rounded-xl max-w-lg w-full space-y-5 border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded">
              {task.id}
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase">{task.status}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white">{task.title}</h3>
          <p className="text-xs text-gray-300 bg-gray-900 p-3 rounded border border-gray-700 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Action Controls for Developer Functions */}
        <div className="space-y-3 pt-2 border-t border-gray-700 font-mono text-xs">
          {task.status === 'In Progress' && (
            <div className="space-y-2 bg-gray-900 p-3 rounded border border-gray-700">
              <label className="text-gray-400 block font-bold">Submit for Review Notes:</label>
              <input type="text" placeholder="Add completion notes..." value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-xs text-white mb-2" />
              <button onClick={handleSubmitForReview} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold cursor-pointer">
                Submit Work for Review
              </button>
            </div>
          )}

          {task.status !== 'Blocked' ? (
            <div className="space-y-2 bg-gray-900 p-3 rounded border border-gray-700">
              <label className="text-red-400 block font-bold">Report Blocked Work:</label>
              <input type="text" placeholder="Explain blocker reason..." value={blockReason} onChange={e => setBlockReason(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-xs text-white mb-2" />
              <button onClick={handleReportBlocker} className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded font-bold cursor-pointer transition-colors">
                Report Blocker
              </button>
            </div>
          ) : (
            <button onClick={() => { onUpdate({ ...task, status: 'In Progress' }); onClose(); }} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold cursor-pointer">
              Resolve Blocker & Resume Work
            </button>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <h4 className="text-xs font-mono uppercase text-gray-400 font-bold flex items-center gap-1.5"><MessageSquare size={14} /> Activity & Comments</h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto text-xs font-mono">
            {comments.map((c, i) => (
              <div key={i} className="p-2 bg-gray-900 rounded border border-gray-700 text-gray-300">
                {c}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input type="text" placeholder="Add progress comment..." value={commentInput} onChange={e => setCommentInput(e.target.value)} className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-xs text-white" />
            <button type="submit" className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer"><Send size={14} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}