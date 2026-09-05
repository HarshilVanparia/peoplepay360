import { getPayruns } from '../../../../actions/payroll';
import Link from 'next/link';
import { Plus, Banknote, Calendar } from 'lucide-react';

export default async function PayrunsPage() {
  const payruns = await getPayruns();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll Batches</h1>
            <p className="text-sm text-slate-500 mt-1">Manage grouped payslips for specific payroll periods[cite: 2].</p>
          </div>
          <Link href="/payroll/payruns/new" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">
            <Plus size={16} /> New Payrun
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Structure</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Payslips</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payruns.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={`/payroll/payruns/${pr.id}`} className="font-semibold text-blue-600 hover:underline">
                      {pr.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{pr.structure_name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {pr.period_start} to {pr.period_end}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-slate-800">{pr.payslip_count}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      pr.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      pr.status === 'Validated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {pr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}