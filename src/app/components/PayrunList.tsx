'use client';

import { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import Link from 'next/link';

interface Props {
  payruns: any[];
}

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Validated: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  Computed: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  Draft: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
  Cancelled: 'bg-red-900/30 text-red-400 border-red-500/30',
};

const STATUSES = ['All Statuses', 'Draft', 'Computed', 'Validated', 'Paid', 'Cancelled'];

export default function PayrunList({ payruns }: Props) {
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('All Statuses');

  const filtered = payruns.filter(p => {
    const matchTerm = !term || p.name.toLowerCase().includes(term.toLowerCase()) || p.structure_name?.toLowerCase().includes(term.toLowerCase());
    const matchStatus = status === 'All Statuses' || p.status === status;
    return matchTerm && matchStatus;
  });

  const hasFilters = term || status !== 'All Statuses';

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search payrun or structure..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
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
            onClick={() => { setTerm(''); setStatus('All Statuses'); }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-sm text-slate-500">{filtered.length} of {payruns.length}</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-500">
            <Search size={28} className="mx-auto mb-2 opacity-40" />
            <p>No payruns match your search.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Batch Name</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Structure</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Period</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payslips</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map(pr => (
                <tr key={pr.id} className="hover:bg-violet-900/10 transition-colors">
                  <td className="py-3.5 px-5">
                    <Link href={`/payroll/payruns/${pr.id}`} className="font-semibold text-white hover:text-violet-300 transition-colors text-sm">
                      {pr.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-sm text-slate-400">{pr.structure_name}</td>
                  <td className="py-3.5 px-5 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-600" />
                      {pr.period_start} to {pr.period_end}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-white text-sm">{pr.payslip_count}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[pr.status] || STATUS_COLORS.Draft}`}>
                      {pr.status}
                    </span>
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
