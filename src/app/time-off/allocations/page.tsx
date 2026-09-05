import { getAllocations, approveAllocation, refuseAllocation } from '../../../../actions/time-off-admin';
import { CalendarDays, Check, X, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function TimeOffAllocationsPage() {
  const allocations = await getAllocations();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Module Sub-Navigation */}
        <div className="flex gap-4 border-b border-slate-200 pb-2 mb-6 text-sm font-medium">
          <Link href="/time-off/requests" className="text-slate-500 hover:text-slate-900 pb-2">Requests</Link>
          <Link href="/time-off/allocations" className="text-blue-600 border-b-2 border-blue-600 pb-2">Allocations</Link>
          <Link href="/time-off/types" className="text-slate-500 hover:text-slate-900 pb-2">Leave Types</Link>
        </div>

        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Allocations</h1>
            <p className="text-sm text-slate-500 mt-1">Manage employee balances and validity periods[cite: 1].</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">
            <Plus size={16} /> Assign Allocation
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Validity Period</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Remaining</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((alloc: any) => (
                <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{alloc.first_name} {alloc.last_name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-2">
                    <CalendarDays size={14} className="text-blue-500" /> {alloc.type_name}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                    {alloc.valid_from} &rarr; {alloc.valid_to}
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-slate-800">{alloc.total_days}</td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-emerald-600 bg-emerald-50/50">{alloc.remaining_days}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      alloc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      alloc.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {alloc.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {alloc.status === 'Draft' && (
                      <div className="flex justify-end gap-2">
                         <form action={async () => { "use server"; await approveAllocation(alloc.id); }}>
                           <button type="submit" className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors" title="Approve">
                             <Check size={16} strokeWidth={2.5} />
                           </button>
                         </form>
                         <form action={async () => { "use server"; await refuseAllocation(alloc.id); }}>
                           <button type="submit" className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors" title="Refuse">
                             <X size={16} strokeWidth={2.5} />
                           </button>
                         </form>
                      </div>
                    )}
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