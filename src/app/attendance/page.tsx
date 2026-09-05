import { getAttendance } from '../../../actions/attendance';

export default async function AttendanceList({ searchParams }: { searchParams: { employee?: string } }) {
  // Global view or filtered by employee from the smart button link[cite: 3]
  const attendance = await getAttendance(searchParams.employee);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium">Employee</th>
              <th className="p-4 font-medium">Check In</th>
              <th className="p-4 font-medium">Check Out</th>
              <th className="p-4 font-medium">Worked Hours</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {attendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{record.first_name} {record.last_name}</td>
                <td className="p-4">{new Date(record.check_in).toLocaleString()}</td>
                <td className="p-4">{record.check_out ? new Date(record.check_out).toLocaleString() : '-'}</td>
                <td className="p-4 font-mono">{record.worked_hours}</td>
                <td className="p-4">
                   <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                     {record.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}