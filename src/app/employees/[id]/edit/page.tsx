'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getEmployeeHubData, getEmployees, updateEmployee } from '../../../../../actions/employees'
import { getSchedules } from '../../../../../actions/schedules'
import { ChevronRight, Save, X } from 'lucide-react'

const ROLES = ['Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'] as const
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Intern'] as const
const STATUSES = ['Active', 'On Leave', 'Inactive', 'Terminated'] as const

export default function EditEmployee({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [schedules, setSchedules] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getEmployeeHubData(id),
      getSchedules(),
      getEmployees(),
    ]).then(([hub, scheds, emps]) => {
      setForm(hub.employee)
      setSchedules(scheds)
      setManagers(emps)
    })
  }, [id])

  if (!form) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm animate-pulse">Loading employee record...</div>
    </div>
  )

  const field = (key: string, label: string, type = 'text') => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
      />
    </div>
  )

  const select = (key: string, label: string, options: readonly string[]) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        value={form[key] ?? ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateEmployee(id, form)
      router.push(`/employees/${id}`)
    } catch (err: any) {
      setError(err.message || 'Save failed.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/employees" className="hover:text-violet-300 transition-colors">Employees</Link>
            <ChevronRight size={12} />
            <Link href={`/employees/${id}`} className="hover:text-violet-300 transition-colors">{form.first_name} {form.last_name}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-300">Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Edit {form.first_name} {form.last_name}</h1>
          <p className="text-sm text-slate-400 mt-1">Update employee profile and system access.</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/employees/${id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-400 transition-all">
            <X size={15} /> Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-900/30"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Personal Info */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-7 space-y-5">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700/60 pb-3">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {field('first_name', 'First Name')}
          {field('last_name', 'Last Name')}
          {field('email', 'Email Address', 'email')}
          {field('job_position', 'Job Position')}
          {field('department', 'Department')}
          {select('employment_type', 'Employment Type', EMPLOYMENT_TYPES)}
          {select('status', 'Status', STATUSES)}
          {select('system_role', 'System Role', ROLES)}
        </div>
      </div>

      {/* Org + Schedule */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-7 space-y-5">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700/60 pb-3">Organisation</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Reporting Manager</label>
            <select
              value={form.manager_id ?? ''}
              onChange={e => setForm({ ...form, manager_id: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <option value="">No manager</option>
              {managers.filter(m => String(m.id) !== id).map(m => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name} - {m.job_position}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Working Schedule</label>
            <select
              value={form.schedule_id ?? ''}
              onChange={e => setForm({ ...form, schedule_id: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <option value="">No schedule</option>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Banking */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-7 space-y-5">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700/60 pb-3">Banking Details</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {field('bank_name', 'Bank Name')}
          {field('bank_account_no', 'Account Number')}
        </div>
      </div>
    </form>
  )
}
