import { query } from '../../../../lib/db';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function TimeOffRequestsPage() {
  // Fetch requests globally, exposing Employee, Type, Dates, Duration, and Status
  const requests = await query(`
    SELECT r.*, e.first_name, e.last_name, t.name as type_name 
    FROM leave_requests r
    JOIN employees e ON r.employee_id = e.id
    JOIN leave_types t ON r.leave_type_id = t.id
    ORDER BY r.start_date DESC
  `);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Time Off Requests</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          + New Request
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium">Employee</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Dates</th>
              <th className="p-4 font-medium">Duration</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{req.first_name} {req.last_name}</td>
                <td className="p-4 text-gray-500">{req.type_name}</td>
                <td className="p-4">{req.start_date} to {req.end_date}</td>
                <td className="p-4">{req.duration_days} Days</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                   {req.status === 'Pending' && (
                     <>
                        <button className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle size={18} /></button>
                        <button className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle size={18} /></button>
                     </>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}