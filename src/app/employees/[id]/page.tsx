import { getEmployeeHubData } from '../../../../actions/employees';
import { FileText, Clock, CalendarDays, Briefcase, Building, Mail, ChevronRight, Wallet, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '../../../../lib/db';

export default async function EmployeeHub({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const canEdit = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role);
  const { employee, stats, pay, balances } = await getEmployeeHubData(id);

  const [allocationCountRow] = await query(
    `SELECT COUNT(*) as cnt FROM leave_allocations WHERE employee_id = ?`,
    [id]
  ) as any[];
  const allocationCount = allocationCountRow?.cnt ?? 0;

  const [payslipCountRow] = await query(
    `SELECT COUNT(*) as cnt FROM payslips WHERE employee_id = ?`,
    [id]
  ) as any[];
  const payslipCount = payslipCountRow?.cnt ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/employees" className="hover:text-violet-300 transition-colors">Employees</Link>
        <ChevronRight size={12} />
        <span className="text-slate-300">{employee.first_name} {employee.last_name}</span>
      </div>

      {/* Identity Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-900/30 shrink-0">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{employee.first_name} {employee.last_name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-600" /> {employee.job_position}</span>
              <span className="flex items-center gap-1.5"><Building size={14} className="text-slate-600" /> {employee.department}</span>
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-600" /> {employee.email}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {canEdit && (
            <Link href={`/employees/${id}/edit`} className="rounded-xl border border-violet-500/40 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-900/20 transition-all">
              Edit Employee
            </Link>
          )}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${employee.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/60 text-slate-400 border-slate-600/40'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            {employee.status}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800/60 text-slate-400 border border-slate-700/60">
            {employee.system_role}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Working Schedule</p>
          <p className="mt-2 font-bold text-white">{employee.schedule_name || 'Not assigned'}</p>
          <p className="mt-0.5 text-sm text-slate-500">{employee.employment_type}</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Reporting Manager</p>
          <p className="mt-2 font-bold text-white">{employee.manager_name || 'Not assigned'}</p>
          <p className="mt-0.5 text-sm text-slate-500">{employee.department}</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Current Salary</p>
          <p className="mt-2 font-bold text-white text-xl font-mono">
            {pay ? `$${Number(pay.wage).toLocaleString()}` : 'No active contract'}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">{pay ? `Per ${pay.wage_period}` : 'Contract required'}</p>
        </div>
      </div>

      {/* Leave balances */}
      {(balances as any[]).length > 0 && (
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Leave Balances</p>
          <div className="grid md:grid-cols-4 gap-3">
            {(balances as any[]).map((b) => {
              const isUnpaid = b.payroll_treatment === 'Unpaid' || b.code === 'UNPAID'
              return (
                <div key={b.name} className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 text-center">
                  <p className="text-xs text-slate-400">{b.name}</p>
                  <p className="mt-1 text-xl font-bold font-mono text-white">
                    {isUnpaid ? 'Uncapped' : Number(b.remaining).toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isUnpaid ? 'On demand' : 'days remaining'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Smart Buttons - B2 spec: Contracts, Attendance, Time Off, Allocations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href={`/contracts?employee=${employee.id}`} className="group rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 hover:border-violet-500/50 hover:bg-violet-900/10 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900/30 text-blue-400 group-hover:bg-blue-900/50 transition-colors">
              <FileText size={18} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Contracts</p>
              <p className="text-[10px] text-slate-500">Historical & Active</p>
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-white">{stats.contractCount}</span>
        </Link>

        <Link href={`/attendance?employee=${employee.id}`} className="group rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 hover:border-violet-500/50 hover:bg-violet-900/10 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-900/30 text-indigo-400 group-hover:bg-indigo-900/50 transition-colors">
              <Clock size={18} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Attendance</p>
              <p className="text-[10px] text-slate-500">Daily Presence</p>
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-white">{stats.attendanceCount}</span>
        </Link>

        <Link href={`/time-off/requests?employee=${employee.id}`} className="group rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 hover:border-violet-500/50 hover:bg-violet-900/10 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-900/30 text-teal-400 group-hover:bg-teal-900/50 transition-colors">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Time Off</p>
              <p className="text-[10px] text-slate-500">Leaves & Requests</p>
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-white">{stats.leaveCount}</span>
        </Link>

        <Link href={`/time-off/allocations?employee=${employee.id}`} className="group rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 hover:border-violet-500/50 hover:bg-violet-900/10 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-900/30 text-amber-400 group-hover:bg-amber-900/50 transition-colors">
              <CalendarCheck size={18} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Allocations</p>
              <p className="text-[10px] text-slate-500">Leave Balances</p>
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-white">{allocationCount}</span>
        </Link>
      </div>

      {/* Banking warning */}
      {!employee.bank_account_no && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-900/10 px-5 py-3 flex items-center gap-3">
          <Wallet size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">Bank account details are missing. Payroll payments cannot be released without them.</p>
          {canEdit && (
            <Link href={`/employees/${id}/edit`} className="ml-auto text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors shrink-0">
              Add bank details
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
