'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Check, X, Calendar, Clock, AlertCircle } from 'lucide-react'
import { approveTimeOffRequest, refuseTimeOffRequest } from '../../../actions/time-off'

const STATUS_COLORS: Record<string, string> = {
  Approved: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Pending: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
  Refused: 'bg-red-900/30 text-red-400 border-red-500/30',
  Cancelled: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
}

interface Props {
  requests: any[]
  canManage: boolean
}

export default function TimeOffRequestsTable({ requests, canManage }: Props) {
  const [term, setTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = requests.filter(r => {
    const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase()
    const typeName = (r.type_name || '').toLowerCase()
    const matchTerm = !term || fullName.includes(term.toLowerCase()) || typeName.includes(term.toLowerCase())
    const matchStatus = selectedStatus === 'all' || r.status === selectedStatus
    return matchTerm && matchStatus
  })

  async function handleApprove(req: any) {
    try {
      setLoadingId(`approve-${req.id}`)
      setActionError(null)
      await approveTimeOffRequest(String(req.id), String(req.employee_id), String(req.leave_type_id), Number(req.duration_days))
    } catch (err: any) {
      setActionError(err?.message || 'Failed to approve request')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleRefuse(reqId: string) {
    try {
      setLoadingId(`refuse-${reqId}`)
      setActionError(null)
      await refuseTimeOffRequest(reqId)
    } catch (err: any) {
      setActionError(err?.message || 'Failed to refuse request')
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

        <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-900/40 p-1">
          {['all', 'Pending', 'Approved', 'Refused'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === s
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {(term || selectedStatus !== 'all') && (
          <button
            onClick={() => { setTerm(''); setSelectedStatus('all') }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto text-sm text-slate-500 font-medium">
          {filtered.length} of {requests.length}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-slate-700/60 bg-slate-950/40">
            <tr>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              {canManage && <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="py-12 text-center text-slate-500 text-sm">
                  <Search size={28} className="mx-auto mb-2 opacity-40" />
                  <p>No time off requests match your criteria.</p>
                </td>
              </tr>
            ) : (
              filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-5">
                    <Link href={`/employees/${req.employee_id}`} className="font-semibold text-violet-400 hover:text-violet-300 transition-colors text-sm">
                      {req.first_name} {req.last_name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-sm text-slate-300 font-medium">
                    {req.type_name}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-400">
                    {req.start_date} to {req.end_date}
                  </td>
                  <td className="py-3.5 px-5 text-sm font-semibold text-white">
                    {Number(req.duration_days) % 1 === 0 ? String(Math.round(Number(req.duration_days))) : Number(req.duration_days).toFixed(1)} {Math.round(Number(req.duration_days)) === 1 ? 'day' : 'days'}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_COLORS[req.status] || 'bg-slate-800/60 text-slate-400 border-slate-600/40'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="py-3.5 px-5 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={loadingId !== null}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50 transition-colors"
                          >
                            <Check size={12} /> {loadingId === `approve-${req.id}` ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRefuse(String(req.id))}
                            disabled={loadingId !== null}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600/20 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition-colors"
                          >
                            <X size={12} /> {loadingId === `refuse-${req.id}` ? 'Refusing...' : 'Refuse'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
