import { getAttendance, getMyAttendanceStatus } from '../../../actions/attendance';
import { Edit, Clock } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import EmployeeClockWidget from '../components/EmployeeClockWidget';
import AttendanceTable from '../components/AttendanceTable';

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ employee?: string }> }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isEmployee = (session?.user as any)?.role === 'Employee';

  if (isEmployee) {
    const [attendance, clockStatus] = await Promise.all([
      getAttendance(),
      getMyAttendanceStatus(),
    ]);
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
          <p className="text-xs tracking-[.2em] text-violet-300 mb-1">MY WORKSPACE</p>
          <h1 className="text-2xl font-bold text-white">My Attendance</h1>
          <p className="text-sm text-slate-400 mt-1">Track your check-ins, check-outs and full history.</p>
        </div>
        <EmployeeClockWidget
          isClockedIn={clockStatus.isClockedIn}
          lastRecord={clockStatus.lastRecord as any}
          history={attendance as any[]}
          firstName={(session?.user?.name || '').split(' ')[0]}
        />
      </div>
    );
  }

  // HR / Admin / Payroll view
  const attendance = await getAttendance(params.employee);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Records</h1>
          <p className="text-sm text-slate-400 mt-1">Review check-in, check-out and worked hours. Search, filter and export.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/attendance/new"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition-all"
          >
            <Edit size={15} /> Log Manual Entry
          </Link>
        </div>
      </div>

      <AttendanceTable records={attendance as any[]} />
    </div>
  );
}
