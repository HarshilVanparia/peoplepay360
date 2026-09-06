import { getScheduleWithDays, upsertScheduleDay } from '../../../../actions/schedules'
import Link from 'next/link'
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react'

const WEEKDAYS = [
  { n: 1, label: 'Monday' }, { n: 2, label: 'Tuesday' }, { n: 3, label: 'Wednesday' },
  { n: 4, label: 'Thursday' }, { n: 5, label: 'Friday' }, { n: 6, label: 'Saturday' }, { n: 7, label: 'Sunday' },
]

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { schedule, days } = await getScheduleWithDays(id)

  if (!schedule) return <div className="p-8 text-slate-400">Schedule not found.</div>

  const dayMap: Record<number, any> = {}
  const dayList = days as any[]
  dayList.forEach(d => { dayMap[d.weekday] = d })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/schedules" className="hover:text-violet-300 transition-colors">Schedules</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">{(schedule as any).name}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{(schedule as any).name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">{(schedule as any).schedule_type}</span>
              <span className="flex items-center gap-1.5 text-sm text-slate-400">
                <Clock size={13} className="text-slate-600" />
                {Number((schedule as any).weekly_hours).toFixed(2)}h / week (auto-calculated)
              </span>
            </div>
          </div>
          <Link href="/schedules" className="p-2 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
            <ArrowLeft size={18} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Day Editor */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        <div className="border-b border-slate-700/60 px-6 py-4 flex items-center gap-3">
          <Clock size={17} className="text-violet-400" />
          <h2 className="font-semibold text-white">Weekly Pattern</h2>
          <span className="text-xs text-slate-500 ml-auto">Edit each day hours. Weekly total recalculates automatically.</span>
        </div>

        <div className="divide-y divide-slate-700/40">
          {WEEKDAYS.map(({ n, label }) => {
            const day = dayMap[n]
            const isWorking = Boolean(day?.start_time)
            return (
              <form
                key={n}
                action={async (fd: FormData) => {
                  'use server'
                  const enabled = fd.get('enabled') === 'on'
                  await upsertScheduleDay({
                    schedule_id: id,
                    weekday: n,
                    start_time: enabled ? String(fd.get('start_time') || '09:00') : null,
                    end_time: enabled ? String(fd.get('end_time') || '17:00') : null,
                    break_minutes: enabled ? Number(fd.get('break_minutes') || 0) : 0,
                  })
                }}
                className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-violet-900/5 transition-colors"
              >
                <div className="w-28">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enabled"
                      defaultChecked={isWorking}
                      className="w-4 h-4 rounded border-slate-600 text-violet-500 bg-slate-800 focus:ring-violet-500/30"
                    />
                    <span className={`text-sm font-semibold ${isWorking ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Start</p>
                    <input
                      type="time"
                      name="start_time"
                      defaultValue={day?.start_time ? String(day.start_time).slice(0, 5) : '09:00'}
                      className="w-28 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <span className="text-slate-600 mt-4">to</span>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">End</p>
                    <input
                      type="time"
                      name="end_time"
                      defaultValue={day?.end_time ? String(day.end_time).slice(0, 5) : '17:00'}
                      className="w-28 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Break (min)</p>
                    <input
                      type="number"
                      name="break_minutes"
                      min="0"
                      max="240"
                      defaultValue={day?.break_minutes ?? 60}
                      className="w-20 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white font-mono outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                {day?.start_time && day?.end_time && (
                  <span className="text-xs text-slate-500 font-mono">
                    {(() => {
                      const [sh, sm] = String(day.start_time).split(':').map(Number)
                      const [eh, em] = String(day.end_time).split(':').map(Number)
                      const net = (eh * 60 + em) - (sh * 60 + sm) - Number(day.break_minutes || 0)
                      return `${(net / 60).toFixed(1)}h net`
                    })()}
                  </span>
                )}

                <button
                  type="submit"
                  className="ml-auto rounded-lg border border-violet-500/40 bg-violet-900/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-900/30 transition-all cursor-pointer"
                >
                  Save
                </button>
              </form>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        Check the checkbox to mark a day as working. Uncheck to set it as a day off. Weekly hours recalculate on each save.
      </p>
    </div>
  )
}
