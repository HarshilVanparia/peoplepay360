import { getPayruns } from '../../../../actions/payroll';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PayrunList from '../../components/PayrunList';

export default async function PayrunsPage() {
  const payruns = await getPayruns();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Payroll Batches</h1>
          <p className="text-sm text-slate-400 mt-1">Manage grouped payslips for specific payroll periods.</p>
        </div>
        <Link href="/payroll/payruns/new" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30">
          <Plus size={15} /> New Payrun
        </Link>
      </div>

      <PayrunList payruns={payruns as any[]} />
    </div>
  );
}