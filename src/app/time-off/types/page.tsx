import { getLeaveTypes, updateLeaveType, createLeaveType } from '../../../../actions/time-off-admin';
import { Settings, Plus, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

const TAB_STYLE = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all';
const ACTIVE_TAB = 'bg-violet-600 text-white shadow-lg shadow-violet-900/30';
const INACTIVE_TAB = 'text-slate-400 hover:text-white';

const TREATMENT_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Unpaid: 'bg-red-900/30 text-red-400 border-red-500/30',
  Informational: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
};

export default async function TimeOffTypesPage() {
  const leaveTypes = await getLeaveTypes() as any[];

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-900/40 p-1 w-fit">
        <Link href="/time-off/requests" className={`${TAB_STYLE} ${INACTIVE_TAB}`}>Requests</Link>
        <Link href="/time-off/allocations" className={`${TAB_STYLE} ${INACTIVE_TAB}`}>Allocations</Link>
        <Link href="/time-off/types" className={`${TAB_STYLE} ${ACTIVE_TAB}`}>Leave Types</Link>
      </div>

      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Time Off Types</h1>
          <p className="text-sm text-slate-400 mt-1">Configure leave policies, allocation rules, and payroll integration.</p>
        </div>
        <details className="relative">
          <summary className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30 list-none">
            <Plus size={15} /> New Type
          </summary>
          <form
            action={async (fd: FormData) => {
              'use server';
              const treatment = String(fd.get('treatment'));
              await createLeaveType({
                name: String(fd.get('name')),
                code: String(fd.get('code')).toUpperCase(),
                requires_allocation: fd.get('allocation') === 'on',
                is_paid: treatment === 'Paid',
                payroll_treatment: treatment,
              });
            }}
            className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-slate-700/60 bg-slate-900 p-5 space-y-3 shadow-2xl"
          >
            <p className="text-sm font-bold text-white">New Leave Type</p>
            <input required name="name" placeholder="Leave type name" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500" />
            <input required name="code" placeholder="Code (e.g. COMP)" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500" />
            <select name="treatment" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-500">
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Informational</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" name="allocation" defaultChecked className="rounded border-slate-600 bg-slate-800 text-violet-500" />
              Requires allocation balance
            </label>
            <button className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all">Create Leave Type</button>
          </form>
        </details>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-slate-700/60">
            <tr>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name / Code</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payroll Treatment</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requires Allocation</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requires Approval</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Allocations</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {leaveTypes.map((type) => (
              <tr key={type.id} className="hover:bg-violet-900/10 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-500" />
                    <span className="font-semibold text-white text-sm">{type.name}</span>
                    <span className="font-mono text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{type.code}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${TREATMENT_COLORS[type.payroll_treatment] || TREATMENT_COLORS.Informational}`}>
                    {type.payroll_treatment}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  {type.requires_allocation
                    ? <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Yes</span>
                    : <span className="inline-flex items-center gap-1 text-slate-500 text-xs"><XCircle size={13} /> No</span>}
                </td>
                <td className="py-3.5 px-5">
                  {type.requires_approval
                    ? <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Yes</span>
                    : <span className="inline-flex items-center gap-1 text-slate-500 text-xs"><XCircle size={13} /> No</span>}
                </td>
                <td className="py-3.5 px-5 font-mono text-sm text-white">{type.active_allocations}</td>
                <td className="py-3.5 px-5">
                  <details className="relative">
                    <summary className="cursor-pointer text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors list-none">Edit</summary>
                    <form
                      action={async (fd: FormData) => {
                        'use server';
                        await updateLeaveType(String(type.id), {
                          name: String(fd.get('name')),
                          requires_allocation: fd.get('requires_allocation') === 'on',
                          is_paid: fd.get('is_paid') === 'on',
                          payroll_treatment: String(fd.get('payroll_treatment')),
                        });
                      }}
                      className="absolute right-0 z-10 mt-2 w-72 rounded-2xl border border-slate-700/60 bg-slate-900 p-4 space-y-3 shadow-2xl"
                    >
                      <input name="name" defaultValue={type.name} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" />
                      <select name="payroll_treatment" defaultValue={type.payroll_treatment} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-500">
                        <option>Paid</option><option>Unpaid</option><option>Informational</option>
                      </select>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input type="checkbox" name="requires_allocation" defaultChecked={type.requires_allocation} className="rounded border-slate-600 bg-slate-800 text-violet-500" />
                          Allocation
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input type="checkbox" name="is_paid" defaultChecked={type.is_paid} className="rounded border-slate-600 bg-slate-800 text-violet-500" />
                          Paid
                        </label>
                      </div>
                      <button className="w-full rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-all">Save Changes</button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
