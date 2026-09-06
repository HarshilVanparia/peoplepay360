'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTimeOffRequest, getMyLeaveContext } from '../../../../../actions/time-off'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function NewTimeOffRequest() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [formData, setFormData] = useState({ leave_type_id: '', start_date: '', end_date: '', duration_days: 0, reason: '' })

  useEffect(() => {
    getMyLeaveContext().then(setLeaveTypes)
  }, [])

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0
    const diff = new Date(end).getTime() - new Date(start).getTime()
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
  }

  function formatDays(val: any) {
    const n = Number(val || 0)
    return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await createTimeOffRequest({ ...formData, duration_days: calculateDuration(formData.start_date, formData.end_date) })
    router.push('/time-off/requests')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/time-off/requests" className="p-2 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Submit Leave Request</h1>
          <p className="text-sm text-slate-400 mt-0.5">Request scheduled time off against your leave balances.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {leaveTypes.map(t => {
            const isUnpaid = t.payroll_treatment === 'Unpaid' || t.code === 'UNPAID'
            return (
              <div key={t.id} className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-3.5">
                <p className="text-xs text-slate-400 font-medium truncate">{t.name}</p>
                <p className="mt-1 text-xl font-bold font-mono text-white">
                  {isUnpaid ? 'Uncapped' : `${formatDays(t.remaining_days)} days`}
                </p>
                <p className="text-[10px] text-violet-400 mt-0.5">{t.payroll_treatment}</p>
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Leave Type</label>
            <select
              required
              value={formData.leave_type_id}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              onChange={e => setFormData({ ...formData, leave_type_id: e.target.value })}
            >
              <option value="">Select leave type...</option>
              {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.payroll_treatment})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                required
                type="date"
                value={formData.start_date}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                required
                type="date"
                value={formData.end_date}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Reason (Optional)</label>
            <textarea
              rows={3}
              value={formData.reason}
              placeholder="Provide reason or notes for HR..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-900/30 cursor-pointer"
        >
          <Save size={16} /> {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
