import { getAttendance } from '../../../actions/attendance';
import { Clock, Filter, Download, Edit } from 'lucide-react';
import Link from 'next/link';

export default async function AttendanceList({ searchParams }: { searchParams: { employee?: string } }) {
  const attendance = await getAttendance(searchParams.employee);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Records</h1>
            <p className="text-sm text-slate-500 mt-1">Review check-in, check-out, and worked hours.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/attendance/new" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-sm font-medium">
              <Edit size={16} /> Log Manual Entry
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Worked Hours</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((record: any) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold">
                    <Link href={`/attendance/${record.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                       {record.first_name} {record.last_name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(record.check_in).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {record.check_out ? new Date(record.check_out).toLocaleString([], { timeStyle: 'short' }) : <span className="text-slate-400 italic">Missing</span>}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-slate-800 font-medium">
                    {record.worked_hours}h
                  </td>
                  <td className="py-4 px-6">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                       record.status === 'Normal' ? 'bg-green-50 text-green-700 border-green-200' :
                       record.status === 'Manual Correction' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                       'bg-orange-50 text-orange-700 border-orange-200'
                     }`}>
                       {record.status}
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