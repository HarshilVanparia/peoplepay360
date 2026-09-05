import { getSchedules } from '../../../actions/schedules';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ScheduleList from '../components/ScheduleList';

export default async function WorkingSchedulesPage() {
  const schedules = await getSchedules();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Working Schedules</h1>
          <p className="text-sm text-slate-400 mt-1">Define weekly patterns to standardize attendance and payroll expectations.</p>
        </div>
        <Link href="/schedules/new" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30">
          <Plus size={15} /> New Schedule
        </Link>
      </div>

      <ScheduleList schedules={schedules as any[]} />
    </div>
  );
}
