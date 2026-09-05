import { getLeaveTypes, updateLeaveType, createLeaveType } from '../../../../actions/time-off-admin';
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
          <details><summary className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm shadow-sm"><Plus size={16} /> New Type</summary><form action={async(formData)=>{'use server';const treatment=String(formData.get('treatment'));await createLeaveType({name:String(formData.get('name')),code:String(formData.get('code')).toUpperCase(),requires_allocation:formData.get('allocation')==='on',is_paid:treatment==='Paid',payroll_treatment:treatment})}} className="absolute right-8 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-slate-900 p-4 space-y-2"><input required name="name" placeholder="Leave type name" className="w-full rounded p-2"/><input required name="code" placeholder="Code e.g. COMP" className="w-full rounded p-2"/><select name="treatment" className="w-full rounded p-2"><option>Paid</option><option>Unpaid</option><option>Informational</option></select><label className="text-sm"><input type="checkbox" name="allocation" defaultChecked/> Fixed allocation required</label><button className="w-full rounded bg-violet-600 p-2">Create leave type</button></form></details>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Policy Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Requires Allocation</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Allocations</th><th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Edit</th>
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
                  <td className="py-4 px-6"><details><summary className="cursor-pointer text-violet-300 text-sm">Edit</summary><form action={async(formData)=>{'use server';await updateLeaveType(String(type.id),{name:String(formData.get('name')),requires_allocation:formData.get('requires_allocation')==='on',is_paid:formData.get('is_paid')==='on',payroll_treatment:String(formData.get('payroll_treatment'))})}} className="mt-2 flex gap-2"><input name="name" defaultValue={type.name} className="w-32 rounded p-1 text-xs"/><label className="text-xs"><input name="requires_allocation" defaultChecked={type.requires_allocation} type="checkbox"/> allocation</label><label className="text-xs"><input name="is_paid" defaultChecked={type.is_paid} type="checkbox"/> paid</label><select name="payroll_treatment" defaultValue={type.payroll_treatment} className="rounded text-xs"><option>Paid</option><option>Unpaid</option><option>Informational</option></select><button className="text-xs text-violet-300">Save</button></form></details></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
