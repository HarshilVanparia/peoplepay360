import { query } from '../../lib/db';
import { Users, Banknote, CalendarDays, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { DashboardCharts } from './components/DashboardCharts';

export default async function PayrollDashboard() {
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