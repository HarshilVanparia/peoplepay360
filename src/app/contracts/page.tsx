// src/app/contracts/page.tsx
import { getContracts } from '../../../actions/contracts';
import { FileText, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ContractsPage({ searchParams }: { searchParams: { employee?: string } }) {
  const contracts = await getContracts(searchParams.employee);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employment Contracts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Historical agreements and active period wages used for payroll computation.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">
            <Plus size={16} /> New Contract
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Structure</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Wage</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No contract records found. Seed records via MySQL Workbench to populate.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`/employees/${c.employee_id}`} className="font-semibold text-blue-600 hover:underline">
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{c.department}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-400" />
                      {c.salary_structure_name}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {c.start_date} → {c.end_date ?? 'Indefinite'}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      ${Number(c.wage).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        c.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.status === 'Expired'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {c.status === 'Active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}