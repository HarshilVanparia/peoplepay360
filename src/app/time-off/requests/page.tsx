import { query } from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import TimeOffRequestsTable from '../../components/TimeOffRequestsTable'

const TAB_STYLE = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all'
const ACTIVE_TAB = 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
const INACTIVE_TAB = 'text-slate-400 hover:text-white'

export default async function TimeOffRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; status?: string }>
}) {
  const params = await searchParams
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  const canManage = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)
  const employeeId = (session?.user as any)?.id

  const conds: string[] = []
  const vals: any[] = []
  if (!canManage) {
    conds.push('r.employee_id = ?')
    vals.push(employeeId)
  } else if (params.employee) {
    conds.push('r.employee_id = ?')
    vals.push(params.employee)
  }

  const requests = await query(`
    SELECT r.*, e.first_name, e.last_name, t.name as type_name
    FROM leave_requests r
    JOIN employees e ON r.employee_id = e.id
    JOIN leave_types t ON r.leave_type_id = t.id
    ${conds.length ? `WHERE ${conds.join(' AND ')}` : ''}
    ORDER BY r.start_date DESC
  `, vals) as any[]

  return (
    <div className="space-y-6">
      {/* Sub-navigation for HR */}
      {canManage && (
        <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-900/40 p-1 w-fit">
          <Link href="/time-off/requests" className={`${TAB_STYLE} ${ACTIVE_TAB}`}>Requests</Link>
          <Link href="/time-off/allocations" className={`${TAB_STYLE} ${INACTIVE_TAB}`}>Allocations</Link>
          <Link href="/time-off/types" className={`${TAB_STYLE} ${INACTIVE_TAB}`}>Leave Types</Link>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">Time Off Requests</h1>
          <p className="text-sm text-slate-400 mt-1">
            {canManage ? 'Approve or refuse leave requests linked to allocations.' : 'Submit and track your leave requests.'}
          </p>
        </div>
        <Link
          href="/time-off/requests/new"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30"
        >
          <Plus size={14} /> New Request
        </Link>
      </div>

      <TimeOffRequestsTable requests={requests} canManage={canManage} />
    </div>
  )
}
