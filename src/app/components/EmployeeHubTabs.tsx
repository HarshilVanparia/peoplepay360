'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, CalendarDays, Layers, Plus, Pencil, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  employeeId: string | number
  contracts: any[]
  attendance: any[]
  leaveRequests: any[]
  allocations: any[]
}

export default function EmployeeHubTabs({
  employeeId,
  contracts,
  attendance,
  leaveRequests,
  allocations,
}: Props) {
  const [tab, setTab] = useState<'contracts' | 'attendance' | 'requests' | 'allocations'>('contracts')

  function formatDays(val: any) {
    const n = Number(val || 0)
    return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1)
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-700/60 bg-slate-950/40 px-6 py-3 gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('contracts')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === 'contracts'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText size={14} /> Contracts ({contracts.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('attendance')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === 'attendance'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock size={14} /> Attendance ({attendance.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === 'requests'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays size={14} /> Time Off Requests ({leaveRequests.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('allocations')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === 'allocations'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers size={14} /> Leave Allocations ({allocations.length})
          </button>
        </div>

        {/* Context Action Button */}
        <div>
          {tab === 'contracts' && (
            <Link
              href="/contracts/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-900/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-900/30 transition-all"
            >
              <Plus size={13} /> New Contract
            </Link>
          )}
          {tab === 'requests' && (
            <Link
              href="/time-off/requests/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-900/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-900/30 transition-all"
            >
              <Plus size={13} /> Request Leave
            </Link>
          )}
          {tab === 'allocations' && (
            <Link
              href="/time-off/allocations/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-900/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-900/30 transition-all"
            >
              <Plus size={13} /> Assign Allocation
            </Link>
          )}
        </div>
      </div>

      {/* Tab Content: Contracts */}
      {tab === 'contracts' && (
        <div className="overflow-x-auto">
          {contracts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p>No contract records found for this employee.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-slate-700/60 bg-slate-950/20">
                <tr>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contract #</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Structure</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wage</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-sm text-white font-bold">{c.contract_number || `CTR-${c.id}`}</td>
                    <td className="py-3.5 px-5 text-sm text-slate-300">{c.structure_name || 'Standard'}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-emerald-400 font-bold">
                      ${Number(c.wage).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400">{c.wage_period || 'Monthly'}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 font-mono">
                      {c.start_date} to {c.end_date || 'Indefinite'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        c.status === 'Active'
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {c.status === 'Active' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/contracts/new?edit=${c.id}`}
                        className="inline-flex p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="Edit contract"
                      >
                        <Pencil size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Attendance */}
      {tab === 'attendance' && (
        <div className="overflow-x-auto">
          {attendance.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p>No attendance logs recorded for this employee.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-slate-700/60 bg-slate-950/20">
                <tr>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check In</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check Out</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Worked Hours</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attendance.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-sm text-white">
                      {a.check_in ? String(a.check_in).slice(0, 10) : '-'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-300 font-mono">
                      {a.check_in ? String(a.check_in).slice(11, 16) : '-'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-300 font-mono">
                      {a.check_out ? String(a.check_out).slice(11, 16) : 'Missing'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-sm font-bold text-emerald-400">
                      {Number(a.worked_hours).toFixed(2)}h
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        a.status === 'Normal' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                        a.status === 'Late' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                        a.status === 'Overtime' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Time Off Requests */}
      {tab === 'requests' && (
        <div className="overflow-x-auto">
          {leaveRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p>No leave requests found for this employee.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-slate-700/60 bg-slate-950/20">
                <tr>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaveRequests.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white text-sm">{r.type_name}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 font-mono">{r.start_date} to {r.end_date}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-white font-bold">
                      {formatDays(r.duration_days)} {Number(r.duration_days) === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400">{r.reason || 'None specified'}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        r.status === 'Approved' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                        r.status === 'Pending' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                        'bg-red-900/30 text-red-400 border-red-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Allocations */}
      {tab === 'allocations' && (
        <div className="overflow-x-auto">
          {allocations.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p>No leave allocations assigned to this employee.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-slate-700/60 bg-slate-950/20">
                <tr>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taken</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validity Period</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allocations.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white text-sm">{a.type_name}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-white font-bold">{formatDays(a.total_days)}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-amber-400">{formatDays(a.taken_days)}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-emerald-400 font-bold">{formatDays(a.remaining_days)}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 font-mono">{a.valid_from} to {a.valid_to}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        a.status === 'Approved' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                        a.status === 'Draft' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                        'bg-red-900/30 text-red-400 border-red-500/30'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
