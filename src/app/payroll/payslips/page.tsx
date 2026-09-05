import { getPayslips } from '../../../../actions/salary-structures';
import Link from 'next/link';
import { FileText, Search } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Validated: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  Computed: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  Draft: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
};

export default async function PayslipsPage({
  searchParams,
}: {
  searchParams: Promise<{ payrun?: string; employee?: string }>;
}) {
  const params = await searchParams;
  const payslips = await getPayslips({ payrunId: params.payrun, employeeId: params.employee }) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Payslips</h1>
          <p className="text-sm text-slate-400 mt-1">All generated payslips across payroll batches.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        {payslips.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p>No payslips found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payrun</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Period</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gross</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {payslips.map(p => (
                <tr key={p.id} className="hover:bg-violet-900/10 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-white text-sm">{p.first_name} {p.last_name}</td>
                  <td className="py-3.5 px-5 text-sm text-slate-400">
                    <Link href={`/payroll/payruns/${p.payrun_id}`} className="hover:text-violet-300 transition-colors">
                      {p.payrun_name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-sm text-slate-400 font-mono">{p.period_start} to {p.period_end}</td>
                  <td className="py-3.5 px-5 text-sm font-mono text-slate-300">${Number(p.gross_salary).toFixed(2)}</td>
                  <td className="py-3.5 px-5 text-sm font-mono font-bold text-emerald-400">${Number(p.net_salary).toFixed(2)}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[p.status] || STATUS_COLORS.Draft}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <Link href={`/payroll/payslips/${p.id}`} className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-slate-600 text-right">{payslips.length} payslips</p>
    </div>
  );
}
