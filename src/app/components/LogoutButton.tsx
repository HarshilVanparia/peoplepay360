'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 hover:bg-red-500 hover:text-white transition-colors border border-slate-700"
    >
      <LogOut size={14} /> Sign Out
    </button>
  );
}