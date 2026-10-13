import { Bell, Shield } from 'lucide-react';
import { usePermissions } from '../context/permision';
import ThemeToggle from '../componets/commen/ThemeToggle';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { role } = usePermissions();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900 text-slate-800 dark:text-white shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-bold uppercase font-mono tracking-wider">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle showLabel={false} />
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 font-mono text-xs font-bold">
          <Shield size={12} className="text-blue-500" /> Role: {role}
        </span>
        <button 
          type="button"
          className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative" 
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}