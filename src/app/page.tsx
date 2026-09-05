import { query } from '../../lib/db';
import { Users, Banknote, CalendarDays, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { DashboardCharts } from './components/DashboardCharts';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function PayrollDashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const employeeId = (session?.user as any)?.id;
  if (role === 'Employee') {
    const balances = await query(`SELECT t.name, COALESCE(SUM(a.remaining_days),0) AS remaining FROM leave_types t LEFT JOIN leave_allocations a ON a.leave_type_id=t.id AND a.employee_id=? AND a.status='Approved' GROUP BY t.id,t.name ORDER BY t.name`, [employeeId]) as any[];
    const attendance = await query(`SELECT COUNT(*) AS present, COALESCE(SUM(worked_hours),0) AS hours FROM attendance WHERE employee_id=? AND MONTH(check_in)=MONTH(CURDATE())`, [employeeId]) as any[];
    return <div className="space-y-7"><div><p className="text-xs tracking-[.2em] text-violet-300">MY WORKSPACE</p><h1 className="text-3xl font-bold">Welcome back {session?.user?.name}</h1><p className="mt-2 text-sm text-slate-400">Your current leave balance and attendance summary.</p></div><div className="grid md:grid-cols-3 gap-5">{balances.map(balance=><div key={balance.name} className="rounded-2xl border border-slate-200 p-6"><p className="text-sm text-slate-400">{balance.name}</p><p className="mt-3 text-4xl font-bold">{Number(balance.remaining).toFixed(1)} <span className="text-base text-slate-400">days</span></p></div>)}<div className="rounded-2xl border border-slate-200 p-6"><p className="text-sm text-slate-400">This month</p><p className="mt-3 text-4xl font-bold">{attendance[0]?.present || 0}</p><p className="text-sm text-slate-400">attendance records</p></div></div></div>;
  }
  const [metrics] = await query(`
    SELECT 
      (SELECT COUNT(*) FROM employees WHERE status = 'Active') as active_employees,
      (SELECT SUM(net_salary) FROM payslips WHERE status IN ('Validated', 'Paid')) as total_paid,
      (SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending') as pending_leaves,
      (SELECT COUNT(*) FROM payslips p JOIN employees e ON p.employee_id = e.id WHERE e.bank_account_no IS NULL OR p.has_warning = TRUE) as anomalies
  `) as any[];

  // Real SQL aggregation for the charts[cite: 1]
  const departmentData = await query(`
    SELECT e.department as name, COALESCE(SUM(p.gross_salary), 0) as cost
    FROM employees e
    LEFT JOIN payslips p ON e.id = p.employee_id AND p.status IN ('Validated', 'Paid')
    GROUP BY e.department
  `) as any[];

  const trendData = await query(`
    SELECT DATE_FORMAT(pr.period_start, '%b') as month, COALESCE(SUM(ps.net_salary), 0) as net
    FROM payruns pr
    JOIN payslips ps ON pr.id = ps.payrun_id
    WHERE pr.status IN ('Validated', 'Paid')
    GROUP BY month
    ORDER BY MIN(pr.period_start) ASC LIMIT 6
  `) as any[];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operational Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live metrics and historical payroll trends[cite: 1].</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Staff</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.active_employees}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg"><Banknote size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Net Disbursed</p>
              <p className="text-2xl font-bold text-slate-900">${Number(metrics.total_paid || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-lg"><CalendarDays size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Leaves</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.pending_leaves}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Payroll Anomalies</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.anomalies}</p>
            </div>
          </div>
        </div>

        <DashboardCharts departmentData={departmentData} trendData={trendData} />
      </div>
    </div>
  );
}
