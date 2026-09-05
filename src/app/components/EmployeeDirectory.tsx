'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Briefcase, Building, Filter, X } from 'lucide-react';

const DEPARTMENTS = ['All Departments'] as const;
const STATUSES = ['All Statuses', 'Active', 'On Leave', 'Inactive', 'Terminated'] as const;

export default function EmployeeDirectory({ employees }: { employees: any[] }) {
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [dept, setDept] = useState('All Departments');

  const departments = ['All Departments', ...Array.from(new Set(employees.map(e => e.department))).sort()];

  const shown = employees.filter(e => {
    const matchTerm = `${e.first_name} ${e.last_name} ${e.email} ${e.department} ${e.job_position}`
      .toLowerCase().includes(term.toLowerCase());
    const matchStatus = status === 'All Statuses' || e.status === status;
    const matchDept = dept === 'All Departments' || e.department === dept;
    return matchTerm && matchStatus && matchDept;
  });

  const hasFilters = term || status !== 'All Statuses' || dept !== 'All Departments';

  return (
    <div className="space-y-5">
      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search by name, email, position..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
          >
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setTerm(''); setStatus('All Statuses'); setDept('All Departments'); }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-sm text-slate-500 font-medium">{shown.length} of {employees.length}</span>
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No employees match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {shown.map(emp => (
            <Link href={`/employees/${emp.id}`} key={emp.id} className="block group">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 hover:border-violet-500/60 hover:bg-violet-900/10 hover:shadow-lg hover:shadow-violet-900/20 transition-all h-full backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                    emp.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                    emp.status === 'On Leave' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                    'bg-slate-800/60 text-slate-500 border-slate-600/40'
                  }`}>{emp.status}</span>
                </div>
                <h3 className="mt-4 font-bold text-white group-hover:text-violet-200 transition-colors">{emp.first_name} {emp.last_name}</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">{emp.email}</p>
                <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-1.5">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <Briefcase size={12} className="shrink-0 text-violet-400" />{emp.job_position}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <Building size={12} className="shrink-0 text-violet-400" />{emp.department}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
