import { getAttendance } from '../../../actions/attendance';
import { Clock, Filter, Download } from 'lucide-react';

export default async function AttendanceList({ searchParams }: { searchParams: { employee?: string } }) {
  const attendance = await getAttendance(searchParams.employee);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Records</h1>
            <p className="text-sm text-gray-500 mt-1">Review check-in, check-out, and worked hours[cite: 1].</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Worked Hours</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900">{record.first_name} {record.last_name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(record.check_in).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {record.check_out ? new Date(record.check_out).toLocaleString([], { timeStyle: 'short' }) : <span className="text-gray-400 italic">Missing</span>}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-gray-800 font-medium">
                    {record.worked_hours}h
                  </td>
                  <td className="py-4 px-6">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                       record.status === 'Normal' ? 'bg-green-50 text-green-700 border-green-200' :
                       record.status === 'Late' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                       'bg-blue-50 text-blue-700 border-blue-200'
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