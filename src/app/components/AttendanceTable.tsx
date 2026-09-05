'use client';

import { useState } from 'react';
import { Search, Clock, Download, Filter, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import { generateAttendancePDF } from '../../../lib/pdf';

const STATUS_COLORS: Record<string, string> = {
  Normal: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Late: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
  Absent: 'bg-red-900/30 text-red-400 border-red-500/30',
  Overtime: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  'Manual Correction': 'bg-purple-900/30 text-purple-400 border-purple-500/30',
};

const STATUSES = ['All Statuses', 'Normal', 'Late', 'Absent', 'Overtime', 'Manual Correction'];

interface Props {
  records: any[];
}

export default function AttendanceTable({ records }: Props) {
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = records.filter(r => {
    const name = `${r.first_name} ${r.last_name}`.toLowerCase();
    const matchTerm = !term || name.includes(term.toLowerCase());
    const matchStatus = status === 'All Statuses' || r.status === status;
    const checkInDate = r.check_in ? r.check_in.slice(0, 10) : '';
    const matchFrom = !dateFrom || checkInDate >= dateFrom;
    const matchTo = !dateTo || checkInDate <= dateTo;
    return matchTerm && matchStatus && matchFrom && matchTo;
  });

  const hasFilters = term || status !== 'All Statuses' || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search employee..."
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

        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              title="From date"
            />
          </div>
          <span className="text-slate-600 text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            title="To date"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setTerm(''); setStatus('All Statuses'); setDateFrom(''); setDateTo(''); }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}

        <button
          onClick={() => generateAttendancePDF(filtered, 'Attendance Report')}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-900/10 px-4 py-2.5 text-sm font-semibold text-violet-300 hover:bg-violet-900/30 hover:border-violet-400/60 transition-all shadow-sm"
        >
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-500">
            <Clock size={28} className="mx-auto mb-2 opacity-40" />
            <p className="font-medium">No records match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check In</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check Out</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hours</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-violet-900/10 transition-colors group">
                  <td className="py-3.5 px-5">
                    <Link href={`/attendance/${r.id}`} className="font-semibold text-white hover:text-violet-300 transition-colors text-sm">
                      {r.first_name} {r.last_name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-500 shrink-0" />
                      <span className="font-mono">{new Date(r.check_in).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    {r.scheduled_start && (
                      <p className="text-[10px] text-slate-600 mt-0.5 ml-5">
                        Sch. {String(r.scheduled_start).slice(0, 5)} - {String(r.scheduled_end || '').slice(0, 5)}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-sm font-mono">
                    {r.check_out ? (
                      <span className="text-slate-300">{new Date(r.check_out).toLocaleTimeString([], { timeStyle: 'short' })}</span>
                    ) : (
                      <span className="text-amber-400 italic text-xs">Missing</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-500">{r.schedule_name || '-'}</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-sm text-white">
                    {Number(r.worked_hours).toFixed(2)}h
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[r.status] || STATUS_COLORS.Normal}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-slate-600 text-right">{filtered.length} of {records.length} records</p>
    </div>
  );
}
