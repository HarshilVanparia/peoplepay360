'use client'

import { useState, useTransition, useEffect } from 'react'
import { Clock, LogIn, LogOut, Calendar, AlertTriangle, CheckCircle2, Timer } from 'lucide-react'
import { clockMyAttendance } from '../../../actions/attendance'
import { generateAttendancePDF } from '../../../lib/pdf'

interface AttendanceRecord {
  id: number
  check_in: string
  check_out: string | null
  worked_hours: number
  status: string
  schedule_name?: string
  scheduled_start?: string
  scheduled_end?: string
}

interface Props {
  isClockedIn: boolean
  lastRecord: AttendanceRecord | null
  history: AttendanceRecord[]
  firstName: string
}

const STATUS_COLORS: Record<string, string> = {
  Normal: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Late: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
  Absent: 'bg-red-900/30 text-red-400 border-red-500/30',
  Overtime: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  'Manual Correction': 'bg-purple-900/30 text-purple-400 border-purple-500/30',
}

function formatDT(dt: string | null | undefined) {
  if (!dt) return null
  const s = String(dt).replace('T', ' ')
  return s.slice(0, 16)
}

function formatTime(t: string | null | undefined) {
  if (!t) return null
  const s = String(t).replace('T', ' ')
  return s.slice(11, 16)
}

function formatScheduleTime(t: string | null | undefined) {
  if (!t) return null
  return String(t).slice(0, 5)
}

export default function EmployeeClockWidget({ isClockedIn: initialClockedIn, lastRecord: initialLast, history, firstName }: Props) {
  const [isClockedIn, setIsClockedIn] = useState(initialClockedIn)
  const [lastRecord] = useState(initialLast)
  const [tab, setTab] = useState<'clock' | 'history'>('clock')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [isPending, startTransition] = useTransition()
  const [searchDate, setSearchDate] = useState('')
  const [mounted, setMounted] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const d = new Date()
      setTimeStr(d.toLocaleTimeString([], { timeStyle: 'medium' }))
      setDateStr(d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClock = (action: 'in' | 'out') => {
    setMessage('')
    startTransition(async () => {
      try {
        await clockMyAttendance(action)
        setIsClockedIn(action === 'in')
        setMessageType('success')
        setMessage(action === 'in' ? 'Checked in successfully.' : 'Checked out successfully. Have a great day!')
      } catch (err: any) {
        setMessageType('error')
        setMessage(err.message || 'Something went wrong.')
      }
    })
  }

  const filteredHistory = history.filter(r => {
    if (!searchDate) return true
    return r.check_in.startsWith(searchDate)
  })

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-900/40 p-1 w-fit">
        <button
          onClick={() => setTab('clock')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === 'clock' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-white'}`}
        >
          Clock
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === 'history' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-white'}`}
        >
          My History
        </button>
      </div>

      {tab === 'clock' && (
        <div className="max-w-xl space-y-5">
          {/* Clock card */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-8 text-center space-y-2 backdrop-blur-sm">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Current Time</p>
            <p className="text-5xl font-bold font-mono text-white tracking-tight" suppressHydrationWarning>
              {mounted ? timeStr : '--:--:--'}
            </p>
            <p className="text-sm text-slate-400" suppressHydrationWarning>
              {mounted ? dateStr : 'Loading clock...'}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className={isClockedIn ? 'text-emerald-400' : 'text-slate-400'}>{isClockedIn ? 'Clocked In' : 'Not Clocked In'}</span>
            </div>
          </div>

          {/* Status message */}
          {message && (
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${messageType === 'success' ? 'border-emerald-500/30 bg-emerald-900/20 text-emerald-300' : 'border-red-500/30 bg-red-900/20 text-red-300'}`}>
              {messageType === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
              {message}
            </div>
          )}

          {/* Last record info */}
          {lastRecord && (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Last Record</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Check In</p>
                  <p className="font-semibold text-sm text-white mt-1" suppressHydrationWarning>{formatDT(lastRecord.check_in)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Check Out</p>
                  <p className={`font-semibold text-sm mt-1 ${lastRecord.check_out ? 'text-white' : 'text-amber-400 italic'}`} suppressHydrationWarning>
                    {lastRecord.check_out ? formatDT(lastRecord.check_out) : 'Still active'}
                  </p>
                </div>
                {lastRecord.check_out && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hours Worked</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Timer size={14} className="text-violet-400" />
                      <span className="font-bold text-white font-mono">{Number(lastRecord.worked_hours).toFixed(2)}h</span>
                    </div>
                  </div>
                )}
                {lastRecord.scheduled_start && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Scheduled</p>
                    <p className="text-sm text-slate-300 mt-1 font-mono">
                      {formatScheduleTime(lastRecord.scheduled_start)} - {formatScheduleTime(lastRecord.scheduled_end)}
                    </p>
                  </div>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[lastRecord.status] || STATUS_COLORS.Normal}`}>
                {lastRecord.status}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleClock('in')}
              disabled={isPending || isClockedIn}
              className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-900/20 py-6 px-4 font-bold text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <LogIn size={28} />
              <span>Check In</span>
              {isClockedIn && <span className="text-xs font-normal opacity-60">Already active</span>}
            </button>
            <button
              onClick={() => handleClock('out')}
              disabled={isPending || !isClockedIn}
              className="flex flex-col items-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-900/20 py-6 px-4 font-bold text-violet-300 hover:bg-violet-900/40 hover:border-violet-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <LogOut size={28} />
              <span>Check Out</span>
              {!isClockedIn && <span className="text-xs font-normal opacity-60">Not clocked in</span>}
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {/* Filter + Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            {searchDate && (
              <button onClick={() => setSearchDate('')} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                Clear date
              </button>
            )}
            <button
              onClick={() => generateAttendancePDF(filteredHistory, `${firstName} Attendance`)}
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-900/20 hover:border-violet-400/60 transition-all cursor-pointer"
            >
              <Clock size={14} /> Export PDF
            </button>
          </div>

          {/* History Table */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Clock size={28} className="mx-auto mb-2 opacity-40" />
                <p>No attendance records found.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check In</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check Out</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hours</th>
                    <th className="py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {filteredHistory.map(r => (
                    <tr key={r.id} className="hover:bg-violet-900/10 transition-colors">
                      <td className="py-3.5 px-5 text-sm font-semibold text-slate-300 font-mono" suppressHydrationWarning>
                        {r.check_in ? String(r.check_in).slice(0, 10) : '-'}
                      </td>
                      <td className="py-3.5 px-5 text-sm font-mono text-white" suppressHydrationWarning>
                        {formatTime(r.check_in)}
                        {r.scheduled_start && (
                          <span className="ml-2 text-[10px] text-slate-500 font-mono">
                            (sch. {formatScheduleTime(r.scheduled_start)})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm font-mono" suppressHydrationWarning>
                        {r.check_out ? (
                          <span className="text-white">
                            {formatTime(r.check_out)}
                            {r.scheduled_end && (
                              <span className="ml-2 text-[10px] text-slate-500 font-mono">
                                (sch. {formatScheduleTime(r.scheduled_end)})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-amber-400 italic text-xs">Active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-400">{(r as any).schedule_name || '-'}</td>
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
          <p className="text-xs text-slate-600 text-right">{filteredHistory.length} records</p>
        </div>
      )}
    </div>
  )
}
