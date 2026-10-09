import React from 'react';
import { Bell, Shield, User } from 'lucide-react';
import { usePermissions } from '../context/permision';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { role } = usePermissions();

  return (
    <header className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-gray-900 text-white shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-bold uppercase font-mono tracking-wider">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700 font-mono text-xs font-bold">
          <Shield size={12} className="text-blue-400" /> Role: {role}
        </span>
        <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer relative" title="Notifications">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}