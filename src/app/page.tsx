import { query } from '../../lib/db'
import { syncEmployeeLeaveStatuses } from '../../actions/employees'
import {
  Users,
  Banknote,
  CalendarDays,
  AlertTriangle,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardCharts } from './components/DashboardCharts'
import DashboardFilters from './components/DashboardFilters'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

interface Props {
  searchParams: Promise<{
    period?: string
    department?: string
    employment_type?: string
  }>
}

export default async function PayrollDashboard({ searchParams }: Props) {
  await syncEmployeeLeaveStatuses()
  const params = await searchParams
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  const employeeId = (session?.user as any)?.id

  // Employee Workspace
  if (role === 'Employee') {
    const balances = await query(
      `SELECT t.name, COALESCE(SUM(a.remaining_days),0) AS remaining
       FROM leave_types t
       LEFT JOIN leave_allocations a ON a.leave_type_id=t.id AND a.employee_id=? AND a.status='Approved'
       GROUP BY t.id, t.name
       ORDER BY t.name`,
      [employeeId]
    ) as any[]

    const attendance = await query(
      `SELECT COUNT(*) AS present, COALESCE(SUM(worked_hours),0) AS hours
       FROM attendance
       WHERE employee_id=? AND MONTH(check_in)=MONTH(CURDATE())`,
      [employeeId]
    ) as any[]

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div>
            <p className="text-xs font-bold tracking-[.2em] text-violet-400 uppercase">My Workspace</p>
            <h1 className="text-3xl font-extrabold text-white mt-1">Welcome back, {session?.user?.name}</h1>
            <p className="mt-1 text-sm text-slate-400">Your live leave balances and attendance summary for this month.</p>
          </div>
          <Link
            href="/attendance"
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30 flex items-center gap-2"
          >
            <Clock size={16} /> Open Attendance
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Leave Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {balances.map(b => (
              <div key={b.name} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{b.name}</p>
                <p className="mt-3 text-4xl font-extrabold text-white">
                  {Number(b.remaining).toFixed(0)}{' '}
                  <span className="text-sm font-normal text-slate-400">days remaining</span>
                </p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">This Month Worked</p>
              <p className="mt-3 text-4xl font-extrabold text-emerald-400">
                {Number(attendance[0]?.hours || 0).toFixed(1)}{' '}
                <span className="text-sm font-normal text-slate-400">hours</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{attendance[0]?.present || 0} check-ins logged</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Management / HR / Payroll Dashboard
  const period = params.period || 'current_month'
  const deptFilter = params.department && params.department !== 'All Departments' ? params.department : null

  // Date filters for payslip metrics
  let periodSql = '1=1'
  if (period === 'current_month') {
    periodSql = 'pr.period_start >= DATE_FORMAT(CURDATE(), "%Y-%m-01") AND pr.period_start <= LAST_DAY(CURDATE())'
  } else if (period === 'last_month') {
    periodSql = 'pr.period_start >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), "%Y-%m-01") AND pr.period_start <= LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))'
  } else if (period === 'ytd') {
    periodSql = 'pr.period_start >= DATE_FORMAT(CURDATE(), "%Y-01-01") AND pr.period_start <= LAST_DAY(CURDATE())'
  }

  // Active employees count
  const empDeptClause = deptFilter ? 'AND department = ?' : ''
  const empDeptVals = deptFilter ? [deptFilter] : []
  const [empCountRow]: any = await query(
    `SELECT COUNT(*) as active_count FROM employees WHERE status = 'Active' ${empDeptClause}`,
    empDeptVals
  )
  const activeEmployees = empCountRow?.active_count || 0

  // Payroll Metrics
  const payslipDeptClause = deptFilter ? 'AND e.department = ?' : ''
  const [payrollMetrics]: any = await query(
    `SELECT
       COALESCE(SUM(ps.gross_salary), 0) as total_gross,
       COALESCE(SUM(ps.net_salary), 0) as total_net,
       COALESCE(SUM(ps.deductions), 0) as total_deductions
     FROM payslips ps
     JOIN payruns pr ON pr.id = ps.payrun_id
     JOIN employees e ON e.id = ps.employee_id
     WHERE ps.status IN ('Validated', 'Paid') AND ${periodSql} ${payslipDeptClause}`,
    empDeptVals
  )

  // Pending Approvals count (leave requests + draft allocations)
  const [pendingLeaveRow]: any = await query(
    `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'`
  )
  const [draftAllocRow]: any = await query(
    `SELECT COUNT(*) as count FROM leave_allocations WHERE status = 'Draft'`
  )
  const totalPendingApprovals = (pendingLeaveRow?.count || 0) + (draftAllocRow?.count || 0)

  // Anomalies count
  const [missingBankRow]: any = await query(
    `SELECT COUNT(*) as count FROM employees WHERE status = 'Active' AND (bank_account_no IS NULL OR TRIM(bank_account_no) = '')`
  )
  const [flaggedPayslipsRow]: any = await query(
    `SELECT COUNT(*) as count FROM payslips WHERE has_warning = TRUE`
  )
  const totalAnomalies = (missingBankRow?.count || 0) + (flaggedPayslipsRow?.count || 0)

  // Department list for filters
  const deptListRows = await query(
    `SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND department != '' ORDER BY department ASC`
  ) as any[]
  const departments = deptListRows.map(d => d.department)

  // Operational Alerts:
  // 1. Missing bank accounts
  const missingBankEmployees = await query(
    `SELECT id, first_name, last_name, department FROM employees WHERE status = 'Active' AND (bank_account_no IS NULL OR TRIM(bank_account_no) = '') LIMIT 4`
  ) as any[]

  // 2. Contracts expiring in 30 days
  const expiringContracts = await query(
    `SELECT c.id, c.employee_id, e.first_name, e.last_name, c.end_date
     FROM contracts c
     JOIN employees e ON c.employee_id = e.id
     WHERE c.status = 'Active' AND c.end_date IS NOT NULL AND c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
     LIMIT 4`
  ) as any[]

  // 3. Pending leave requests requiring action
  const pendingRequests = await query(
    `SELECT r.id, e.first_name, e.last_name, t.name as type_name, r.duration_days, r.start_date
     FROM leave_requests r
     JOIN employees e ON r.employee_id = e.id
     JOIN leave_types t ON r.leave_type_id = t.id
     WHERE r.status = 'Pending'
     ORDER BY r.start_date ASC
     LIMIT 4`
  ) as any[]

  // 4. Draft/Computed Payruns waiting for review
  const openPayruns = await query(
    `SELECT id, name, period_start, period_end, status
     FROM payruns
     WHERE status IN ('Draft', 'Computed')
     ORDER BY created_at DESC
     LIMIT 4`
  ) as any[]

  // Attendance & Time-Off Overview:
  const [attStats]: any = await query(
    `SELECT
       COALESCE(SUM(worked_hours), 0) as total_hours,
       COUNT(*) as total_records,
       SUM(status = 'Late') as late_count,
       SUM(status = 'Overtime') as overtime_count
     FROM attendance
     WHERE check_in >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`
  )

  const employeesOnLeave = await query(
    `SELECT e.id, e.first_name, e.last_name, t.name as leave_type, r.end_date
     FROM leave_requests r
     JOIN employees e ON r.employee_id = e.id
     JOIN leave_types t ON r.leave_type_id = t.id
     WHERE r.status = 'Approved' AND CURDATE() BETWEEN r.start_date AND r.end_date
     LIMIT 5`
  ) as any[]

  // Department Breakdown Table
  const departmentBreakdown = await query(
    `SELECT
       e.department as name,
       COUNT(DISTINCT e.id) as staff_count,
       COALESCE(SUM(ps.gross_salary), 0) as gross_cost,
       COALESCE(SUM(ps.net_salary), 0) as net_disbursed,
       COALESCE(AVG(c.wage), 0) as avg_wage
     FROM employees e
     LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'Active'
     LEFT JOIN payslips ps ON ps.employee_id = e.id AND ps.status IN ('Validated', 'Paid')
     WHERE e.status = 'Active' AND e.department IS NOT NULL
     GROUP BY e.department
     ORDER BY gross_cost DESC`
  ) as any[]

  // Charts data
  const departmentChartData = departmentBreakdown.map(d => ({
    name: d.name,
    cost: Number(d.gross_cost) || 0,
  }))

  const trendData = await query(
    `SELECT DATE_FORMAT(pr.period_start, '%b %Y') as month, COALESCE(SUM(ps.net_salary), 0) as net
     FROM payruns pr
     JOIN payslips ps ON pr.id = ps.payrun_id
     WHERE pr.status IN ('Validated', 'Paid')
     GROUP BY month, pr.period_start
     ORDER BY MIN(pr.period_start) ASC
     LIMIT 6`
  ) as any[]

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time workforce metrics, payroll disbursements, and operational alarms.
          </p>
        </div>
        <DashboardFilters departments={departments} />
      </div>

      {/* KPI Cards Grid (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Gross Cost */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Payroll</span>
            <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400"><Banknote size={18} /></div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-white font-mono">
              ${Number(payrollMetrics?.total_gross || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Gross committed</p>
          </div>
        </div>

        {/* Net Disbursed */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Disbursed</span>
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400"><CheckCircle2 size={18} /></div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-emerald-400 font-mono">
              ${Number(payrollMetrics?.total_net || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Paid or validated</p>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Deductions</span>
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400"><Briefcase size={18} /></div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-indigo-300 font-mono">
              ${Number(payrollMetrics?.total_deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Taxes and rules</p>
          </div>
        </div>

        {/* Active Staff */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Staff</span>
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400"><Users size={18} /></div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-white">{activeEmployees}</p>
            <p className="text-[11px] text-slate-500 mt-1">Employees active</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400"><CalendarDays size={18} /></div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-amber-400">{totalPendingApprovals}</p>
            <p className="text-[11px] text-slate-500 mt-1">Leaves and allocations</p>
          </div>
        </div>

        {/* Anomalies */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Anomalies</span>
            <div className="p-2 rounded-xl bg-red-600/10 text-red-400"><AlertTriangle size={18} /></div>
          </div>
          <div className="mt-4">
            <p className={`text-2xl font-black ${totalAnomalies > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {totalAnomalies}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Missing bank or flags</p>
          </div>
        </div>
      </div>

      {/* Operational Alerts Panel */}
      {(missingBankEmployees.length > 0 || expiringContracts.length > 0 || pendingRequests.length > 0 || openPayruns.length > 0) && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-amber-400" size={20} />
            <h2 className="text-base font-bold text-white">Operational Attention Required</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Missing Bank Account */}
            {missingBankEmployees.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-slate-900/60 p-4">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  Missing Bank Accounts ({missingBankEmployees.length})
                </p>
                <div className="space-y-2">
                  {missingBankEmployees.map(e => (
                    <Link
                      key={e.id}
                      href={`/employees/${e.id}`}
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <span>{e.first_name} {e.last_name}</span>
                      <ChevronRight size={12} className="text-slate-500" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring Contracts */}
            {expiringContracts.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-slate-900/60 p-4">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Expiring in 30 Days ({expiringContracts.length})
                </p>
                <div className="space-y-2">
                  {expiringContracts.map(c => (
                    <Link
                      key={c.id}
                      href={`/contracts/new?edit=${c.id}`}
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <span>{c.first_name} {c.last_name}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{c.end_date}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Leave Requests */}
            {pendingRequests.length > 0 && (
              <div className="rounded-xl border border-violet-500/20 bg-slate-900/60 p-4">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">
                  Pending Leaves ({pendingRequests.length})
                </p>
                <div className="space-y-2">
                  {pendingRequests.map(r => (
                    <Link
                      key={r.id}
                      href="/time-off/requests?status=Pending"
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <span>{r.first_name} ({r.type_name})</span>
                      <span className="text-[10px] text-violet-300 font-semibold">
                        {Number(r.duration_days) % 1 === 0 ? String(Math.round(Number(r.duration_days))) : Number(r.duration_days).toFixed(1)}d
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Unprocessed Payruns */}
            {openPayruns.length > 0 && (
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/60 p-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Active Batches ({openPayruns.length})
                </p>
                <div className="space-y-2">
                  {openPayruns.map(p => (
                    <Link
                      key={p.id}
                      href={`/payroll/payruns/${p.id}`}
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/20">
                        {p.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance & Time-Off Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Attendance Pulse</h2>
            <Clock size={16} className="text-violet-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-400">Total Hours This Month</span>
              <span className="text-2xl font-black text-white font-mono">{Number(attStats?.total_hours || 0).toFixed(1)}h</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-400">Total Attendance Logs</span>
              <span className="text-base font-bold text-slate-300 font-mono">{attStats?.total_records || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase font-bold">Late Arrivals</span>
                <p className="text-lg font-bold text-amber-300 mt-1">{attStats?.late_count || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
                <span className="text-[10px] text-blue-400 uppercase font-bold">Overtime Logs</span>
                <p className="text-lg font-bold text-blue-300 mt-1">{attStats?.overtime_count || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">On Leave Today</h2>
            <CalendarDays size={16} className="text-emerald-400" />
          </div>
          {employeesOnLeave.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <p>No employees currently out on leave today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employeesOnLeave.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/30 border border-slate-800">
                  <span className="text-sm font-semibold text-white">{emp.first_name} {emp.last_name}</span>
                  <div className="text-right">
                    <span className="text-xs text-violet-400 font-medium block">{emp.leave_type}</span>
                    <span className="text-[10px] text-slate-500">until {emp.end_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Quick Nav Links</h2>
              <ArrowRight size={16} className="text-slate-400" />
            </div>
            <div className="space-y-2">
              <Link
                href="/payroll/payruns/new"
                className="flex items-center justify-between p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs font-semibold text-violet-300 hover:bg-violet-600/20 transition-colors"
              >
                <span>Launch New Payrun Wizard</span>
                <ChevronRight size={14} />
              </Link>
              <Link
                href="/time-off/allocations/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 transition-colors"
              >
                <span>Assign Leave Allocation</span>
                <ChevronRight size={14} />
              </Link>
              <Link
                href="/contracts/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 transition-colors"
              >
                <span>Create Employment Contract</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <Link
              href="/payroll/structures"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1 font-medium"
            >
              Configure Salary Structures & Rules <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Graphical Analytics */}
      <DashboardCharts departmentData={departmentChartData} trendData={trendData} />

      {/* Department Breakdown Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Department Workforce & Cost Analysis</h2>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-slate-700/60 bg-slate-950/40">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Active Staff</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Gross Cost</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Net Disbursed</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Average Base Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {departmentBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No department data available.
                  </td>
                </tr>
              ) : (
                departmentBreakdown.map(dept => (
                  <tr key={dept.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white text-sm">
                      {dept.name}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-slate-300 font-mono">
                      {dept.staff_count}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-white text-sm">
                      ${Number(dept.gross_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400 text-sm">
                      ${Number(dept.net_disbursed).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm text-slate-400">
                      ${Number(dept.avg_wage).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
