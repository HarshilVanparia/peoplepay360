import { query } from '../../../../lib/db';
import { Check, X, Calendar, Plus } from 'lucide-react';
import { approveTimeOffRequest } from '../../../../actions/time-off';
import { revalidatePath } from 'next/cache';

export default async function TimeOffRequestsPage() {
  const requests = await query(`
    SELECT r.*, e.first_name, e.last_name, t.name as type_name 
    FROM leave_requests r
    JOIN employees e ON r.employee_id = e.id
    JOIN leave_types t ON r.leave_type_id = t.id
    ORDER BY r.start_date DESC
  `);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Time Off Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Approve or refuse leave requests linked to allocations[cite: 1].</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm">
            <Plus size={16} /> New Request
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{req.first_name} {req.last_name}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> {req.type_name}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{req.duration_days} Days</span>
                    <div className="text-xs text-gray-500 mt-0.5">{req.start_date} → {req.end_date}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                      req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                     {req.status === 'Pending' && (
                       <div className="flex justify-end gap-2">
                          <form action={async () => { 
                            "use server"; 
                            await approveTimeOffRequest(req.id, req.employee_id, req.leave_type_id, req.duration_days); 
                          }}>
                            <button type="submit" className="p-2 text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors shadow-sm" title="Approve">
                              <Check size={16} strokeWidth={2.5} />
                            </button>
                          </form>
                          <form action={async () => {
                             "use server";
                             await query(`UPDATE leave_requests SET status = 'Refused' WHERE id = ?`, [req.id]);
                             revalidatePath('/time-off/requests');
                          }}>
                            <button type="submit" className="p-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-sm" title="Reject">
                              <X size={16} strokeWidth={2.5} />
                            </button>
                          </form>
                       </div>
                     )}
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