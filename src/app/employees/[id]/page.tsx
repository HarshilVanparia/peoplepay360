import { getEmployeeHubData } from '../../../../actions/employees';
import { FileText, Clock, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default async function EmployeeHub({ params }: { params: { id: string } }) {
  const { employee, stats } = await getEmployeeHubData(params.id);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Identity Header */}
      <div className="flex items-start justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">{employee.first_name} {employee.last_name}</h1>
          <p className="text-gray-500 text-lg mt-1">{employee.job_position} • {employee.department}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {employee.system_role}
        </span>
      </div>

      {/* Smart Button Action Hub */}
      <div className="grid grid-cols-3 gap-4">
        <Link href={`/contracts?employee=${employee.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <FileText className="text-gray-400" />
            <span className="font-medium">Contracts</span>
          </div>
          <span className="bg-gray-100 px-2 py-1 rounded text-sm">{stats.contractCount}</span>
        </Link>
        <Link href={`/attendance?employee=${employee.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Clock className="text-gray-400" />
            <span className="font-medium">Attendance</span>
          </div>
          <span className="bg-gray-100 px-2 py-1 rounded text-sm">{stats.attendanceCount}</span>
        </Link>
        <Link href={`/time-off?employee=${employee.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-gray-400" />
            <span className="font-medium">Time Off</span>
          </div>
          <span className="bg-gray-100 px-2 py-1 rounded text-sm">{stats.leaveCount}</span>
        </Link>
      </div>

      {/* Basic Form Display */}
      <div className="bg-white border rounded-lg p-6 grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs text-gray-500 uppercase">Email</label>
          <p className="font-medium">{employee.email}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase">Employment Type</label>
          <p className="font-medium">{employee.employment_type}</p>
        </div>
      </div>
    </div>
  );
}