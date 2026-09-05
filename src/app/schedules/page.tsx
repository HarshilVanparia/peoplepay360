import { getSchedules } from '../../../actions/schedules';
import { Clock, Calendar, Users, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function WorkingSchedulesPage() {
  const schedules = await getSchedules();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Working Schedules</h1>
            <p className="text-sm text-slate-500 mt-1">Define weekly patterns to standardize attendance and payroll expectations[cite: 2].</p>
          </div>
          <Link href="/schedules/new" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">
            <Plus size={16} /> New Schedule
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Weekly Hours</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((schedule: any) => (
                <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" /> {schedule.name}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-violet-300 font-medium">{schedule.schedule_type}</td>
                  <td className="py-4 px-6 font-mono text-sm text-slate-800 font-bold flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" /> {Number(schedule.weekly_hours).toFixed(2)}h
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {schedule.assigned_employees} Employees</span>
                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500" title={schedule.assigned_employee_names || ''}>{schedule.assigned_employee_names || 'No employees assigned'}</p>
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
