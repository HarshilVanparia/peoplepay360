import { getLeaveTypes } from '../../../../actions/time-off-admin';
import { Settings, Plus, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function TimeOffTypesPage() {
  const leaveTypes = await getLeaveTypes();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Module Sub-Navigation */}
        <div className="flex gap-4 border-b border-slate-200 pb-2 mb-6 text-sm font-medium">
          <Link href="/time-off/requests" className="text-slate-500 hover:text-slate-900 pb-2">Requests</Link>
          <Link href="/time-off/allocations" className="text-slate-500 hover:text-slate-900 pb-2">Allocations</Link>
          <Link href="/time-off/types" className="text-blue-600 border-b-2 border-blue-600 pb-2">Leave Types</Link>
        </div>

        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time Off Types</h1>
            <p className="text-sm text-slate-500 mt-1">Configure leave policies and allocation rules[cite: 1].</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">
            <Plus size={16} /> New Type
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Policy Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Requires Allocation</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Allocations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveTypes.map((type: any) => (
                <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                    <Settings size={16} className="text-slate-400" /> {type.name}
                  </td>
                  <td className="py-4 px-6">
                    {type.requires_allocation ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                        <CheckCircle2 size={14} /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                        <XCircle size={14} /> No
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-slate-700">{type.active_allocations} Employees</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}