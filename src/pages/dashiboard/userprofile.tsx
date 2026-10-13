import { useState, useEffect } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { usePermissions } from '../../context/permision';

interface UserProfileProps {
  userData?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  } | null;
}

export default function UserProfile({ userData }: UserProfileProps = {}) {
  const { role } = usePermissions();
  const [name, setName] = useState(userData?.name || 'Developer User');
  const [email, setEmail] = useState(userData?.email || 'dev@flowboard.io');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userData?.name) setName(userData.name);
    if (userData?.email) setEmail(userData.email);
  }, [userData]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#F4F6F8] dark:bg-[#0B0F17] flex justify-center items-center transition-colors">
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 max-w-lg w-full space-y-4 font-sans shadow-sm text-slate-800 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User size={16} className="text-[#0F766E] dark:text-teal-400" /> Personal Profile & Database Security
          </h3>
          <span className="text-[10px] font-mono bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded font-bold">
            Verified {userData?.role || role}
          </span>
        </div>
        
        {/* Database Record Specs */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-gray-50 dark:bg-slate-800/60 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
          <div>
            <span className="text-gray-500 dark:text-slate-400 block">Database ID:</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">USR-#{userData?.id || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-slate-400 block">Status:</span>
            <span className="text-[#15803D] dark:text-emerald-400 font-bold">{userData?.status || 'ACTIVE'}</span>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-[#15803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-xs font-mono flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#15803D]" /> Profile and credentials updated successfully.
          </div>
        )}

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-900 dark:text-slate-200">Full Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" 
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-900 dark:text-slate-200">Email Address:</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" 
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-900 dark:text-slate-200">Assigned Role (Database Verified):</label>
          <input 
            type="text" 
            disabled 
            value={userData?.role || role} 
            className="w-full p-2.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded text-xs text-[#0F766E] dark:text-teal-400 font-mono font-bold" 
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-900 dark:text-slate-200">Change Password:</label>
          <input 
            type="password" 
            placeholder="New secure password..." 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" 
          />
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-mono text-xs font-bold rounded cursor-pointer transition-colors shadow-sm"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}