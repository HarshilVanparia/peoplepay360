import { getSalaryStructures, createSalaryStructure, toggleSalaryStructure } from '../../../../actions/salary-structures';
import Link from 'next/link';
import { Plus, Layers, Users, Activity } from 'lucide-react';

export default async function SalaryStructuresPage() {
  const structures = await getSalaryStructures() as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Salary Structures</h1>
          <p className="text-sm text-slate-400 mt-1">Containers for organized collections of Salary Rules. Select a structure on a Payrun to apply its rules.</p>
        </div>
        <details className="relative">
          <summary className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30 list-none">
            <Plus size={15} /> New Structure
          </summary>
          <form
            action={async (fd: FormData) => {
              'use server';
              await createSalaryStructure({ name: String(fd.get('name')) });
            }}
            className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-700/60 bg-slate-900 p-5 space-y-3 shadow-2xl"
          >
            <p className="text-sm font-bold text-white">New Salary Structure</p>
            <input
              required
              name="name"
              placeholder="e.g. Standard Monthly Salary"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500"
            />
            <p className="text-xs text-slate-500">After creating, open the structure to add salary rules.</p>
            <button className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all">Create Structure</button>
          </form>
        </details>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        {structures.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Layers size={32} className="mx-auto mb-3 opacity-40" />
            <p>No salary structures yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Structure Name</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rules</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Contracts</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {structures.map((s) => (
                <tr key={s.id} className="hover:bg-violet-900/10 transition-colors">
                  <td className="py-3.5 px-5">
                    <Link href={`/payroll/structures/${s.id}`} className="flex items-center gap-2 font-semibold text-white hover:text-violet-300 transition-colors">
                      <Layers size={14} className="text-violet-400 shrink-0" />
                      {s.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-sm text-slate-300">{s.rule_count} rules</td>
                  <td className="py-3.5 px-5">
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Users size={13} className="text-slate-600" />
                      {s.active_employees} employees
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.is_active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/60 text-slate-500 border-slate-600/40'}`}>
                      <Activity size={10} />
                      {s.is_active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <form action={async () => { 'use server'; await toggleSalaryStructure(String(s.id), !s.is_active); }}>
                      <button type="submit" className="text-xs text-slate-500 hover:text-violet-300 font-semibold transition-colors">
                        {s.is_active ? 'Archive' : 'Activate'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}