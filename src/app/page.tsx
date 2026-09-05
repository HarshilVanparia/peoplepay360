import { query } from '../../lib/db';
import { Users, Banknote, CalendarDays, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function PayrollDashboard() {
  // Aggregate live metrics via relational joins[cite: 3]
  const [metrics] = await query(`
    SELECT 
      (SELECT COUNT(*) FROM employees WHERE status = 'Active') as active_employees,
      (SELECT SUM(net_salary) FROM payslips WHERE status IN ('Validated', 'Paid')) as total_paid,
      (SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending') as pending_leaves,
      (SELECT COUNT(*) FROM payslips p JOIN employees e ON p.employee_id = e.id WHERE e.bank_account_no IS NULL OR p.has_warning = TRUE) as anomalies
  `) as any[];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operational Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live metrics across HR, attendance, and payroll operations[cite: 3].</p>
        </div>

        {/* KPI Cards */}
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
              <p className="text-sm font-medium text-slate-500">Pre-Payroll Anomalies</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.anomalies}</p>
            </div>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Required Actions</h2>
          {metrics.anomalies > 0 && (
            <div className="flex items-center justify-between p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 mb-3">
              <span className="font-medium flex items-center gap-2"><AlertTriangle size={18} /> Missing Bank Details detected in Draft Payslips.</span>
              <Link href="/payroll/payruns" className="text-sm font-bold hover:underline">Review Payruns &rarr;</Link>
            </div>
          )}
          {metrics.pending_leaves > 0 && (
            <div className="flex items-center justify-between p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
              <span className="font-medium flex items-center gap-2"><CalendarDays size={18} /> {metrics.pending_leaves} Time Off requests require approval.</span>
              <Link href="/time-off/requests" className="text-sm font-bold hover:underline">Review Requests &rarr;</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}