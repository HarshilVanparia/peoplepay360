// src/app/layout.tsx
import './globals.css';
import Link from 'next/link';
import { Users, FileText, Clock, CalendarDays, Banknote, LayoutDashboard } from 'lucide-react';

export const metadata = {
  title: 'PeoplePay360 | HR & Payroll Operations',
  description: 'Integrated HR & Payroll Lifecycle Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-bold text-lg tracking-wider text-blue-400 flex items-center gap-2">
                <span className="bg-blue-600 text-white p-1 rounded-md text-xs font-mono">360</span>
                PEOPLEPAY
              </Link>
              <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
                <Link href="/" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <Link href="/employees" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2">
                  <Users size={15} /> Employees
                </Link>
                <Link href="/contracts" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2">
                  <FileText size={15} /> Contracts
                </Link>
                <Link href="/attendance" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2">
                  <Clock size={15} /> Attendance
                </Link>
                <Link href="/time-off/requests" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2">
                  <CalendarDays size={15} /> Time Off
                </Link>
                <Link href="/payroll/payruns" className="px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2">
                  <Banknote size={15} /> Payroll
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Admin Session
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}