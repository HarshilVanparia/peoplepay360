'use client';

import { useState } from 'react';
import { Search, Clock, Calendar, Users, X } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Fixed: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  Flexible: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  'Full Flexible': 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
};

const TYPES = ['All Types', 'Fixed', 'Flexible', 'Full Flexible'];

interface Props {
  schedules: any[];
}

export default function ScheduleList({ schedules }: Props) {
  const [term, setTerm] = useState('');
  const [type, setType] = useState('All Types');

  const filtered = schedules.filter(s => {
    const matchTerm = !term || s.name.toLowerCase().includes(term.toLowerCase());
    const matchType = type === 'All Types' || s.schedule_type === type;
    return matchTerm && matchType;
  });

  const hasFilters = term || type !== 'All Types';

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search schedules..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
        >
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setTerm(''); setType('All Types'); }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-sm text-slate-500">{filtered.length} of {schedules.length}</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-500">
            <Search size={28} className="mx-auto mb-2 opacity-40" />
            <p>No schedules match your search.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Schedule Name</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekly Hours</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-violet-900/10 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2 font-semibold text-white text-sm">
                      <Calendar size={14} className="text-violet-400 shrink-0" />
                      {s.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${TYPE_COLORS[s.schedule_type] || TYPE_COLORS.Fixed}`}>
                      {s.schedule_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="flex items-center gap-1.5 font-mono font-bold text-white text-sm">
                      <Clock size={13} className="text-slate-500" />
                      {Number(s.weekly_hours).toFixed(2)}h
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Users size={13} className="text-slate-600" />
                      {s.assigned_employees} Employees
                    </span>
                    {s.assigned_employee_names && (
                      <p className="text-[10px] text-slate-600 mt-0.5 max-w-xs truncate" title={s.assigned_employee_names}>
                        {s.assigned_employee_names}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
