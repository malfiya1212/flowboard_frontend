import React, { useState } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import { usePermissions } from '../../context/permision';

export default function UserProfile() {
  const { role } = usePermissions();
  const [name, setName] = useState('Developer User');
  const [email, setEmail] = useState('dev@flowboard.io');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-900 flex justify-center items-center">
      <form onSubmit={handleSave} className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-lg w-full space-y-4 font-sans shadow-xl">
        <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2"><User size={16} /> Personal Profile & Security</h3>
        
        {saved && (
          <div className="p-3 bg-green-500/20 text-green-400 rounded text-xs font-mono flex items-center gap-2">
            <CheckCircle2 size={14} /> Profile and credentials updated successfully.
          </div>
        )}

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Full Name:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded text-xs text-white" />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Email Address:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded text-xs text-white" />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Role (Read-Only):</label>
          <input type="text" disabled value={role} className="w-full p-2.5 bg-gray-900/50 border border-gray-700/50 rounded text-xs text-gray-400 font-mono" />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-gray-300">Change Password:</label>
          <input type="password" placeholder="New secure password..." value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded text-xs text-white" />
        </div>

        <div className="pt-2">
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded cursor-pointer transition-colors">
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}