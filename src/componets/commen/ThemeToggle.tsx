import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/themecontext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light Mode' : 'Dark Mode'}`}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 cursor-pointer select-none shadow-2xs hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-slate-600'
          : 'bg-white hover:bg-gray-100 text-slate-700 border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      <span className="flex items-center justify-center w-4 h-4">
        {isDark ? (
          <Sun size={16} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon size={16} className="text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </span>

      {showLabel && (
        <span className="text-xs font-mono font-bold tracking-tight ml-1.5">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
