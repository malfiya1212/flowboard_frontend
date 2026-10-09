import React from 'react';
import { CheckCircle2, FolderKanban, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#EEF1F6] border-r border-gray-800 flex flex-col justify-between shrink-0 font-sans">
      <div className="p-4 border-b border-gray-800 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <CheckCircle2 size={16} />
          </div>
          <span className="font-bold text-xs uppercase font-mono tracking-wider text-white">FlowBoard Enterprise</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400 pl-9">Scrum Master Console</p>
      </div>

      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase text-gray-500 tracking-wider px-3 pb-1">Management</div>
        <div className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-blue-600 text-white shadow-sm">
          <FolderKanban size={16} /> Scrum Master View
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={() => window.location.href = '/login'} 
          className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-mono cursor-pointer transition-colors px-2 py-1"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}