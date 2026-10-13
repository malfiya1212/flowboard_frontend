import { CheckCircle2, FolderKanban, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('flowboard_user');
  let userRole = 'Developer';
  let targetDashboard = '/developer-dashboard';

  if (rawUser) {
    try {
      const u = JSON.parse(rawUser);
      const r = (u?.role || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (r.includes('scrum')) {
        userRole = 'Scrum Master';
        targetDashboard = '/scrumMaster';
      } else if (r === 'admin') {
        userRole = 'Admin';
        targetDashboard = '/admin-dashboard';
      } else {
        userRole = 'Developer';
        targetDashboard = '/developer-dashboard';
      }
    } catch {
      // default
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('flowboard_token');
    localStorage.removeItem('flowboard_user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between shrink-0 font-sans transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0F766E] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <CheckCircle2 size={16} />
          </div>
          <span className="font-bold text-xs uppercase font-mono tracking-wider text-slate-800 dark:text-white">FlowBoard Enterprise</span>
        </div>
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 pl-9">{userRole} Workspace</p>
      </div>

      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase text-gray-400 dark:text-gray-500 tracking-wider px-3 pb-1">Navigation</div>
        <button
          type="button"
          onClick={() => navigate(targetDashboard)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-sm cursor-pointer transition-colors"
        >
          <FolderKanban size={16} /> Return to {userRole} Dashboard
        </button>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button 
          type="button"
          onClick={handleLogout} 
          className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-xs font-mono cursor-pointer transition-colors px-2 py-1"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}