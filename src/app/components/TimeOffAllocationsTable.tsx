'use client'

import { useState } from 'react'
import { CalendarDays, Check, X, Search, AlertCircle } from 'lucide-react'
import { approveAllocation, refuseAllocation } from '../../../actions/time-off-admin'

const STATUS_COLORS: Record<string, string> = {
  Approved: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Draft: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
  Refused: 'bg-red-900/30 text-red-400 border-red-500/30',
  Expired: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
}

const STATUSES = ['All Statuses', 'Draft', 'Approved', 'Refused', 'Expired']

interface Props {
  allocations: any[]
}

export default function TimeOffAllocationsTable({ allocations }: Props) {
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = allocations.filter(a => {
    const fullName = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
    const typeName = (a.type_name || '').toLowerCase()
    const matchTerm = !term || fullName.includes(term.toLowerCase()) || typeName.includes(term.toLowerCase())
    const matchStatus = status === 'All Statuses' || a.status === status
    return matchTerm && matchStatus
  })

  async function handleApprove(id: string) {
    try {
      setLoadingId(`approve-${id}`)
      setActionError(null)
      await approveAllocation(id)
    } catch (err: any) {
      setActionError(err?.message || 'Failed to approve allocation')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleRefuse(id: string) {
    try {
      setLoadingId(`refuse-${id}`)
      setActionError(null)
      await refuseAllocation(id)
    } catch (err: any) {
      setActionError(err?.message || 'Failed to refuse allocation')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search employee or leave type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        {(term || status !== 'All Statuses') && (
          <button
            onClick={() => { setTerm(''); setStatus('All Statuses') }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto text-sm text-slate-500 font-medium">
          {filtered.length} of {allocations.length}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-slate-700/60 bg-slate-950/40">
            <tr>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validity Period</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Total</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Taken</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Remaining</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                  <Search size={28} className="mx-auto mb-2 opacity-40" />
                  <p>No allocations match your search or filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map(alloc => (
                <tr key={alloc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-white text-sm">
                    {alloc.first_name} {alloc.last_name}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="flex items-center gap-2 text-sm text-slate-300">
                      <CalendarDays size={13} className="text-violet-400 shrink-0" />
                      {alloc.type_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-400 font-mono">
                    {alloc.valid_from} to {alloc.valid_to}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-white text-sm">
                    {Number(alloc.total_days) % 1 === 0 ? String(Math.round(Number(alloc.total_days))) : Number(alloc.total_days).toFixed(1)}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono text-sm text-amber-400">
                    {Number(alloc.taken_days) % 1 === 0 ? String(Math.round(Number(alloc.taken_days))) : Number(alloc.taken_days).toFixed(1)}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-sm text-emerald-400">
                    {Number(alloc.remaining_days) % 1 === 0 ? String(Math.round(Number(alloc.remaining_days))) : Number(alloc.remaining_days).toFixed(1)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      STATUS_COLORS[alloc.status] || STATUS_COLORS.Draft
                    }`}>
                      {alloc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {alloc.status === 'Draft' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(String(alloc.id))}
                          disabled={loadingId !== null}
                          title="Approve"
                          className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleRefuse(String(alloc.id))}
                          disabled={loadingId !== null}
                          title="Refuse"
                          className="p-1.5 rounded-lg border border-red-500/30 bg-red-900/20 text-red-400 hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
