import { Shield, Users, LogOut, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../context/permision';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role } = usePermissions();

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans antialiased bg-[var(--color-bg-right)] text-[oklch(15%_0.02_320)]">
      
      {/* SIDEBAR */}
      <aside className="w-60 bg-[var(--color-bg-left)] border-r border-[oklch(90%_0.02_320)] flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="p-1.5 rounded-sm bg-red-900 text-white">
              <Shield size={16} />
            </div>
            <div>
              <span className="font-bold tracking-tight text-xs block">Admin Control Center</span>
              <span className="text-[10px] font-mono text-gray-500 uppercase">Role: {role}</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-200/50 cursor-pointer"
            >
              <CheckSquare size={14} />
              <span>Developer Dashboard</span>
            </button>
            <button 
              onClick={() => navigate('/scrum-master')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-200/50 cursor-pointer"
            >
              <Users size={14} />
              <span>Scrum Master Console</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[oklch(90%_0.02_320)] flex items-center justify-between">
          <span className="text-[11px] font-bold">Admin User</span>
          <button 
            onClick={() => navigate('/admin/login')}
            className="p-1.5 rounded-sm text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-14 border-b border-[oklch(90%_0.02_320)] px-6 flex items-center justify-between bg-[var(--color-bg-left)]">
          <h1 className="text-xs font-bold uppercase tracking-wide font-mono">System Administration & RBAC Matrix</h1>
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-sm border border-[oklch(90%_0.02_320)] font-bold">
            Status: Secure Cluster Active
          </span>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-bg-right)] flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-sm border border-[oklch(90%_0.02_320)] max-w-lg w-full space-y-4 font-sans shadow-sm text-center">
            <Shield className="mx-auto text-red-800" size={32} />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">Enterprise Administration Panel</h2>
            <p className="text-xs text-gray-600">You have full administrative privileges, global role configuration access, and security override permissions.</p>
          </div>
        </div>
      </main>

    </div>
  );
}