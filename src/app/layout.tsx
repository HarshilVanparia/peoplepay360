import './globals.css';
import Link from 'next/link';
import { Users, FileText, Clock, CalendarDays, Banknote, LayoutDashboard } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LogoutButton from '@/app/components/LogoutButton';

export const metadata = {
  title: 'PeoplePay360 | HR & Payroll Operations',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        {session && (
          <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="font-bold text-lg tracking-wider text-blue-400 flex items-center gap-2">
                  <span className="bg-blue-600 text-white p-1 rounded-md text-xs font-mono">360</span>
                  PEOPLEPAY
                </Link>
                <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
                  <Link href="/" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"><LayoutDashboard size={15} /> Dashboard</Link>
                  <Link href="/employees" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"><Users size={15} /> Employees</Link>
                  <Link href="/contracts" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"><FileText size={15} /> Contracts</Link>
                  <Link href="/attendance" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"><Clock size={15} /> Attendance</Link>
                  <Link href="/time-off/requests" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"><CalendarDays size={15} /> Time Off</Link>
                  <Link href="/payroll/payruns" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"><Banknote size={15} /> Payroll</Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-200">{session.user?.name}</p>
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider">{(session.user as any)?.role}</p>
                </div>
                <LogoutButton />
              </div>
            </div>
          </header>
        )}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}