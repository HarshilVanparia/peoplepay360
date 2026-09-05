import { query } from '../../../../../lib/db';
import { FileText, Download, Printer, User, Building, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function PayslipDetailScreen({ params }: { params: { id: string } }) {
  const [payslip] = await query(`
    SELECT ps.*, e.first_name, e.last_name, e.department, e.job_position, e.bank_account_no,
           pr.name as payrun_name, pr.period_start, pr.period_end,
           s.name as structure_name
    FROM payslips ps
    JOIN employees e ON ps.employee_id = e.id
    JOIN payruns pr ON ps.payrun_id = pr.id
    JOIN salary_structures s ON pr.salary_structure_id = s.id
    WHERE ps.id = ?
  `, [params.id]) as any[];

  if (!payslip) return <div className="p-8">Payslip not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payslip: {payslip.first_name} {payslip.last_name}</h1>
            <p className="text-sm text-slate-500 mt-1">{payslip.payrun_name} • {payslip.period_start} to {payslip.period_end}</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium text-sm shadow-sm">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Identity & Context */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Employee Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Department</span> <span className="font-medium">{payslip.department}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Position</span> <span className="font-medium">{payslip.job_position}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bank Account</span> <span className="font-medium">{payslip.bank_account_no || 'Missing'}</span></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Payroll Context</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Structure</span> <span className="font-medium">{payslip.structure_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Worked Days</span> <span className="font-medium">{payslip.worked_days} Days</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span> 
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${payslip.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {payslip.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Computation Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">Salary Computation Breakdown</h3>
            <p className="text-xs text-slate-500 mt-1">Computed rule sequence driving the final net salary.</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-700">Basic Wage</td>
                <td className="py-4 px-6 text-right font-mono text-slate-700">${Number(payslip.basic_wage).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-700">Total Allowances</td>
                <td className="py-4 px-6 text-right font-mono text-emerald-600">+ ${(Number(payslip.gross_salary) - Number(payslip.basic_wage)).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50 bg-slate-50/50">
                <td className="py-4 px-6 font-bold text-slate-900">Gross Salary</td>
                <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">${Number(payslip.gross_salary).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-700">Total Deductions</td>
                <td className="py-4 px-6 text-right font-mono text-red-600">- ${Number(payslip.deductions).toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-900 text-white">
                <td className="py-5 px-6 font-bold text-lg">Net Salary</td>
                <td className="py-5 px-6 text-right font-mono font-bold text-xl">${Number(payslip.net_salary).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}