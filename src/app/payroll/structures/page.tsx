import { getSalaryStructures } from '../../../../actions/salary-structures';
import Link from 'next/link';
import { Plus, Layers, Users, Activity } from 'lucide-react';

export default async function SalaryStructuresPage() {
  const structures = await getSalaryStructures();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salary Structures</h1>
            <p className="text-sm text-slate-500 mt-1">Containers for organized collections of Salary Rules.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">
            <Plus size={16} /> New Structure
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Structure Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Rules</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Contracts</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {structures.map((struct) => (
                <tr key={struct.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={`/payroll/structures/${struct.id}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-2">
                      <Layers size={16} className="text-slate-400" /> {struct.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                    {struct.rule_count} Rules
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" /> {struct.active_employees} Employees
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      struct.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <Activity size={12} /> {struct.is_active ? 'Active' : 'Archived'}
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