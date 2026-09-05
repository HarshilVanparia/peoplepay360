import { getEmployees } from '../../../actions/employees';
import Link from 'next/link';
import { Users, Briefcase } from 'lucide-react';

export default async function EmployeesPage() {
  const employees = await getEmployees();

  // Kanban and List view hybrid foundation
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Employee Master</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          + New Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {employees.map((emp) => (
          <Link href={`/employees/${emp.id}`} key={emp.id}>
            <div className="border rounded-lg p-5 hover:shadow-md transition bg-white cursor-pointer group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {emp.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p className="flex items-center gap-2"><Briefcase size={14} /> {emp.job_position}</p>
                <p className="truncate">{emp.email}</p>
                <p className="text-xs text-gray-400 mt-2 border-t pt-2">Role: {emp.system_role}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}