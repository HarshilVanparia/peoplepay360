import { getEmployees } from '../../../actions/employees';
import Link from 'next/link';
import { Users, Briefcase, Plus, Search, Building } from 'lucide-react';

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Master</h1>
            <p className="text-sm text-gray-500 mt-1">Manage employee profiles, contracts, and employment history.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search employees..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm">
              <Plus size={16} /> New Employee
            </button>
          </div>
        </div>

        {/* Kanban-style Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {employees.map((emp) => (
            <Link href={`/employees/${emp.id}`} key={emp.id} className="block group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-200 group-hover:scale-105 transition-transform">
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{emp.first_name} {emp.last_name}</h3>
                  <p className="text-sm text-gray-500 truncate">{emp.email}</p>
                </div>
                
                <div className="mt-5 space-y-2.5 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={14} className="text-gray-400" />
                    <span className="truncate">{emp.job_position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building size={14} className="text-gray-400" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      Role: {emp.system_role}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}