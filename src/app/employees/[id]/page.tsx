import { getEmployeeHubData } from '../../../../actions/employees'
import { Briefcase, Building, Mail, ChevronRight, Wallet, CalendarCheck, Pencil, ArrowLeft, Clock, ShieldCheck, CreditCard } from 'lucide-react'
import Link from 'next/link'
import EmployeeHubTabs from '../../components/EmployeeHubTabs'

export default async function EmployeeHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { employee, pay, balances, contracts, attendance, leaveRequests, allocations } = await getEmployeeHubData(id)

  if (!employee) {
    return <div className="p-8 text-slate-400">Employee record not found.</div>
  }

  function formatDays(val: any) {
    const n = Number(val || 0)
    return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1)
  }

  const isOnLeave = employee.status === 'On Leave'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/employees" className="hover:text-violet-300 transition-colors">Employees</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">{employee.first_name} {employee.last_name}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-violet-900/40 shrink-0">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {employee.first_name} {employee.last_name}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isOnLeave
                    ? 'bg-amber-900/30 text-amber-400 border-amber-500/30'
                    : employee.status === 'Active'
                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {employee.status}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-900/30 text-violet-300 border border-violet-500/30">
                  {employee.system_role}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700">
                  {employee.employment_type || 'Full-Time'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Briefcase size={13} className="text-violet-400" />
                  {employee.job_position}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building size={13} className="text-violet-400" />
                  {employee.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-violet-400" />
                  {employee.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/employees/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30"
            >
              <Pencil size={15} /> Edit Profile
            </Link>
            <Link
              href="/employees"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Master details card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Working Schedule */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock size={14} className="text-violet-400" />
            <p className="text-[10px] uppercase tracking-widest font-bold">Working Schedule</p>
          </div>
          <p className="font-bold text-white text-base">{employee.schedule_name || 'Not assigned'}</p>
          <p className="mt-1 text-xs text-slate-400">
            {employee.weekly_hours ? `${Number(employee.weekly_hours).toFixed(0)}h expected weekly` : employee.employment_type}
          </p>
        </div>

        {/* Reporting Manager */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <p className="text-[10px] uppercase tracking-widest font-bold">Reporting Manager</p>
          </div>
          <p className="font-bold text-white text-base">{employee.manager_name || 'Direct / None'}</p>
          <p className="mt-1 text-xs text-slate-400">{employee.department} Division</p>
        </div>

        {/* Current Salary */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Wallet size={14} className="text-emerald-400" />
            <p className="text-[10px] uppercase tracking-widest font-bold">Current Base Wage</p>
          </div>
          <p className="font-bold font-mono text-emerald-400 text-lg">
            {pay ? `$${Number(pay.wage).toLocaleString()}` : 'No active contract'}
          </p>
          <p className="mt-1 text-xs text-slate-400">{pay ? `Per ${pay.wage_period}` : 'Contract required'}</p>
        </div>

        {/* Bank Details */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CreditCard size={14} className={employee.bank_account_no ? 'text-violet-400' : 'text-amber-400'} />
            <p className="text-[10px] uppercase tracking-widest font-bold">Banking Information</p>
          </div>
          <p className="font-mono text-sm font-bold text-white truncate">
            {employee.bank_account_no || 'Missing Account'}
          </p>
          <p className="mt-1 text-xs text-slate-400 truncate">
            {employee.bank_name || 'No bank name set'}
          </p>
        </div>
      </div>

      {/* Leave Balances Grid (Display integers 14, 12, 10 and Uncapped for unpaid) */}
      {(balances as any[]).length > 0 && (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={16} className="text-violet-400" />
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Leave Entitlements & Balances</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(balances as any[]).map((b) => {
              const isUnpaid = b.payroll_treatment === 'Unpaid' || b.code === 'UNPAID'
              return (
                <div key={b.name} className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-3.5 text-center">
                  <p className="text-xs text-slate-400 font-medium truncate">{b.name}</p>
                  <p className="mt-1.5 text-2xl font-black font-mono text-white">
                    {isUnpaid ? 'Uncapped' : formatDays(b.remaining)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isUnpaid ? 'On demand' : 'days remaining'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Embedded User-Specific Sections: Contracts, Attendance, Time Off, Allocations */}
      <EmployeeHubTabs
        employeeId={id}
        contracts={contracts}
        attendance={attendance}
        leaveRequests={leaveRequests}
        allocations={allocations}
      />
    </div>
  )
}
