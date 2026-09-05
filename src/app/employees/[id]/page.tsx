import { getEmployeeHubData } from '../../../../actions/employees';
import { FileText, Clock, CalendarDays, Briefcase, Building, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function EmployeeHub({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { employee, stats, pay, balances } = await getEmployeeHubData(id);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/employees" className="hover:text-blue-600">Employees</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{employee.first_name} {employee.last_name}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Working schedule</p><p className="mt-2 font-bold text-lg">{employee.schedule_name || 'Not assigned'}</p><p className="mt-1 text-sm text-slate-500">{employee.employment_type}</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Reporting manager</p><p className="mt-2 font-bold text-lg">{employee.manager_name || 'Not assigned'}</p><p className="mt-1 text-sm text-slate-500">Department {employee.department}</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Banking status</p><p className="mt-2 font-bold text-lg">{employee.bank_account_no ? 'Ready for payroll' : 'Bank details missing'}</p><p className="mt-1 text-sm text-slate-500">{employee.bank_name || 'No bank selected'}</p></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">{balances.map((balance:any)=><div key={balance.name} className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-400">{balance.name}</p><p className="mt-2 text-2xl font-bold">{Number(balance.remaining).toFixed(1)} days</p></div>)}<div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-400">Current salary</p><p className="mt-2 text-2xl font-bold">{pay ? `$${Number(pay.wage).toLocaleString()}` : 'No active contract'}</p><p className="text-xs text-slate-400">{pay?.wage_period || ''}</p></div></div>

        {/* Identity Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-inner border-4 border-blue-50">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-gray-400" /> {employee.job_position}</span>
                <span className="flex items-center gap-1.5"><Building size={16} className="text-gray-400" /> {employee.department}</span>
                <span className="flex items-center gap-1.5"><Mail size={16} className="text-gray-400" /> {employee.email}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${
              employee.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${employee.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              {employee.status}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 uppercase tracking-wider">
              System Role: {employee.system_role}
            </span>
          </div>
        </div>

        {/* Smart Button Action Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href={`/contracts?employee=${employee.id}`} className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 hover:ring-1 hover:ring-blue-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm"><FileText size={22} /></div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Contracts</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Historical & Active</p>
              </div>
            </div>
            <span className="bg-gray-100 text-gray-800 font-bold px-3.5 py-1.5 rounded-lg text-sm group-hover:bg-blue-50 group-hover:text-blue-700">{stats.contractCount}</span>
          </Link>
          
          <Link href={`/attendance?employee=${employee.id}`} className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm"><Clock size={22} /></div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Attendance</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Daily Presence Logs</p>
              </div>
            </div>
            <span className="bg-gray-100 text-gray-800 font-bold px-3.5 py-1.5 rounded-lg text-sm group-hover:bg-indigo-50 group-hover:text-indigo-700">{stats.attendanceCount}</span>
          </Link>

          <Link href={`/time-off/requests?employee=${employee.id}`} className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-teal-400 hover:ring-1 hover:ring-teal-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm"><CalendarDays size={22} /></div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Time Off</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Leaves & Requests</p>
              </div>
            </div>
            <span className="bg-gray-100 text-gray-800 font-bold px-3.5 py-1.5 rounded-lg text-sm group-hover:bg-teal-50 group-hover:text-teal-700">{stats.leaveCount}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
